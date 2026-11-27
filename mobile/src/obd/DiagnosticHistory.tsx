import {useMemo,useState} from 'react';
import {View,Text,TextInput} from 'react-native';
import type {DiagnosticSnapshot} from './types';
import {compareDiagnostics} from './comparison';
import {parameterByPid,pidHex} from './parameters';
import {Snapshot} from './SnapshotView';
import {Button,Note,number} from '../ui';
import {RecordActions} from '../RecordActions';
import {styles as s} from '../theme';

export type DiagnosticExport='json'|'csv'|'report';
export const dtcLabels={stored:'Zapisane',pending:'Oczekujące',permanent:'Trwałe'};
export function DiagnosticExports({onExport,disabled}:{onExport:(format:DiagnosticExport)=>void;disabled:boolean}) {
 return <View style={{gap:8,marginTop:12}}><Button label="Zapisz kopię JSON" secondary disabled={disabled} onPress={()=>onExport('json')}/><Button label="Eksportuj pomiary i kody CSV" secondary disabled={disabled} onPress={()=>onExport('csv')}/><Button label="Eksportuj raport PDF / HTML" secondary disabled={disabled} onPress={()=>onExport('report')}/></View>;
}
export function DiagnosticHistory({records,target,disabled,onExport}:{records:DiagnosticSnapshot[];target:DiagnosticSnapshot|null;disabled:boolean;onExport:(scan:DiagnosticSnapshot,format:DiagnosticExport)=>void}) {
 const[query,setQuery]=useState(''),[page,setPage]=useState(0),[beforeId,setBeforeId]=useState<string|null>(null);
 const q=query.trim().toLocaleLowerCase('pl');
 const filtered=useMemo(()=>records.filter(r=>(r.adapterName+' '+(r.ecu?.responseId??'')+' '+r.codes.map(c=>c.code).join(' ')+' '+new Date(r.timestamp).toLocaleDateString('pl-PL')).toLocaleLowerCase('pl').includes(q)),[records,q]);
 const lastPage=Math.max(0,Math.ceil(filtered.length/20)-1),shownPage=Math.min(page,lastPage);
 const before=records.find(r=>r.id===beforeId);
 let comparison:ReturnType<typeof compareDiagnostics>|null=null,comparisonError='';
 if(before&&target){try{comparison=compareDiagnostics(before,target);}catch(error){comparisonError=error instanceof Error?error.message:'Nie można porównać raportów.';}}
 return <View style={{gap:14}}>
  {records.length>0&&<><TextInput accessibilityLabel="Szukaj w historii diagnostycznej" placeholder="Kod DTC, adapter, ECU lub data" value={query} onChangeText={value=>{setQuery(value);setPage(0);}} maxLength={80} style={s.input}/><Text style={s.fine}>{filtered.length} odczytów · strona {shownPage+1}/{lastPage+1}</Text></>}
  {comparisonError!==''&&<Note>{comparisonError}</Note>}
  {comparison&&before&&target&&<View style={{gap:12}}>
   <Text accessibilityRole="header" style={s.sectionTitle}>Porównanie odczytów</Text>
   <Text style={s.fine}>{new Date(before.timestamp).toLocaleString('pl-PL')} → {new Date(target.timestamp).toLocaleString('pl-PL')} · {comparison.scopeVerified?`CAN ${target.ecu!.responseId}`:'adres ECU niepotwierdzony'}</Text>
   <Text style={s.body}>Wspólne statusy: {comparison.commonStatuses.map(s=>dtcLabels[s]).join(', ')||'brak'}</Text>
   {comparison.unknownStatuses.length>0&&<Text style={s.muted}>Nieporównane statusy: {comparison.unknownStatuses.map(s=>dtcLabels[s]).join(', ')}. Brakuje odczytu w jednym z raportów.</Text>}
   <Text style={s.body}>Nowo zgłoszone: {comparison.added.map(c=>`${c.code} (${dtcLabels[c.status]})`).join(', ')||'brak we wspólnych statusach'}</Text>
   <Text style={s.body}>Nie zgłoszono ponownie: {comparison.notReported.map(c=>`${c.code} (${dtcLabels[c.status]})`).join(', ')||'brak we wspólnych statusach'}</Text>
   <Text style={s.fine}>Niezgłoszony ponownie kod nie potwierdza naprawy. Warunki i obciążenie silnika pomiędzy odczytami mogą być różne. Importy nie potwierdzają pochodzenia danych.</Text>
   {comparison.parameters.map(p=><Text key={p.pid} style={s.body}>{parameterByPid(p.pid)!.label} · PID {pidHex(p.pid)}: {number(p.before,2)} → {number(p.after,2)} {p.unit}</Text>)}
   {comparison.parameters.length===0&&<Text style={s.muted}>Brak zmienionych, porównywalnych pomiarów liczbowych.</Text>}
   <Button label="Zamknij porównanie" secondary onPress={()=>setBeforeId(null)}/>
  </View>}
  {records.length===0&&<Text style={s.muted}>Brak zapisanych odczytów. Odczytaj dane z adaptera lub zaimportuj raport VehicleSenseX.</Text>}
  {records.length>0&&filtered.length===0&&<Text style={s.muted}>Brak odczytów pasujących do wyszukiwania.</Text>}
  {filtered.slice(shownPage*20,(shownPage+1)*20).map(value=><View key={value.id} style={s.listRow}>
   <Snapshot value={value}/><DiagnosticExports disabled={disabled} onExport={format=>onExport(value,format)}/>
   {target&&target.id!==value.id&&value.timestamp<=target.timestamp&&<Button label="Porównaj z najnowszym pełnym odczytem" secondary disabled={disabled} onPress={()=>setBeforeId(value.id)}/>}
   <RecordActions kind="diagnostic" id={value.id}/>
  </View>)}
  {lastPage>0&&<View style={{flexDirection:'row',gap:10}}><Button label="Poprzednie odczyty" secondary disabled={shownPage===0} onPress={()=>setPage(shownPage-1)}/><Button label="Następne odczyty" secondary disabled={shownPage===lastPage} onPress={()=>setPage(shownPage+1)}/></View>}
 </View>;
}
