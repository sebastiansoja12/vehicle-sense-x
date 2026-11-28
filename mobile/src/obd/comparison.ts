import { validateDiagnosticSnapshot } from './types.ts';
import type { DiagnosticSnapshot, Dtc } from './types.ts';
import { parameterByPid } from './parameters.ts';
import {identificationFields,identificationValues} from './identification.ts';
import type {IdentificationKey} from './identification.ts';

export function compareDiagnostics(before: DiagnosticSnapshot, after: DiagnosticSnapshot) {
  if (!validateDiagnosticSnapshot(before) || !validateDiagnosticSnapshot(after) || before.vehicleId !== after.vehicleId || before.timestamp > after.timestamp) throw new Error('Wybierz wcześniejszy odczyt tego samego samochodu.');
  if (!before.ecu || !after.ecu || before.ecu.protocol !== after.ecu.protocol || before.ecu.responseId !== after.ecu.responseId) throw new Error('Porównanie wymaga potwierdzonego, zgodnego zakresu ECU w obu raportach.');
  const statuses: Dtc['status'][] = ['stored', 'pending', 'permanent'];
  const commonStatuses = statuses.filter(status => before.readStatuses.includes(status) && after.readStatuses.includes(status));
  const eligible = (scan: DiagnosticSnapshot) => new Map(scan.codes.filter(code => commonStatuses.includes(code.status)).map(code => [`${code.code}:${code.status}`, code]));
  const previous = eligible(before), current = eligible(after);
  const measurements = (scan: DiagnosticSnapshot) => scan.extended?.measurements ?? ([['loadPercent', 4], ['coolantC', 5], ['rpm', 12]] as const).map(([key, pid]) => ({ pid, value: scan.parameters[key], readAt: scan.timestamp }));
  const oldValues = new Map(measurements(before).map(m => [m.pid, m.value]));
  const parameters = measurements(after).filter(m => m.value !== null && oldValues.get(m.pid) != null && m.value !== oldValues.get(m.pid)).map(m => ({ pid: m.pid, before: oldValues.get(m.pid)!, after: m.value!, unit: parameterByPid(m.pid)!.unit })).sort((a, b) => a.pid - b.pid);
  const identification={comparedFields:[] as IdentificationKey[],changes:[] as {field:IdentificationKey;before:string[];after:string[]}[]};
  const oldIdentity=before.extended?.identification,newIdentity=after.extended?.identification;
  if(oldIdentity?.status==='available'&&newIdentity?.status==='available'){
    for(const {key} of identificationFields){
      const a=identificationValues(oldIdentity[key]),b=identificationValues(newIdentity[key]);
      if(a&&b){identification.comparedFields.push(key);if(JSON.stringify(a)!==JSON.stringify(b))identification.changes.push({field:key,before:a,after:b});}
    }
  }
  return {
    identification,
    commonStatuses, unknownStatuses: statuses.filter(status => !commonStatuses.includes(status)), scopeVerified: !!after.ecu,
    added: [...current].filter(([key]) => !previous.has(key)).map(([, code]) => code),
    notReported: [...previous].filter(([key]) => !current.has(key)).map(([, code]) => code), parameters,
  };
}
