import {parseStoredData,vehicleSummary,localDay} from './domain.ts';
import type {AppData} from './domain.ts';
import {dueReminders,marketEstimate} from './features.ts';
import {analyzeTrip} from './trips.ts';
import {expenseCategoryLabels} from './expenses.ts';
import {validateDiagnosticSnapshot} from './obd/types.ts';
import type {DiagnosticSnapshot} from './obd/types.ts';
import type {LiveHistorySample} from './obd/live-history.ts';
import {parameterByPid,pidHex} from './obd/parameters.ts';
import type {ObdMeasurement} from './obd/parameters.ts';
import {monitorLabels} from './obd/readiness.ts';
import {identificationFields,identificationValues,identificationStatus} from './obd/identification.ts';
import type {EcuIdentification} from './obd/identification.ts';
export const csvCell=(value:unknown)=>'"'+(typeof value==='number'&&Number.isFinite(value)?String(value):String(value??'').replace(/^(?=\s*[=+@-]|[\t\r\n])/,"'")).replaceAll('"','""')+'"';
const csv=(rows:unknown[][])=>'\uFEFF'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n');
export function fuelCsv(state:AppData,id:string){return csv([['Data','Przebieg km','Paliwo l','Cena PLN/l','Koszt PLN','Do pełna'],...state.fuel.filter(r=>r.vehicleId===id).map(r=>[r.date,r.mileage,(r.volumeMl/1000).toFixed(3),(r.priceCents/100).toFixed(2),(r.costCents/100).toFixed(2),r.full?'Tak':'Nie'])]);}
export function serviceCsv(state:AppData,id:string){return csv([['Data','Nazwa','Przebieg km','Koszt PLN','Notatka'],...state.service.filter(r=>r.vehicleId===id).map(r=>[r.date,r.title,r.mileage,(r.costCents/100).toFixed(2),r.note])]);}
export function expensesCsv(state:AppData,id:string){return csv([['Data','Kategoria','Nazwa','Koszt PLN','Notatka'],...state.expenses.filter(r=>r.vehicleId===id).map(r=>[r.date,expenseCategoryLabels[r.category],r.title,(r.costCents/100).toFixed(2),r.note])]);}
export function tripsCsv(state:AppData,id:string){return csv([['Początek ISO','Nazwa','Źródło','Dystans km','Czas min','Szac. paliwo PLN'],...state.trips.filter(r=>r.vehicleId===id).map(r=>{const a=analyzeTrip(r);return[new Date(r.startedAt).toISOString(),r.label,r.source,(a.distanceM/1000).toFixed(3),(a.durationS/60).toFixed(1),r.fuelCostCents===null?'':(r.fuelCostCents/100).toFixed(2)];})]);}
export function createBackup(state:AppData,day:string){const json=JSON.stringify({format:'vehiclesensex-backup',version:1,createdAt:day,data:parseStoredData(JSON.stringify(state))});if(new TextEncoder().encode(json).byteLength>20*1024*1024)throw new Error('Kopia przekracza limit importu 20 MB. Wyeksportuj osobne historie i pliki, zanim usuniesz dane.');return json;}
export function parseBackup(raw:string):AppData{
 if(raw.length>20*1024*1024||new TextEncoder().encode(raw).byteLength>20*1024*1024)throw new Error('Kopia przekracza dopuszczalny rozmiar 20 MB.');
 const document=JSON.parse(raw);if(document?.format!=='vehiclesensex-backup'||document.version!==1)throw new Error('To nie jest obsługiwana kopia VehicleSenseX.');const data=parseStoredData(JSON.stringify(document.data));
 if(data.expenses.some(e=>e.date>localDay()))throw new Error('Kopia zawiera wydatki z przyszłą datą. Sprawdź datę urządzenia; garaż nie został zastąpiony.');return data;
}
const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const pln=(v:number)=>(v/100).toFixed(2)+' zł';
const dtcLabels={stored:'Zapisane',pending:'Oczekujące',permanent:'Trwałe'};
function identificationHtml(value:EcuIdentification|undefined):string{
 if(!value)return '';
 const heading='<h2>Identyfikacja ECU · usługa 09</h2><p>Pobrano '+esc(new Date(value.readAt).toISOString())+'</p>';
 if(value.status!=='available')return heading+'<p>'+esc(identificationStatus(value))+'</p>';
 return heading+'<p>InfoTypes 01–20 hex: '+value.supportedInfoTypes.map(pidHex).join(', ')+'</p><table>'+identificationFields.map(field=>{const reading=value[field.key],values=identificationValues(reading);return '<tr><td>'+esc(field.label)+'</td><td>'+(values?values.map(esc).join('<br>'):esc(identificationStatus(reading)))+'</td><td>'+esc(new Date(reading.readAt).toISOString())+'</td></tr>';}).join('')+'</table><p>CVN nie potwierdza oryginalności oprogramowania ani sprawności pojazdu. Kolejność list zachowano, bez zakładania jednego CVN na jeden CALID. Teksty producenta mogą identyfikować pojazd; sprawdź raport przed udostępnieniem.</p>';
}
function diagnosticDetailsHtml(scan:DiagnosticSnapshot,includeIdentification=false):string{
 const d=scan.extended;
 const rows=(measurements:ObdMeasurement[])=>measurements.map(m=>{const p=parameterByPid(m.pid)!;return `<tr><td>${pidHex(m.pid)} · ${esc(p.label)}</td><td>${m.value===null?'Brak odczytu':esc(m.value)} ${esc(p.unit)}</td><td>${esc(new Date(m.readAt).toISOString())}</td></tr>`;}).join('');
 const table=(measurements:ObdMeasurement[])=>`<table><thead><tr><th>Parametr</th><th>Wartość</th><th>Czas pobrania</th></tr></thead><tbody>${rows(measurements)}</tbody></table>`;
 if(!d)return table([{pid:12,value:scan.parameters.rpm,readAt:scan.timestamp},{pid:5,value:scan.parameters.coolantC,readAt:scan.timestamp},{pid:4,value:scan.parameters.loadPercent,readAt:scan.timestamp}])+'<p>Raport podstawowy. Nie odczytano rozszerzonych parametrów, PID 01 ani ramki zamrożonej.</p>';
 const r=d.readiness;
 const readiness=r?`<p>MIL: ${r.milOn?'aktywna':'nieaktywna'} · liczba DTC zgłoszona przez PID 01: ${r.storedDtcCount} · zapłon: ${r.ignition==='spark'?'iskrowy':'samoczynny'}</p><table>${r.monitors.map(m=>`<tr><td>${esc(monitorLabels[m.id])}</td><td>${!m.supported?'Nieobsługiwany':m.complete?'Zakończony':'Niezakończony'}</td></tr>`).join('')}</table>`:'<p>Brak odczytu PID 01. Gotowość monitorów pozostaje nieznana.</p>';
 const f=d.freezeFrame;
 const freeze=f.status==='available'?`<p>Kod wyzwalający: ${esc(f.code)} · pobrano ${esc(new Date(f.readAt).toISOString())}. Czas zapisania usterki przez ECU jest nieznany.</p>${table(f.measurements)}${f.supportedPids===null?'<p>Brak odpowiedzi na zapytanie o parametry ramki.</p>':''}`:`<p>${f.status==='no-frame'?'ECU zwrócił zerowy kod wyzwalający: brak zapisanej ramki 0.':'ECU nie udostępnił odpowiedzi ramki 0; jej zawartość jest nieznana.'}</p>`;
 return `<h2>Parametry rozszerzone</h2>${Object.values(d.scaling??{}).some(v=>v===null)?'<p>Konfiguracja skalowania ECU jest nieznana; zależne od niej wartości pozostają bez odczytu.</p>':''}${table(d.measurements)}<h2>Gotowość emisji · PID 01</h2>${readiness}<p>Zakończony monitor nie jest potwierdzeniem naprawy ani wynikiem badania technicznego.</p><h2>Freeze frame 0</h2>${freeze}${includeIdentification?identificationHtml(d.identification):''}`;
}
export function diagnosticReportHtml(scan:DiagnosticSnapshot,vehicleLabel='Pojazd'):string{
 if(!validateDiagnosticSnapshot(scan))throw new Error('Nieprawidłowy raport diagnostyczny.');
 return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>VehicleSenseX — diagnostyka</title><style>body{font:14px Arial,sans-serif;max-width:850px;margin:32px auto;padding:20px;color:#202420}table{width:100%;border-collapse:collapse}td,th{padding:9px 5px;text-align:left;border-bottom:1px solid #ddd}p{line-height:1.6}h2{margin-top:28px}</style></head><body><h1>VehicleSenseX · ${esc(vehicleLabel)}</h1><p>${esc(new Date(scan.timestamp).toISOString())} · ${scan.source==='obd'?'Odczyt OBD2':'Import bez weryfikacji adaptera'} · ${esc(scan.adapterName)}</p><p>Zakres: ${scan.ecu?`sterownik CAN ${esc(scan.ecu.responseId)}, protokół ${scan.ecu.protocol}`:'OBD bez potwierdzonego adresu ECU'}. Nie obejmuje wszystkich sterowników.</p><p>Statusy: ${esc(scan.readStatuses.map(s=>dtcLabels[s]).join(', '))}. ${scan.readStatuses.length<3?'Odczyt częściowy; pozostałe statusy są nieznane.':''}</p><h2>Kody usterek</h2><ul>${scan.codes.map(c=>`<li>${esc(c.code)} · ${dtcLabels[c.status]}</li>`).join('')||'<li>Brak kodów w odczytanych statusach.</li>'}</ul><p>Napięcie adaptera ATRV: ${scan.parameters.voltageV===null?'brak odczytu':esc(scan.parameters.voltageV)+' V'}</p>${diagnosticDetailsHtml(scan,true)}<p>Nie potwierdza to sprawności samochodu. Parametry są danymi zgłoszonymi przez ECU i mogą być wartościami zastępczymi. Osobne pola VIN i tablic nie są dołączane; teksty identyfikacji ECU mogą identyfikować pojazd. Sprawdź raport przed udostępnieniem.</p></body></html>`;
}
export function diagnosticCsv(scan:DiagnosticSnapshot):string{
 if(!validateDiagnosticSnapshot(scan))throw new Error('Nieprawidłowy raport diagnostyczny.');
 const ecu=scan.ecu?.responseId??'niepotwierdzony';
 const rows:unknown[][]=[['Sekcja','Czas pobrania ISO','PID','Nazwa','Wartość','Jednostka','Status','ECU'],['metadata',new Date(scan.timestamp).toISOString(),'','Adapter',scan.adapterName,'',scan.source,ecu]];
 const measurements=(section:string,list:ObdMeasurement[])=>list.forEach(m=>{const p=parameterByPid(m.pid)!;rows.push([section,new Date(m.readAt).toISOString(),pidHex(m.pid),p.label,m.value,p.unit,m.value===null?'unknown':'reported',ecu]);});
 for(const status of ['stored','pending','permanent'] as const)rows.push(['coverage',new Date(scan.timestamp).toISOString(),'',status,'','',scan.readStatuses.includes(status)?'read':'unknown',ecu]);
 for(const code of scan.codes)rows.push(['dtc',new Date(scan.timestamp).toISOString(),'',code.code,'','',code.status,ecu]);
 rows.push(['adapter',new Date(scan.timestamp).toISOString(),'ATRV','Napięcie adaptera',scan.parameters.voltageV,'V',scan.parameters.voltageV===null?'unknown':'reported',ecu]);
 if(scan.extended){
  measurements('current',scan.extended.measurements);const r=scan.extended.readiness;
  if(r){rows.push(['readiness',new Date(scan.timestamp).toISOString(),'01','MIL',r.milOn,'','reported',ecu]);rows.push(['readiness',new Date(scan.timestamp).toISOString(),'01','Liczba DTC',r.storedDtcCount,'','reported',ecu]);for(const m of r.monitors)rows.push(['readiness',new Date(scan.timestamp).toISOString(),'01',monitorLabels[m.id],'','',!m.supported?'unsupported':m.complete?'complete':'incomplete',ecu]);}else rows.push(['readiness',new Date(scan.timestamp).toISOString(),'01','Gotowość emisji','','','unknown',ecu]);
  const f=scan.extended.freezeFrame;rows.push(['freeze-frame',new Date(f.readAt).toISOString(),'02',f.status==='available'?f.code:'','','',f.status,ecu]);if(f.status==='available')measurements('freeze-frame',f.measurements);
  const identity=scan.extended.identification;
  if(identity){
   rows.push(['ecu-identification',new Date(identity.readAt).toISOString(),'0900','InfoTypes 01–20 hex',identity.status==='available'?identity.supportedInfoTypes.map(pidHex).join(', '):identity.status==='negative-response'?identity.nrc:'','',identity.status,ecu]);
   if(identity.status==='available')for(const field of identificationFields){
    const reading=identity[field.key],values=identificationValues(reading);
    for(const [index,value] of (values??[reading.status==='negative-response'?reading.nrc:'']).entries())rows.push(['ecu-identification',new Date(reading.readAt).toISOString(),'09'+pidHex(field.infoType),field.label+' · '+(index+1),value,'',reading.status,ecu]);
   }
  }
 }else measurements('current',([{pid:12,value:scan.parameters.rpm},{pid:5,value:scan.parameters.coolantC},{pid:4,value:scan.parameters.loadPercent}]).map(m=>({...m,readAt:scan.timestamp})));
 return csv(rows);
}
export function liveDataCsv(history:readonly LiveHistorySample[]):string{
 const rows:unknown[][]=[['Czas pobrania ISO','PID','Nazwa','Wartość','Jednostka','ECU','Adapter','Początek nowego odcinka']];
 for(const sample of history){for(const m of sample.measurements??[]){const p=parameterByPid(m.pid)!;rows.push([new Date(m.readAt).toISOString(),pidHex(m.pid),p.label,m.value,p.unit,sample.ecu?.responseId??'',sample.adapterName,!!sample.breakBefore]);}rows.push([new Date(sample.timestamp).toISOString(),'ATRV','Napięcie adaptera',sample.parameters.voltageV,'V',sample.ecu?.responseId??'',sample.adapterName,!!sample.breakBefore]);}
 return csv(rows);
}
export function healthReportHtml(state:AppData,vehicleId:string,today:string){
 const car=state.vehicles.find(v=>v.id===vehicleId);if(!car)throw new Error('Wybierz samochód.');
 const latest=state.diagnostics.filter(r=>r.vehicleId===vehicleId).sort((a,b)=>b.timestamp-a.timestamp)[0];const services=state.service.filter(r=>r.vehicleId===vehicleId).sort((a,b)=>b.date.localeCompare(a.date));const summary=vehicleSummary(state,vehicleId,today.slice(0,7));const estimate=marketEstimate(state,vehicleId,today);
 const row=(label:string,value:unknown)=>`<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;
 return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>VehicleSenseX — raport</title><style>body{font:14px Arial,sans-serif;color:#202420;max-width:760px;margin:36px auto;padding:20px}h1{font-size:28px}h2{margin-top:30px;font-size:18px}table{border-collapse:collapse;width:100%}td,th{padding:10px 0;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}th{width:40%;font-weight:400}p{line-height:1.7}.muted{color:#666}li{margin-bottom:10px}</style></head><body><h1>VehicleSenseX</h1><p class="muted">Raport danych pojazdu · ${esc(today)}</p><h2>${esc(car.make)} ${esc(car.model)}</h2><table>${row('Rok / silnik',`${car.year} · ${car.engine}`)}${row('Przebieg (wpis właściciela)',`${car.mileage} km`)}${row('Stan mechaniczny','Nieznany — bez oględzin i badań')}${row('Wydatki w miesiącu',pln(summary.totalCents))}${row('Spalanie z tankowań',summary.consumption===null?'Brak wystarczających danych':`${summary.consumption.toFixed(2)} l/100 km`)}</table><h2>Diagnostyka</h2>${latest?`<p>${esc(new Date(latest.timestamp).toISOString())} · źródło: ${esc(latest.source)} · adapter: ${esc(latest.adapterName)}</p><p>${latest.ecu?`Zakres: odczyt jednego sterownika CAN ${esc(latest.ecu.responseId)} (protokół ${esc(latest.ecu.protocol)}). Nie obejmuje wszystkich sterowników samochodu.`:'Zakres: odczyt OBD bez potwierdzonego adresu sterownika.'}</p><p>Odczytano statusy: ${esc(latest.readStatuses.join(', '))}. ${latest.readStatuses.length<3?'Odczyt częściowy — pozostałe statusy nieznane.':''}</p><ul>${latest.codes.map(c=>`<li>${esc(c.code)} · ${esc(c.status)}</li>`).join('')||'<li>Brak kodów w odczytanych statusach. Nie potwierdza to sprawności samochodu.</li>'}</ul><table>${(['rpm','coolantC','loadPercent','voltageV'] as const).map(k=>row(k,latest.parameters[k]===null?'Brak odczytu':latest.parameters[k])).join('')}</table>${latest.extended?diagnosticDetailsHtml(latest):''}`:'<p>Brak zapisanych odczytów OBD2. Nieznany stan usterek.</p>'}<h2>Historia serwisowa</h2>${services.length?`<table>${services.map(r=>row(`${r.date} · ${r.mileage} km`,`${r.title} · ${pln(r.costCents)} · ${r.note}`)).join('')}</table>`:'<p>Brak wpisów.</p>'}<h2>Najbliższe terminy</h2><ul>${dueReminders(state,vehicleId,today).map(r=>`<li>${esc(r.title)} · ${esc(r.dueDate??'bez daty')} · ${r.dueMileage===null?'bez limitu km':esc(r.dueMileage)+' km'}${r.due?' · termin osiągnięty':''}</li>`).join('')||'<li>Brak zapisanych przypomnień.</li>'}</ul><h2>Wartość na podstawie ofert właściciela</h2>${estimate?`<p>${pln(estimate.lowCents)} – ${pln(estimate.highCents)}. ${estimate.count} porównania z ostatnich 90 dni. Ceny ofertowe, bez potwierdzenia transakcji i porównywalności.</p><ul>${state.comparisons.filter(c=>c.vehicleId===vehicleId).map(c=>`<li>${esc(c.date)} · ${pln(c.priceCents)} · ${esc(c.url)}</li>`).join('')}</ul>`:'<p>Brak co najmniej dwóch aktualnych ofert porównawczych.</p>'}<p class="muted">Raport nie jest certyfikatem stanu technicznego ani profesjonalną wyceną. Źródła: wpisy właściciela i zapisane odczyty z widoczną datą. Nie obejmuje kompletnej historii pojazdu. Tablice, VIN i współrzędne tras pominięto.</p></body></html>`;
}
