import { ObdError, parseClearResponse, parseDtc, parsePid, parseSupportedPids, parseVoltage, responseLines } from './protocol.ts';
import { validateDiagnosticSnapshot } from './types.ts';
import type { CommandTransport, DiagnosticSnapshot, Dtc, LiveParameters } from './types.ts';
import {EcuSelectionRequired,parseProtocol,parseCanMessages,requestIdFor} from './can.ts';
import type {CanEcu,CanProtocol} from './can.ts';
import {parseObdVin} from '../vin.ts';
import type {VinObservation} from '../vin.ts';
import {parseReadinessStatus,parseClearCounter} from './readiness.ts';
import type {ReadinessData} from './readiness.ts';

export type ClearFaultOptions = { confirmed: boolean; backedUpSnapshot: DiagnosticSnapshot; vehicleId: string; tripRecording?: boolean };
export type ClearFaultResult = { acknowledged: true; rawResponse: string; timestamp: number; backupSnapshotId: string };
let sequence = 0;
export class Elm327Driver {
  private transport: CommandTransport;
  private adapterName: string;
  private initialized = false;
  private busy = false;
  private lastSnapshot: string | null = null;
  private liveContext: { vehicleId: string; supportedPids: number[] } | null = null;
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
    this.lastSnapshot=null;this.liveContext=null;this.selectedEcu=null;
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
  private async readParameters(supportedPids: number[]): Promise<DiagnosticSnapshot['parameters']> {
      const parameters: DiagnosticSnapshot['parameters'] = { rpm: null, coolantC: null, loadPercent: null, voltageV: null };
      for (const [pid, command, key] of [[12, '010C', 'rpm'], [5, '0105', 'coolantC'], [4, '0104', 'loadPercent']] as const) {
        if (!supportedPids.includes(pid)) continue;
        try { parameters[key] = parsePid(this.payload(await this.transport.send(command),command), command); }
        catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; }
      }
      try { parameters.voltageV = parseVoltage(await this.transport.send('ATRV')); }
      catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; }
      return parameters;
  }
  async readLiveParameters(vehicleId: string): Promise<LiveParameters> {
    return this.exclusive(async () => {
      if (!this.initialized || !this.liveContext || this.liveContext.vehicleId !== vehicleId) throw new ObdError('Najpierw wykonaj pełny odczyt dla wybranego samochodu.');
      this.lastSnapshot = null;
      const parameters = await this.readParameters(this.liveContext.supportedPids);
      return { vehicleId, timestamp: Date.now(), adapterName: this.adapterName, parameters, ...(this.selectedEcu ? { ecu: { ...this.selectedEcu } } : {}) };
    });
  }
  async readSnapshot(vehicleId: string): Promise<DiagnosticSnapshot> {
    return this.exclusive(async () => {
      if (!this.initialized) throw new ObdError('Initialize adapter before reading');
      if (!vehicleId.trim() || vehicleId.length > 200) throw new ObdError('A vehicle is required');
      this.lastSnapshot = null;
      this.liveContext = null;
      const supportedPids = parseSupportedPids(await this.pidStart());
      if (supportedPids.includes(32)) supportedPids.push(...parseSupportedPids(this.payload(await this.transport.send('0120'),'0120'), 32));
      if (supportedPids.includes(64)) supportedPids.push(...parseSupportedPids(this.payload(await this.transport.send('0140'),'0140'), 64));
      const parameters = await this.readParameters(supportedPids);
      let oilTemperatureC:number|null|undefined;
      if(supportedPids.includes(0x5C)){
        oilTemperatureC=null;
        try{oilTemperatureC=parsePid(this.payload(await this.transport.send('015C'),'015C'),'015C');}
        catch(error){if(!(error instanceof ObdError)||error.kind!=='no-data')throw error;}
      }
      let readiness:ReadinessData|null|undefined;
      if(supportedPids.includes(1)){
        readiness=null;
        try{readiness={statusBytes:parseReadinessStatus(this.payload(await this.transport.send('0101'),'0101')),warmupsSinceClear:null,distanceSinceClearKm:null};}
        catch(error){if(!(error instanceof ObdError)||error.kind!=='no-data')throw error;}
        if(readiness)for(const [pid,command,key] of [[0x30,'0130','warmupsSinceClear'],[0x31,'0131','distanceSinceClearKm']] as const){
          if(!supportedPids.includes(pid))continue;
          try{readiness[key]=parseClearCounter(this.payload(await this.transport.send(command),command),command);}
          catch(error){if(!(error instanceof ObdError)||error.kind!=='no-data')throw error;}
        }
      }
      const codes: Dtc[] = [];
      const readStatuses: Dtc['status'][] = [];
      for (const [mode, status] of [['03', 'stored'], ['07', 'pending'], ['0A', 'permanent']] as const) {
        try { codes.push(...parseDtc(this.payload(await this.transport.send(mode),mode), mode,this.canProtocol?'can':'auto')); readStatuses.push(status); }
        catch (error) { if (!(error instanceof ObdError) || error.kind !== 'no-data') throw error; }
      }
      if (!readStatuses.length) throw new ObdError('No diagnostic fault mode returned data', 'no-data');
      const timestamp = Date.now();
      const snapshot: DiagnosticSnapshot = { id: `obd-${timestamp}-${++sequence}-${Math.random().toString(36).slice(2, 9)}`, vehicleId, timestamp, source: 'obd', adapterName: this.adapterName, codes, readStatuses, parameters, supportedPids };
      if(this.selectedEcu)snapshot.ecu={...this.selectedEcu};
      if(readiness!==undefined)snapshot.readiness=readiness;
      if(oilTemperatureC!==undefined)snapshot.oilTemperatureC=oilTemperatureC;
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
