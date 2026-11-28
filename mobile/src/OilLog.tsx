import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from './AppProvider';
import type { ServiceEntry, Vehicle } from './domain';
import { localDay } from './domain';
import { addOilObservation } from './maintenance';
import { oilLevelLabels } from './maintenance-model';
import type { OilObservation } from './maintenance-model';
import { MaintenanceField, MaintenanceModal } from './MaintenanceForms';
import { OilTemperatureDetails } from './obd/OilTemperatureDetails';
import { RecordActions } from './RecordActions';
import { Button, Empty, Note, Section, displayDate, money, number } from './ui';
import { colors, styles as s } from './theme';
function OilForm({ vehicle, today, previous, close }: { vehicle: Vehicle; today: string; previous?: ServiceEntry; close: () => void }) {
  const app = useApp(), o = previous?.oilObservation;
  const [input, setInput] = useState(() => ({ vehicleId: vehicle.id, date: previous?.date ?? today, mileage: String(previous?.mileage ?? vehicle.mileage), level: o?.level ?? 'unknown' as OilObservation['level'], addedLiters: String((o?.addedMl ?? 0) / 1000), oilLifePercent: o?.oilLifePercent == null ? '' : String(o.oilLifePercent), cost: String((previous?.costCents ?? 0) / 100), note: previous?.note ?? '' }));
  const [error, setError] = useState(''), [saving, setSaving] = useState(false);
  async function submit() { if (saving || app.busy) return; setSaving(true); setError(''); try { await app.commit(state => addOilObservation(state, input, `oil-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`, today, previous?.id)); close(); } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się zapisać kontroli.'); } finally { setSaving(false); } }
  return <MaintenanceModal title={previous ? 'Popraw kontrolę oleju' : 'Zapisz kontrolę oleju'} busy={saving || app.busy} error={error} close={close} submit={() => void submit()}>
    <Text style={[s.muted, { marginBottom: 18 }]}>Wpis ręczny dla {vehicle.make} {vehicle.model}. Zapisz wynik kontroli według instrukcji tego auta. Wskazanie trwałości przepisz tylko z komputera pojazdu, jeśli je pokazuje.</Text>
    <MaintenanceField label="Data kontroli (RRRR-MM-DD)" value={input.date} change={date => setInput(v => ({ ...v, date }))} /><MaintenanceField label="Przebieg kontroli (km)" value={input.mileage} change={mileage => setInput(v => ({ ...v, mileage }))} numeric />
    <Text style={s.label}>Poziom według kontroli właściciela</Text><View style={{ gap: 8, marginBottom: 18 }}>{(Object.keys(oilLevelLabels) as OilObservation['level'][]).map(level => <Pressable key={level} accessibilityRole="radio" aria-checked={input.level === level} accessibilityLabel={oilLevelLabels[level]} onPress={() => setInput(v => ({ ...v, level }))} style={{ minHeight: 44, padding: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: input.level === level ? colors.ink : colors.paper }}><Text style={[s.body, { color: input.level === level ? colors.paper : colors.ink }]}>{oilLevelLabels[level]}</Text></Pressable>)}</View>
    <MaintenanceField label="Rzeczywiście dolano (l) · 0 przy samej kontroli" value={input.addedLiters} change={addedLiters => setInput(v => ({ ...v, addedLiters }))} numeric /><MaintenanceField label="Pozostała trwałość z komputera (%) · opcjonalnie" value={input.oilLifePercent} change={oilLifePercent => setInput(v => ({ ...v, oilLifePercent }))} numeric /><MaintenanceField label="Koszt kontroli / dolewki (zł)" value={input.cost} change={cost => setInput(v => ({ ...v, cost }))} numeric /><MaintenanceField label="Warunki kontroli i uwagi" value={input.note} change={note => setInput(v => ({ ...v, note }))} multiline maxLength={1000} />
    <Note>Zapis trafia do historii serwisu i kosztów. Dolewka nie jest wymianą oleju i nie resetuje harmonogramu ani wskaźnika w samochodzie. Aplikacja nie wyznacza ilości do dolania.</Note>
  </MaintenanceModal>;
}
export function OilLog({ vehicle, today }: { vehicle: Vehicle; today: string }) {
  const app = useApp(), [form, setForm] = useState<string | null>(null), [limit, setLimit] = useState(10);
  const own = app.data.service.filter(r => r.vehicleId === vehicle.id && r.oilObservation), history = own.filter(r => r.date <= today).sort((a, b) => b.date.localeCompare(a.date) || b.mileage - a.mileage || a.id.localeCompare(b.id));
  const latest = app.data.diagnostics.filter(r => r.vehicleId === vehicle.id && localDay(new Date(r.timestamp)) <= today).sort((a, b) => b.timestamp - a.timestamp)[0], selected = history.find(r => r.id === form);
  return <Section title="Olej: pomiary, kontrola i dolewki">
    <Text style={[s.muted, { marginTop: 16 }]}>Poziom oleju, jego temperatura i wskaźnik pozostałej trwałości to różne informacje. Nie wyliczamy jednego z drugiego.</Text>
    {latest ? <><Text style={[s.fine, { marginTop: 14 }]}>Najnowszy raport: {new Date(latest.timestamp).toLocaleString('pl-PL')} · {latest.source === 'obd' ? 'zapisany OBD' : 'import, bez weryfikacji'} · {latest.ecu ? `CAN ${latest.ecu.responseId} / ${latest.ecu.protocol}` : 'ECU niepotwierdzone'}. To nie pomiar na żywo.</Text><OilTemperatureDetails value={latest} /></> : <Text style={[s.muted, { marginTop: 14 }]}>Brak raportu OBD. Pełny skan pobierze temperaturę oleju, jeśli ECU obsługuje PID 5C. Brak odczytu poziomu i trwałości oleju przez OBD w tym module.</Text>}
    <View style={{ gap: 10, marginTop: 16 }}><Button label="Zapisz kontrolę lub dolewkę oleju" disabled={app.busy} onPress={() => setForm('new')} /><Button label="Wykonaj pełny skan OBD" secondary onPress={() => router.push('/diagnostics')} /></View>
    {!history.length && <Empty title="Brak zapisanych kontroli oleju" description="Dodaj wynik sprawdzenia poziomu, rzeczywistą dolewkę lub wskazanie trwałości z komputera pojazdu. Nieznana wartość pozostaje nieznana." />}
    {history.slice(0, limit).map(entry => { const o = entry.oilObservation!; return <View key={entry.id} style={s.listRow}><Text style={[s.body, { fontWeight: '600' }]}>{displayDate(entry.date)} · {number(entry.mileage)} km</Text><Text style={s.body}>{oilLevelLabels[o.level]} · dolano {number(o.addedMl / 1000, 3)} l</Text><Text style={s.muted}>Trwałość z komputera: {o.oilLifePercent === null ? 'nie zapisano' : number(o.oilLifePercent, 1) + '%'} · wpis ręczny, nie odczyt OBD.</Text><Text style={s.fine}>{money(entry.costCents)}{entry.note ? ` · ${entry.note}` : ''}</Text>{(o.level === 'low' || o.level === 'high') && <Text style={[s.body, { color: colors.red }]}>Zapis wskazuje poziom poza zakresem. Zweryfikuj aktualny poziom i postępuj według instrukcji auta; ten wpis nie określa ilości oleju do dodania.</Text>}<RecordActions kind="service" id={entry.id} onEdit={() => setForm(entry.id)} /></View>; })}
    {history.length > limit && <Button label="Pokaż starsze kontrole oleju" secondary onPress={() => setLimit(n => n + 20)} />}
    {own.some(r => r.date > today) && <Note>Kontrole oleju z przyszłą datą pominięto. Sprawdź zegar i wpisy w historii serwisu.</Note>}
    <Note>Olej sprawdzaj zgodnie z instrukcją swojego modelu. Komunikaty pojazdu i zalecenia producenta mają pierwszeństwo przed ustawionym harmonogramem. Nie resetujemy wskaźnika trwałości ani ustawień ECU.</Note>
    {form !== null && (form === 'new' || selected) && <OilForm key={form} vehicle={vehicle} today={today} previous={selected} close={() => setForm(null)} />}
  </Section>;
}
