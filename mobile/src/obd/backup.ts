import type {DiagnosticSnapshot} from './types.ts';

export function hasDiagnosticBackup(reading:DiagnosticSnapshot|null,history:readonly DiagnosticSnapshot[],exportedPayload:string|null):boolean {
 if(!reading)return false;
 const payload=JSON.stringify(reading);
 return exportedPayload===payload||history.some(saved=>saved.id===reading.id&&JSON.stringify(saved)===payload);
}
