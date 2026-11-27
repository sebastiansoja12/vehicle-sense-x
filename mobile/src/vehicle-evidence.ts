import type { AppData } from './domain.ts';
import { localDay, validDate, vehicleSummary } from './domain.ts';
import { ValidationError } from './validation.ts';
import type { DiagnosticSnapshot, Dtc } from './obd/types.ts';
import { decodeReadiness } from './obd/readiness.ts';

export type EvidenceStatus = 'present' | 'partial' | 'missing' | 'conflict';
export const evidenceStatusLabels: Record<EvidenceStatus, string> = { present: 'Dane zapisane', partial: 'Dane ograniczone', missing: 'Brak danych', conflict: 'Sprawdź niespójność' };
export type EvidenceItem = { id: string; title: string; status: EvidenceStatus; details: string[]; action: 'diagnostics' | 'garage' | 'maintenance' | 'expenses' | 'comparison' };
export type ServiceFollowUp = {
  serviceId: string | null; serviceDate: string | null; beforeId: string | null; afterId: string | null;
  status: 'no-service' | 'paired' | 'need-before' | 'need-after' | 'different-ecu' | 'unconfirmed' | 'same-day-only';
  sameDayCount: number; commonStatuses: Dtc['status'][];
};
export const followUpLabels: Record<ServiceFollowUp['status'], string> = {
  'no-service': 'Brak zapisanego serwisu do powiązania.', paired: 'Dostępne są odczyty sprzed i po dniu serwisu z tego samego ECU i protokołu.',
  'need-before': 'Brak odczytu sprzed dnia serwisu.', 'need-after': 'Brak odczytu po dniu serwisu.',
  'different-ecu': 'Odczyty przed i po serwisie dotyczą różnych ECU lub protokołów.',
  unconfirmed: 'Import lub niepotwierdzony zakres ECU nie wystarcza do automatycznego powiązania.',
  'same-day-only': 'Odczyty są z dnia serwisu; bez godziny naprawy nie ustalimy, które są sprzed i po niej.',
};
const dateOf = (s: DiagnosticSnapshot) => localDay(new Date(s.timestamp));
const scopeKey = (s: DiagnosticSnapshot) => s.ecu ? `${s.ecu.protocol}/${s.ecu.responseId}` : null;
export function findServiceFollowUp(state: AppData, vehicleId: string, today: string): ServiceFollowUp {
  const service = state.service.filter(s => s.vehicleId === vehicleId && s.date <= today).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))[0];
  const result: ServiceFollowUp = { serviceId: service?.id ?? null, serviceDate: service?.date ?? null, beforeId: null, afterId: null, status: 'no-service', sameDayCount: 0, commonStatuses: [] };
  if (!service) return result;
  const readings = state.diagnostics.filter(s => s.vehicleId === vehicleId && dateOf(s) <= today).sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id));
  const before = readings.filter(s => dateOf(s) < service.date), after = readings.filter(s => dateOf(s) > service.date);
  result.sameDayCount = readings.filter(s => dateOf(s) === service.date).length;
  const previousByEcu = new Map<string, DiagnosticSnapshot>();
  for (const s of before) { const key = scopeKey(s); if (key && s.source === 'obd' && !previousByEcu.has(key)) previousByEcu.set(key, s); }
  for (const s of after) {
    const key = scopeKey(s), previous = key && s.source === 'obd' ? previousByEcu.get(key) : undefined;
    if (previous) return { ...result, beforeId: previous.id, afterId: s.id, status: 'paired', commonStatuses: previous.readStatuses.filter(status => s.readStatuses.includes(status)) };
  }
  result.status = !before.length && !after.length && result.sameDayCount ? 'same-day-only'
    : !before.length ? 'need-before' : !after.length ? 'need-after'
      : !previousByEcu.size || !after.some(s => s.source === 'obd' && s.ecu) ? 'unconfirmed' : 'different-ecu';
  return result;
}
type MileageRow = { id: string; date: string; mileage: number };
export type MileageConflict = { earlierId: string; laterId: string; earlierDate: string; laterDate: string; earlierMileage: number; laterMileage: number };
export function buildVehicleEvidence(state: AppData, vehicleId: string, today: string) {
  const vehicle = state.vehicles.find(v => v.id === vehicleId);
  if (!vehicle || !validDate(today)) throw new ValidationError('Wybierz samochód i poprawną datę audytu.');
  const services = state.service.filter(s => s.vehicleId === vehicleId), fuel = state.fuel.filter(s => s.vehicleId === vehicleId);
  const readings = state.diagnostics.filter(s => s.vehicleId === vehicleId).sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id));
  const latest = readings[0], items: EvidenceItem[] = [];
  const add = (item: EvidenceItem) => items.push(item);
  const diagnosticDetails = latest ? [
    `${readings.length} odczytów · najnowszy: ${dateOf(latest)} · ${latest.source === 'import' ? 'import bez weryfikacji adaptera' : 'źródło oznaczone jako OBD'}.`,
    latest.ecu ? `Zakres: CAN ${latest.ecu.responseId}, protokół ${latest.ecu.protocol}; nie obejmuje całego auta.` : 'Brak potwierdzonego adresu ECU.',
    `Odczytane statusy DTC: ${latest.readStatuses.length}/3. Brak kodów w odczytanych statusach nie potwierdza sprawności.`,
  ] : ['Nie zapisano diagnostyki. Nie znamy kodów ani zakresu obsługiwanych sterowników.'];
  add({ id: 'diagnostics', title: 'Źródło i zakres diagnostyki', status: !latest ? 'missing' : dateOf(latest) > today ? 'conflict' : latest.source === 'import' || !latest.ecu || latest.readStatuses.length < 3 ? 'partial' : 'present', details: diagnosticDetails, action: 'diagnostics' });
  const readiness = latest?.readiness ? decodeReadiness(latest.readiness) : null;
  add({ id: 'readiness', title: 'Dowody gotowości emisji', status: !readiness ? 'missing' : dateOf(latest) > today ? 'conflict' : latest.source === 'import' || !latest.ecu || !readiness.monitors.some(m => m.available) || readiness.monitors.some(m => m.available && !m.complete) ? 'partial' : 'present', details: readiness ? [
    ...(dateOf(latest) > today ? ['Raport ma przyszłą datę. Sprawdź zegar lub import; te dane nie potwierdzają stanu na dzień audytu.'] : []),
    `MIL według ECU: ${readiness.mil ? 'włączona' : 'wyłączona'}. Zakończone monitory: ${readiness.monitors.filter(m => m.available && m.complete).length}/${readiness.monitors.filter(m => m.available).length} obsługiwanych.`,
    'To stan monitorów z daty raportu, bez potwierdzenia wyniku badania technicznego ani przyczyny ewentualnego skasowania DTC.',
  ] : ['Najnowszy raport nie zawiera odczytu gotowości emisji. Nowy pełny skan pobiera dane, jeśli ECU reklamuje obsługę PID 01.'], action: 'diagnostics' });
  const datedRows: MileageRow[] = [...fuel, ...services].filter(r => r.date <= today).sort((a, b) => a.date.localeCompare(b.date) || a.mileage - b.mileage || a.id.localeCompare(b.id));
  const mileageConflicts: MileageConflict[] = [];
  let maximum: MileageRow | undefined, dayCount = 0;
  for (let start = 0; start < datedRows.length;) {
    let end = start + 1; while (end < datedRows.length && datedRows[end].date === datedRows[start].date) end++;
    dayCount++;
    const minimum = datedRows[start], highest = datedRows[end - 1];
    if (maximum && minimum.mileage < maximum.mileage) mileageConflicts.push({ earlierId: maximum.id, laterId: minimum.id, earlierDate: maximum.date, laterDate: minimum.date, earlierMileage: maximum.mileage, laterMileage: minimum.mileage });
    if (!maximum || highest.mileage > maximum.mileage) maximum = highest;
    start = end;
  }
  add({ id: 'mileage', title: 'Spójność wpisanych przebiegów', status: mileageConflicts.length ? 'conflict' : dayCount >= 2 ? 'present' : datedRows.length ? 'partial' : 'missing', details: [
    `${datedRows.length} wpisów paliwa i serwisu w ${dayCount} różnych dniach. Przebieg w profilu: ${vehicle.mileage} km — wpis właściciela.`,
    mileageConflicts.length ? `Wykryte spadki między datami: ${mileageConflicts.length}. Sprawdź pomyłkę daty, jednostek lub wpisu; to nie jest dowód cofnięcia licznika.` : dayCount >= 2 ? 'Nie znaleziono spadku między datami w dostępnych wpisach. Nie potwierdza to autentyczności przebiegu.' : 'Za mało dat do sprawdzenia kolejności przebiegu. Nie zakładamy kolejności wpisów w tym samym dniu.',
  ], action: 'maintenance' });
  const future = [...fuel, ...services, ...state.expenses.filter(e => e.vehicleId === vehicleId)].filter(r => r.date > today).length + readings.filter(r => dateOf(r) > today).length;
  add({ id: 'dates', title: 'Daty i zegar urządzenia', status: future ? 'conflict' : 'present', details: [future ? `Wpisy lub odczyty z przyszłą datą: ${future}. Sprawdź zegar i importowane dane. Nie używamy ich do powiązania serwisu.` : `Brak przyszłych dat w sprawdzonych wpisach względem ${today}. Daty nie są niezależnie uwierzytelnione.`], action: 'garage' });
  const followUp = findServiceFollowUp(state, vehicleId, today);
  add({ id: 'follow-up', title: 'Czy mamy pomiary przed i po serwisie?', status: followUp.status === 'paired' && followUp.commonStatuses.length ? 'present' : followUp.status === 'no-service' ? 'missing' : 'partial', details: [
    followUpLabels[followUp.status], ...(followUp.serviceDate ? [`Dzień ostatniego zapisanego serwisu: ${followUp.serviceDate}. Odczytów z tego samego dnia: ${followUp.sameDayCount}; nie ustalamy ich kolejności względem naprawy.`] : []),
    'Powiązanie według dat i metadanych nie dowodzi, że wykonano naprawę ani że była skuteczna. Importy nie wypełniają automatycznie tego dowodu.',
  ], action: 'comparison' });
  const summary = vehicleSummary({ ...state, fuel: state.fuel.filter(f => f.date <= today) }, vehicleId, today.slice(0, 7));
  add({ id: 'fuel', title: 'Podstawa obliczeń spalania', status: summary.consumption === null ? 'missing' : 'present', details: [summary.consumption === null ? 'Brak wystarczających tankowań do pełna z rosnącym przebiegiem.' : `Spalanie z wpisów pełny–pełny obejmuje ${summary.measuredDistance} km. Wynik zależy od kompletności i poprawności wpisów.`, 'Nie obejmuje pomiaru przepływu paliwa ani niezależnej weryfikacji licznika.'], action: 'expenses' });
  return { vehicleId, checkedOn: today, items, mileageConflicts, followUp };
}
