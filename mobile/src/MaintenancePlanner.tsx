import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from './AppProvider';
import type { Vehicle } from './domain';
import type { Reminder } from './records';
import type { MaintenanceComponent } from './maintenance-model';
import { maintenanceComponents, maintenanceStatus, recordMaintenance, saveMaintenancePlan } from './maintenance';
import type { MaintenanceInput } from './maintenance';
import { MaintenanceField, MaintenanceModal } from './MaintenanceForms';
import { RecordActions } from './RecordActions';
import { Button, Empty, Note, Section, number } from './ui';
import { colors, styles as s } from './theme';
const newId = () => `maintenance-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
function PlanForm({ vehicle, today, previous, close }: { vehicle: Vehicle; today: string; previous?: Reminder; close: () => void }) {
  const app = useApp(), plan = previous?.schedule;
  const [input, setInput] = useState<MaintenanceInput>(() => ({ vehicleId: vehicle.id, component: plan?.component ?? 'engine-oil', action: plan?.action ?? 'replace', title: previous?.title ?? maintenanceComponents['engine-oil'], lastDate: plan?.lastDate ?? '', lastMileage: plan ? String(plan.lastMileage) : '', intervalMonths: plan?.intervalMonths == null ? '' : String(plan.intervalMonths), intervalKm: plan?.intervalKm == null ? '' : String(plan.intervalKm), source: plan?.source ?? '' }));
  const [error, setError] = useState(''), [saving, setSaving] = useState(false), [history, setHistory] = useState(false);
  const field = (key: keyof MaintenanceInput, label: string, numeric = false, maxLength = 100) => <MaintenanceField label={label} value={input[key]} change={value => setInput(v => ({ ...v, [key]: value }))} numeric={numeric} maxLength={maxLength} />;
  async function submit() { if (saving || app.busy) return; setSaving(true); setError(''); try { await app.commit(state => saveMaintenancePlan(state, input, newId(), today, previous?.id)); close(); } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się zapisać planu.'); } finally { setSaving(false); } }
  const services = app.data.service.filter(r => r.vehicleId === vehicle.id && r.date <= today && !r.oilObservation).sort((a, b) => b.date.localeCompare(a.date) || b.mileage - a.mileage).slice(0, 10);
  return <MaintenanceModal title={previous ? 'Edytuj harmonogram' : 'Ustaw harmonogram'} busy={saving || app.busy} error={error} close={close} submit={() => void submit()}>
    <Text style={[s.muted, { marginBottom: 16 }]}>{vehicle.make} {vehicle.model} · Interwał wpisz według instrukcji konkretnej wersji auta lub zaleceń warsztatu. Nie ustawiamy uniwersalnego terminu.</Text>
    <Text style={s.label}>Część lub układ</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>{(Object.keys(maintenanceComponents) as MaintenanceComponent[]).map(component => <Pressable key={component} accessibilityRole="radio" aria-checked={input.component === component} accessibilityLabel={maintenanceComponents[component]} onPress={() => setInput(v => ({ ...v, component, title: maintenanceComponents[component], action: ['oil-level', 'brakes', 'tires', 'battery'].includes(component) ? 'inspect' : 'replace' }))} style={{ minHeight: 44, padding: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: input.component === component ? colors.ink : colors.paper }}><Text style={[s.body, { color: input.component === component ? colors.paper : colors.ink }]}>{maintenanceComponents[component]}</Text></Pressable>)}</View>
    {field('title', 'Nazwa czynności')}
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>{(['inspect', 'replace'] as const).map(action => <Pressable key={action} accessibilityRole="radio" aria-checked={input.action === action} accessibilityLabel={action === 'inspect' ? 'Kontrola' : 'Wymiana'} onPress={() => setInput(v => ({ ...v, action }))} style={{ minHeight: 44, padding: 12, borderWidth: 1, borderColor: colors.ink, backgroundColor: input.action === action ? colors.ink : colors.paper }}><Text style={[s.body, { color: input.action === action ? colors.paper : colors.ink }]}>{action === 'inspect' ? 'Kontrola' : 'Wymiana'}</Text></Pressable>)}</View>
    <Button label={history ? 'Ukryj historię bazową' : 'Wczytaj bazę z historii serwisu'} secondary onPress={() => setHistory(!history)} />
    {history && <View style={{ marginVertical: 12 }}>{services.length ? services.map(service => <View key={service.id} style={{ marginBottom: 8 }}><Button label={`${service.date} · ${service.title} · ${number(service.mileage)} km`} secondary onPress={() => { setInput(v => ({ ...v, lastDate: service.date, lastMileage: String(service.mileage) })); setHistory(false); }} /></View>) : <Text style={s.muted}>Brak zapisanej obsługi. Wpisz potwierdzoną bazę ręcznie.</Text>}<Text style={s.fine}>Ostatnie 10 wpisów. Wybierz tylko obsługę dotyczącą tej części; nazw nie dopasowujemy automatycznie.</Text></View>}
    {field('lastDate', 'Data ostatniej obsługi (RRRR-MM-DD)')}{field('lastMileage', 'Przebieg ostatniej obsługi (km)', true)}
    {field('intervalKm', 'Interwał (km) · opcjonalnie', true)}{field('intervalMonths', 'Interwał (miesiące) · opcjonalnie', true)}{field('source', 'Źródło interwału (instrukcja / warsztat)', false, 300)}
    <Text style={[s.fine, { marginBottom: 20 }]}>Podaj co najmniej jeden interwał. Jeśli podasz oba, obowiązuje pierwsza osiągnięta granica. Plan nie potwierdza wykonania wcześniejszej naprawy ani zużycia części.</Text>
  </MaintenanceModal>;
}
function CompletionForm({ vehicle, reminder, today, close }: { vehicle: Vehicle; reminder: Reminder; today: string; close: () => void }) {
  const app = useApp(), [input, setInput] = useState({ date: today, mileage: String(vehicle.mileage), cost: '', note: '' }), [error, setError] = useState(''), [saving, setSaving] = useState(false);
  async function submit() { if (saving || app.busy) return; setSaving(true); setError(''); try { await app.commit(state => recordMaintenance(state, reminder.id, input, newId(), newId(), today)); close(); } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się zapisać obsługi.'); } finally { setSaving(false); } }
  return <MaintenanceModal title="Zapisz wykonaną obsługę" busy={saving || app.busy} error={error} close={close} submit={() => void submit()} label="Zapisz serwis i następny termin">
    <Text style={[s.body, { marginBottom: 16 }]}>{reminder.title} · {vehicle.make} {vehicle.model}</Text>
    <MaintenanceField label="Data wykonania (RRRR-MM-DD)" value={input.date} change={date => setInput(v => ({ ...v, date }))} /><MaintenanceField label="Przebieg wykonania (km)" value={input.mileage} change={mileage => setInput(v => ({ ...v, mileage }))} numeric /><MaintenanceField label="Rzeczywisty koszt (zł) · wpisz 0, jeśli bez kosztu" value={input.cost} change={cost => setInput(v => ({ ...v, cost }))} numeric /><MaintenanceField label="Notatka do serwisu" value={input.note} change={note => setInput(v => ({ ...v, note }))} multiline maxLength={1000} />
    <Note>Zapis utworzy wpis serwisowy z podanym kosztem i kolejny termin od faktycznej daty/przebiegu. Jeśli masz już taki serwis, nie zapisuj go drugi raz — edytuj bazę harmonogramu według istniejącego wpisu.</Note>
  </MaintenanceModal>;
}
export function MaintenancePlanner({ vehicle, today }: { vehicle: Vehicle; today: string }) {
  const app = useApp(), [form, setForm] = useState<{ mode: 'plan' | 'complete'; id?: string } | null>(null);
  const plans = app.data.reminders.filter(r => r.vehicleId === vehicle.id && !r.completed && r.schedule).map(r => ({ reminder: r, status: maintenanceStatus(r, vehicle.mileage, today) })).sort((a, b) => Number(b.status.due) - Number(a.status.due) || (a.status.remainingDays ?? Infinity) - (b.status.remainingDays ?? Infinity));
  const selected = form?.id ? app.data.reminders.find(r => r.id === form.id && r.vehicleId === vehicle.id && !r.completed) : undefined;
  return <Section title="Harmonogram części i płynów">
    <Text style={[s.muted, { marginVertical: 16 }]}>Terminy kontroli lub wymiany według czasu i przebiegu. Przebieg pochodzi z garażu: {number(vehicle.mileage)} km. Brak planu oznacza brak ustalonego terminu.</Text><Button label="Ustaw harmonogram części" disabled={app.busy} onPress={() => setForm({ mode: 'plan' })} />
    {!plans.length && <Empty title="Ustal terminy dla swojego auta" description="Olej, filtry, rozrząd, płyny, świece i inne podzespoły. Interwały zależą od wersji silnika, warunków jazdy i instrukcji producenta." />}
    {plans.map(({ reminder: r, status }) => <View key={r.id} style={s.listRow}>
      <Text style={[s.body, { fontWeight: '700' }]}>{r.title} · {r.schedule!.action === 'replace' ? 'wymiana' : 'kontrola'}</Text>
      <Text style={[s.body, { marginTop: 8, color: status.due || status.baselineConflict ? colors.red : colors.ink }]}>{status.baselineConflict ? 'Sprawdź bazę daty i przebiegu' : status.due ? 'Termin osiągnięty' : 'Przed ustalonym terminem'}</Text>
      <Text style={[s.muted, { marginTop: 8 }]}>{r.dueDate ?? 'Bez daty'} · {r.dueMileage === null ? 'bez limitu km' : number(r.dueMileage) + ' km'}</Text>
      {!status.baselineConflict && <Text style={s.fine}>{status.remainingDays === null ? '' : status.remainingDays >= 0 ? `Pozostało dni: ${number(status.remainingDays)}. ` : `Po terminie o ${number(-status.remainingDays)} dni. `}{status.remainingKm === null ? '' : status.remainingKm >= 0 ? `Pozostało ${number(status.remainingKm)} km.` : `Przekroczono o ${number(-status.remainingKm)} km.`}</Text>}
      {status.progressPercent !== null && <><View accessible accessibilityRole="progressbar" accessibilityLabel={`Postęp interwału: ${r.title}`} accessibilityValue={{ min: 0, max: 100, now: Math.round(status.progressPercent), text: `${number(status.progressPercent)}% interwału` }} style={{ height: 8, backgroundColor: colors.line, marginVertical: 12 }}><View style={{ height: 8, width: `${status.progressPercent}%`, backgroundColor: status.due ? colors.red : colors.ink }} /></View><Text style={s.fine}>{number(status.progressPercent)}% wykorzystanego interwału · to nie pomiar zużycia części.</Text></>}
      <Text style={[s.fine, { marginTop: 10 }]}>Baza: {r.schedule!.lastDate} · {number(r.schedule!.lastMileage)} km. Źródło: {r.schedule!.source}</Text>
      <View style={{ gap: 10, marginTop: 14 }}><Button label={`Edytuj plan: ${r.title}`} secondary disabled={app.busy} onPress={() => setForm({ mode: 'plan', id: r.id })} /><Button label={`Zapisz obsługę: ${r.title}`} secondary disabled={app.busy} onPress={() => setForm({ mode: 'complete', id: r.id })} /></View><RecordActions kind="reminder" id={r.id} />
    </View>)}
    <Text style={[s.fine, { marginTop: 16 }]}>Bez aktywnego planu: {(Object.keys(maintenanceComponents) as MaintenanceComponent[]).filter(c => c !== 'other' && !plans.some(p => p.reminder.schedule!.component === c)).map(c => maintenanceComponents[c]).join(', ') || 'wszystkie wymienione pozycje mają plan'}. Lista obejmuje także elementy, które mogą nie występować w Twoim aucie.</Text>
    <Note>Plan nie zastępuje zaleceń producenta ani oceny warsztatu. Dla elementów zużywających się dobierz kontrolę zamiast zakładać obowiązek wymiany. Powiadomienie o dacie włączysz osobno w terminach serwisowych; przebiegu nie śledzimy w tle.</Note>
    {form?.mode === 'plan' && (!form.id || selected) && <PlanForm key={form.id ?? 'new'} vehicle={vehicle} today={today} previous={selected} close={() => setForm(null)} />}
    {form?.mode === 'complete' && selected && <CompletionForm vehicle={vehicle} reminder={selected} today={today} close={() => setForm(null)} />}
  </Section>;
}
