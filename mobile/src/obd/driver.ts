import { ObdError, parseClearResponse, parseDtc, parseSupportedPids, parseVoltage, responseLines } from './protocol.ts';
import { validateDiagnosticSnapshot } from './types.ts';
import type { CommandTransport, DiagnosticSnapshot, Dtc, LiveParameters } from './types.ts';
import {EcuSelectionRequired,parseProtocol,parseCanMessages,requestIdFor} from './can.ts';
import type {CanEcu,CanProtocol} from './can.ts';
import {parseObdVin} from '../vin.ts';
import type {VinObservation} from '../vin.ts';
import { decodeMeasurement, parameterByPid, parameterDefinitions, parseScalingConfiguration, pidHex } from './parameters.ts';
import type { ObdMeasurement, ParameterScaling } from './parameters.ts';
import { parseReadiness } from './readiness.ts';
import { parseFreezeDtc } from './details.ts';
import type { DiagnosticDetails, FreezeFrame } from './details.ts';

export type ClearFaultOptions = { confirmed: boolean; backedUpSnapshot: DiagnosticSnapshot; vehicleId: string; tripRecording?: boolean };
export type ClearFaultResult = { acknowledged: true; rawResponse: string; timestamp: number; backupSnapshotId: string };
export type DiagnosticProgress = { stage: 'capabilities' | 'parameters' | 'faults' | 'readiness' | 'freeze-frame'; completed: number; total: number };
export type ScanOptions = { extended?: boolean; onProgress?: (progress: DiagnosticProgress) => void };
let sequence = 0;
export class Elm327Driver {
  private transport: CommandTransport;
  private adapterName: string;
  private initialized = false;
  private busy = false;
  private lastSnapshot: string | null = null;
  private liveContext: { vehicleId: string; supportedPids: number[] } | null = null;
  private scaling: ParameterScaling = {};
  private canProtocol:CanProtocol|null|undefined;
  private ecus:CanEcu[]=[];
  private selectedEcu:CanEcu|null=null;
  constructor(transport: CommandTransport, adapterName: string) { this.transport = transport; this.adapterName = adapterName; }
  private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    if (this.busy) throw new ObdError('Another OBD operation is still running');
    this.busy = true;
    try { return await operation(); } finally { this.busy = false; }
  }
  async initialize(): Promise<void> {
    return this.exclusive(async () => {
      this.initialized = false;
      this.lastSnapshot = null;
      this.liveContext = null;
      this.scaling = {};
      this.canProtocol=undefined;this.ecus=[];this.selectedEcu=null;
      const reset = responseLines(await this.transport.send('ATZ'), 'ATZ');
      if (reset.length !== 1 || !/^ELM327\b/.test(reset[0])) throw new ObdError('Adapter did not identify as ELM327');
      for (const command of ['ATE0', 'ATL0', 'ATS1', 'ATH0', 'ATCAF1', 'ATSP0']) {
        const lines = responseLines(await this.transport.send(command), command);
        if (lines.length !== 1 || lines[0] !== 'OK') throw new ObdError(`ELM327 did not accept ${command}`);
      }
      this.initialized = true;
    });
  }
  private async configure(command:string){
    const lines=responseLines(await this.transport.send(command),command);
    if(lines.length!==1||lines[0]!=='OK')throw new ObdError(`Adapter nie potwierdził ${command}.`);
  }
  private async applyEcu(ecu:CanEcu){
    this.lastSnapshot=null;this.liveContext=null;this.scaling={};this.selectedEcu=null;
    try{await this.configure(`ATSH${requestIdFor(ecu)}`);await this.configure(`ATCRA${ecu.responseId}`);this.selectedEcu={...ecu};}
    catch(error){this.initialized=false;throw error;}
  }
  async selectEcu(responseId:string):Promise<void>{
    return this.exclusive(async()=>{
      if(!this.initialized)throw new ObdError('Najpierw ponownie połącz adapter.');
      const ecu=this.ecus.find(candidate=>candidate.responseId===responseId);
      if(!ecu)throw new ObdError('Wybierz sterownik z rzeczywistego odczytu.','unsupported');
      await this.applyEcu(ecu);
    });
  }
  async readVin(vehicleId:string):Promise<VinObservation>{
    return this.exclusive(async()=>{
      if(!this.initialized||!this.canProtocol||!this.selectedEcu)throw new ObdError('Najpierw wykonaj odczyt CAN i wybierz sterownik.','unsupported');
      if(!vehicleId.trim()||vehicleId.length>200)throw new ObdError('Wybierz samochód.');
      const vin=parseObdVin(this.payload(await this.transport.send('0902'),'0902'));
      return {vin,vehicleId,source:'obd',timestamp:Date.now(),adapterName:this.adapterName,ecu:{...this.selectedEcu}};
    });
  }
  private payload(raw:string,command:string):string{
    if(!this.canProtocol)return raw;
    if(!this.selectedEcu)throw new EcuSelectionRequired(this.ecus);
    const messages=parseCanMessages(raw,command,this.canProtocol);
    if(messages.length!==1||messages[0].responseId!==this.selectedEcu.responseId)throw new ObdError('Odpowiedział inny sterownik niż wybrany.','ambiguous');
    return messages[0].payload.map(byte=>byte.toString(16).padStart(2,'0')).join(' ')+'>';
  }
  private async pidStart():Promise<string>{
    if(this.canProtocol===undefined){
      // 0100 connects the auto-selected protocol before ATDPN is meaningful.
      const initial=await this.transport.send('0100');responseLines(initial,'0100');
      const protocol=parseProtocol(await this.transport.send('ATDPN'));
      if(![6,7,8,9].includes(protocol)){this.canProtocol=null;return initial;}
      try{await this.configure('ATH1');await this.configure('ATD0');await this.configure('ATCFC1');}
      catch(error){this.initialized=false;throw error;}
      const canProtocol=protocol as CanProtocol;
      const messages=parseCanMessages(await this.transport.send('0100'),'0100',canProtocol);
      for(const message of messages)parseSupportedPids(message.payload.map(byte=>byte.toString(16).padStart(2,'0')).join(' ') + '>');
      this.ecus=messages.map(message=>({protocol:canProtocol,responseId:message.responseId}));this.canProtocol=canProtocol;
      if(this.ecus.length===1)await this.applyEcu(this.ecus[0]);
    }
    if(this.canProtocol&&!this.selectedEcu)throw new EcuSelectionRequired(this.ecus);
    return this.payload(await this.transport.send('0100'),'0100');
  }
  private scalingCopy(): ParameterScaling {
    return Object.fromEntries(Object.entries(this.scaling).map(([key, value]) => [key, value === null ? null : [...value]])) as ParameterScaling;
  }
  private async supportedPids(mode: 1 | 2, initial?: string): Promise<number[]> {
    const command = `0${mode}00${mode === 2 ? '00' : ''}`;
    const pids = parseSupportedPids(initial ?? this.payload(await this.transport.send(command), command), 0, mode);
    for (let page = 32; page <= 224 && pids.includes(page); page += 32) {
      const command = `0${mode}${pidHex(page)}${mode === 2 ? '00' : ''}`;
      pids.push(...parseSupportedPids(this.payload(await this.transport.send(command), command), page, mode));
    }
    return pids;
  }
  private async readScaling(supportedPids: number[]): Promise<void> {
    this.scaling = {};
    for (const [pid, key] of [[0x4F, 'pid4f'], [0x50, 'pid50']] as const) {
      if (!supportedPids.includes(pid)) continue;
      const command = `01${pidHex(pid)}`;
      try { this.scaling[key] = parseScalingConfiguration(this.payload(await this.transport.send(command), command), pid); }
      catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; this.scaling[key] = null; }
    }
  }
  private async readMeasurements(supportedPids: number[], requested: readonly number[], mode: 1 | 2 = 1, progress?: (completed: number, total: number) => void): Promise<ObdMeasurement[]> {
    const readings: ObdMeasurement[] = [];
    const total = requested.filter(pid => supportedPids.includes(pid)).length;
    progress?.(0, total);
    for (const pid of requested) {
      if (!supportedPids.includes(pid)) continue;
      const command = `0${mode}${pidHex(pid)}${mode === 2 ? '00' : ''}`;
      let value: number | null = null;
      try { value = decodeMeasurement(this.payload(await this.transport.send(command), command), pid, mode, this.scaling); }
      catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; }
      readings.push({ pid, value, readAt: Date.now() });
      progress?.(readings.length, total);
    }
    return readings;
  }
  private async readParameters(supportedPids: number[], requested: readonly number[] = [12, 5, 4], progress?: (completed: number, total: number) => void): Promise<{ parameters: DiagnosticSnapshot['parameters']; measurements: ObdMeasurement[] }> {
    const measurements = await this.readMeasurements(supportedPids, requested, 1, (completed, total) => progress?.(completed, total + 1));
    const value = (pid: number) => measurements.find(reading => reading.pid === pid)?.value ?? null;
    const parameters: DiagnosticSnapshot['parameters'] = { rpm: value(12), coolantC: value(5), loadPercent: value(4), voltageV: null };
    try { parameters.voltageV = parseVoltage(await this.transport.send('ATRV')); }
    catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; }
    progress?.(measurements.length + 1, measurements.length + 1);
    return { parameters, measurements };
  }
  private async readFreezeFrame(progress?: (completed: number, total: number) => void): Promise<FreezeFrame> {
    let code: string | null;
    try { code = parseFreezeDtc(this.payload(await this.transport.send('020200'), '020200')); }
    catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; return { status: 'no-data', frame: 0, readAt: Date.now() }; }
    const readAt = Date.now();
    if (code === null) return { status: 'no-frame', frame: 0, readAt };
    let supportedPids: number[] | null;
    try { supportedPids = await this.supportedPids(2); }
    catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; supportedPids = null; }
    const measurements = supportedPids === null ? [] : await this.readMeasurements(supportedPids, parameterDefinitions.map(p => p.pid), 2, progress);
    if (measurements.length) {
      const after = parseFreezeDtc(this.payload(await this.transport.send('020200'), '020200'));
      if (after !== code) throw new ObdError('Freeze frame changed during collection; repeat the scan');
    }
    return { status: 'available', frame: 0, readAt, code, supportedPids, measurements };
  }
  async readLiveParameters(vehicleId: string, selectedPids?: readonly number[]): Promise<LiveParameters> {
    return this.exclusive(async () => {
      if (!this.initialized || !this.liveContext || this.liveContext.vehicleId !== vehicleId) throw new ObdError('Najpierw wykonaj pełny odczyt dla wybranego samochodu.');
      if (selectedPids !== undefined && (!Array.isArray(selectedPids) || selectedPids.length > 8 || new Set(selectedPids).size !== selectedPids.length || selectedPids.some(pid => !parameterByPid(pid) || !this.liveContext!.supportedPids.includes(pid)))) throw new ObdError('Wybierz maksymalnie 8 wspieranych parametrów.', 'unsupported');
      this.lastSnapshot = null;
      const { parameters, measurements } = await this.readParameters(this.liveContext.supportedPids, selectedPids);
      return { vehicleId, timestamp: Date.now(), adapterName: this.adapterName, parameters, measurements, scaling: this.scalingCopy(), ...(this.selectedEcu ? { ecu: { ...this.selectedEcu } } : {}) };
    });
  }
  async readSnapshot(vehicleId: string, options: ScanOptions = {}): Promise<DiagnosticSnapshot> {
    return this.exclusive(async () => {
      if (!this.initialized) throw new ObdError('Initialize adapter before reading');
      if (!vehicleId.trim() || vehicleId.length > 200) throw new ObdError('A vehicle is required');
      this.lastSnapshot = null;
      this.liveContext = null;
      const notify = (stage: DiagnosticProgress['stage'], completed = 0, total = 0) => options.onProgress?.({ stage, completed, total });
      notify('capabilities');
      const supportedPids = await this.supportedPids(1, await this.pidStart());
      await this.readScaling(supportedPids);
      notify('capabilities', 1, 1);
      const { parameters, measurements } = await this.readParameters(supportedPids, options.extended ? parameterDefinitions.map(p => p.pid) : undefined, (completed, total) => notify('parameters', completed, total));
      const codes: Dtc[] = [];
      const readStatuses: Dtc['status'][] = [];
      let faultProgress = 0;
      notify('faults', 0, 3);
      for (const [mode, status] of [['03', 'stored'], ['07', 'pending'], ['0A', 'permanent']] as const) {
        try { codes.push(...parseDtc(this.payload(await this.transport.send(mode),mode), mode,this.canProtocol?'can':'auto')); readStatuses.push(status); }
        catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; }
        notify('faults', ++faultProgress, 3);
      }
      if (!readStatuses.length) throw new ObdError('No diagnostic fault mode returned data', 'no-data');
      let extended: DiagnosticDetails | undefined;
      if (options.extended) {
        let readiness = null;
        notify('readiness');
        if (supportedPids.includes(1)) {
          try { readiness = parseReadiness(this.payload(await this.transport.send('0101'), '0101')); }
          catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; }
        }
        notify('readiness', supportedPids.includes(1) ? 1 : 0, supportedPids.includes(1) ? 1 : 0);
        notify('freeze-frame');
        extended = { version: 1, measurements, scaling: this.scalingCopy(), readiness, freezeFrame: await this.readFreezeFrame((completed, total) => notify('freeze-frame', completed, total)) };
      }
      const timestamp = Date.now();
      const snapshot: DiagnosticSnapshot = { id: `obd-${timestamp}-${++sequence}-${Math.random().toString(36).slice(2, 9)}`, vehicleId, timestamp, source: 'obd', adapterName: this.adapterName, codes, readStatuses, parameters, supportedPids };
      if(this.selectedEcu)snapshot.ecu={...this.selectedEcu};
      if(extended)snapshot.extended=extended;
      if (!validateDiagnosticSnapshot(snapshot)) throw new ObdError('Invalid diagnostic snapshot');
      this.lastSnapshot = JSON.stringify(snapshot);
      this.liveContext = { vehicleId, supportedPids: [...supportedPids] };
      return snapshot;
    });
  }
  async clearFaults(options: ClearFaultOptions): Promise<ClearFaultResult> {
    return this.exclusive(async () => {
      const backup = options.backedUpSnapshot;
      if (!this.initialized || options.confirmed !== true || options.tripRecording === true || !validateDiagnosticSnapshot(backup) || backup.source !== 'obd' || backup.vehicleId !== options.vehicleId || this.lastSnapshot !== JSON.stringify(backup)) throw new ObdError('Confirm clearing after backing up the current vehicle report; stop trip recording first', 'confirmation');
      // Invalidate before sending: a timeout may still mean the destructive command reached the ECU.
      this.lastSnapshot = null;
      this.liveContext = null;
      const rawResponse = await this.transport.send('04');
      parseClearResponse(this.payload(rawResponse,'04'));
      return { acknowledged: true, rawResponse, timestamp: Date.now(), backupSnapshotId: backup.id };
    });
  }
}
