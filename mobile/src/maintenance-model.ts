import { ValidationError } from './validation.ts';
export const maintenanceComponents = {
  'engine-oil': 'Olej silnikowy', 'oil-level': 'Poziom oleju — kontrola', 'oil-filter': 'Filtr oleju', 'air-filter': 'Filtr powietrza', 'cabin-filter': 'Filtr kabinowy',
  'fuel-filter': 'Filtr paliwa', 'brake-fluid': 'Płyn hamulcowy', coolant: 'Płyn chłodniczy', timing: 'Rozrząd',
  transmission: 'Olej skrzyni biegów', 'spark-plugs': 'Świece zapłonowe', brakes: 'Hamulce', tires: 'Opony', battery: 'Akumulator', other: 'Inna czynność',
} as const;
export type MaintenanceComponent = keyof typeof maintenanceComponents;
export type MaintenanceSchedule = { component: MaintenanceComponent; action: 'inspect' | 'replace'; lastDate: string; lastMileage: number; intervalMonths: number | null; intervalKm: number | null; source: string };
export type OilObservation = { level: 'low' | 'normal' | 'high' | 'unknown'; addedMl: number; oilLifePercent: number | null; source: 'manual' };
export const oilLevelLabels = { low: 'Poniżej minimum', normal: 'W zakresie według kontroli', high: 'Powyżej maksimum', unknown: 'Nie sprawdzono / nieznany' } as const;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const integer = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= min && v <= max;
function day(v: unknown): v is string { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '1900-01-01' && Number.isFinite(Date.parse(v + 'T12:00:00Z')) && new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) === v; }
export function validMaintenanceSchedule(value: unknown): value is MaintenanceSchedule {
  if (!record(value) || typeof value.component !== 'string' || !Object.hasOwn(maintenanceComponents, value.component) || !['inspect', 'replace'].includes(String(value.action)) || !day(value.lastDate) || !integer(value.lastMileage, 0, 5000000) || typeof value.source !== 'string' || !value.source.trim() || value.source.length > 300) return false;
  return (value.intervalMonths === null || integer(value.intervalMonths, 1, 1200)) && (value.intervalKm === null || integer(value.intervalKm, 1, 5000000))
    && (value.intervalMonths !== null || value.intervalKm !== null) && (value.intervalKm === null || value.lastMileage + value.intervalKm <= 5000000)
    && (value.intervalMonths === null || Number(value.lastDate.slice(0, 4)) * 12 + Number(value.lastDate.slice(5, 7)) - 1 + value.intervalMonths < 10000 * 12);
}
export function scheduleDue(schedule: MaintenanceSchedule): { dueDate: string | null; dueMileage: number | null } {
  if (!validMaintenanceSchedule(schedule)) throw new ValidationError('Sprawdź bazę, interwały i źródło harmonogramu.');
  let dueDate: string | null = null;
  if (schedule.intervalMonths !== null) {
    const [year, month, date] = schedule.lastDate.split('-').map(Number), targetMonth = month - 1 + schedule.intervalMonths;
    const end = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
    dueDate = new Date(Date.UTC(year, targetMonth, Math.min(date, end))).toISOString().slice(0, 10);
  }
  return { dueDate, dueMileage: schedule.intervalKm === null ? null : schedule.lastMileage + schedule.intervalKm };
}
export function validOilObservation(value: unknown): value is OilObservation {
  return record(value) && typeof value.level === 'string' && Object.hasOwn(oilLevelLabels, value.level) && integer(value.addedMl, 0, 50000) && value.source === 'manual'
    && (value.oilLifePercent === null || typeof value.oilLifePercent === 'number' && Number.isFinite(value.oilLifePercent) && value.oilLifePercent >= 0 && value.oilLifePercent <= 100);
}
