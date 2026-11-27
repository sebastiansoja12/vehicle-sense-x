import { validateDiagnosticSnapshot } from './types.ts';
import type { DiagnosticSnapshot, Dtc } from './types.ts';
import { ValidationError } from '../validation.ts';

export const dtcStatusLabels: Record<Dtc['status'], string> = { stored: 'Zapisane', pending: 'Oczekujące', permanent: 'Trwałe' };
export const diagnosticParameters = {
  rpm: { label: 'Obroty silnika', unit: 'rpm', digits: 0 },
  coolantC: { label: 'Płyn chłodzący', unit: '°C', digits: 1 },
  loadPercent: { label: 'Obciążenie', unit: '%', digits: 1 },
  voltageV: { label: 'Napięcie adaptera', unit: 'V', digits: 2 },
} as const;
export const diagnosticParameterKeys = Object.keys(diagnosticParameters) as (keyof typeof diagnosticParameters)[];
export type CodeChange = Dtc & {
  before: 'present' | 'absent' | 'unknown'; after: 'present' | 'absent' | 'unknown';
  change: 'added' | 'not-seen' | 'unchanged' | 'unknown';
};
export const codeChangeLabels: Record<CodeChange['change'], string> = {
  added: 'Obecny tylko w B', 'not-seen': 'Nieobserwowany w B', unchanged: 'Obecny w A i B', unknown: 'Brak porównywalnego statusu',
};
export type DiagnosticComparison = {
  scope: 'same-ecu' | 'different-ecu' | 'unknown-ecu';
  commonStatuses: Dtc['status'][];
  codes: CodeChange[];
  parameters: Record<keyof typeof diagnosticParameters, { before: number | null; after: number | null; delta: number | null }>;
  elapsedMs: number;
  warnings: string[];
};
function sameEcu(a: DiagnosticSnapshot, b: DiagnosticSnapshot): boolean {
  return a.ecu !== undefined && b.ecu !== undefined && a.ecu.protocol === b.ecu.protocol && a.ecu.responseId === b.ecu.responseId;
}
export function compareDiagnostics(before: DiagnosticSnapshot, after: DiagnosticSnapshot): DiagnosticComparison {
  if (!validateDiagnosticSnapshot(before) || !validateDiagnosticSnapshot(after)) throw new ValidationError('Odczyt zawiera nieprawidłowe dane.');
  if (before.vehicleId !== after.vehicleId) throw new ValidationError('Wybierz dwa odczyty tego samego samochodu.');
  if (before.id === after.id || before.timestamp >= after.timestamp) throw new ValidationError('Odczyt A musi być innym, wcześniejszym pomiarem niż B.');
  const scope = sameEcu(before, after) ? 'same-ecu' : before.ecu && after.ecu ? 'different-ecu' : 'unknown-ecu';
  const statuses: Dtc['status'][] = ['stored', 'pending', 'permanent'];
  const commonStatuses = statuses.filter(status => before.readStatuses.includes(status) && after.readStatuses.includes(status));
  const warnings = ['Brak kodu w nowszym odczycie nie potwierdza naprawy ani sprawności pojazdu. Kasowanie kodów i inne warunki pomiaru mogą zmieniać wyniki.'];
  if (scope === 'different-ecu') warnings.push('Odczyty mają różne adresy ECU lub protokoły. Pokazujemy dane obok siebie, bez wyliczania zmian.');
  if (scope === 'unknown-ecu') warnings.push('Co najmniej jeden odczyt nie potwierdza adresu ECU. Pokazujemy dane obok siebie, bez wyliczania zmian.');
  if (!commonStatuses.length) warnings.push('Brak wspólnych statusów DTC — nie można porównać obecności kodów.');
  else if (commonStatuses.length < 3) warnings.push('Porównanie kodów jest częściowe. Nieodczytany status pozostaje nieznany.');
  if (before.source === 'import' || after.source === 'import') warnings.push('Co najmniej jeden odczyt jest importem. Powiązanie z autem, źródło i dane importu nie zostały zweryfikowane przez adapter.');
  warnings.push('Parametry są pomiarami chwilowymi, nie trendem ani oceną poprawy. Napięcie adaptera nie jest testem kondycji akumulatora.');
  const codes: CodeChange[] = [];
  if (scope === 'same-ecu') for (const status of statuses) {
    const a = new Set(before.codes.filter(c => c.status === status).map(c => c.code));
    const b = new Set(after.codes.filter(c => c.status === status).map(c => c.code));
    for (const code of [...new Set([...a, ...b])].sort()) {
      const was = before.readStatuses.includes(status) ? a.has(code) ? 'present' : 'absent' : 'unknown';
      const now = after.readStatuses.includes(status) ? b.has(code) ? 'present' : 'absent' : 'unknown';
      const change = was === 'unknown' || now === 'unknown' ? 'unknown' : was === 'present' && now === 'present' ? 'unchanged' : now === 'present' ? 'added' : 'not-seen';
      codes.push({ code, status, before: was, after: now, change });
    }
  }
  const parameters = Object.fromEntries(diagnosticParameterKeys.map(key => {
    const a = before.parameters[key], b = after.parameters[key];
    return [key, { before: a, after: b, delta: scope === 'same-ecu' && a !== null && b !== null ? Math.round((b - a) * 100) / 100 : null }];
  })) as DiagnosticComparison['parameters'];
  return { scope, commonStatuses, codes, parameters, elapsedMs: after.timestamp - before.timestamp, warnings };
}
export function selectDiagnosticPair(history: DiagnosticSnapshot[], vehicleId: string): { beforeId: string | null; afterId: string | null } {
  const sorted = history.filter(s => validateDiagnosticSnapshot(s) && s.vehicleId === vehicleId).sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id));
  const after = sorted[0]; if (!after) return { beforeId: null, afterId: null };
  const earlier = sorted.filter(s => s.id !== after.id && s.timestamp < after.timestamp);
  const before = earlier.find(s => sameEcu(s, after)) ?? earlier[0];
  return { beforeId: before?.id ?? null, afterId: after.id };
}
