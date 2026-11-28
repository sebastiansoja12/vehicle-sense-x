import type { AppData, FuelEntry } from './domain.ts';
import { validDate, ValidationError } from './validation.ts';
export type FuelPeriod = { id: string; startDate: string; endDate: string; startMileage: number; endMileage: number; volumeMl: number; distanceKm: number; consumption: number };
export function fuelMeasurements(entries: FuelEntry[]) {
  const fuel = [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.mileage - b.mileage || a.id.localeCompare(b.id));
  const periods: FuelPeriod[] = [], issues: string[] = [];
  let anchor: FuelEntry | null = null, accumulatedMl = 0, previousMileage: number | null = null;
  for (let i = 0; i < fuel.length;) {
    const entry = fuel[i]; let end = i + 1;
    while (end < fuel.length && fuel[end].mileage === entry.mileage) end++;
    if (end - i > 1 || previousMileage !== null && entry.mileage < previousMileage) {
      issues.push(`${entry.date} · ${entry.mileage} km: powtórzony lub malejący przebieg przerywa pomiar. Sprawdź wpisy tankowań.`);
      anchor = null; accumulatedMl = 0;
    } else {
      if (anchor) accumulatedMl += entry.volumeMl;
      if (entry.full) {
        if (anchor) {
          const distanceKm = entry.mileage - anchor.mileage;
          periods.push({ id: entry.id, startDate: anchor.date, endDate: entry.date, startMileage: anchor.mileage, endMileage: entry.mileage, volumeMl: accumulatedMl, distanceKm, consumption: accumulatedMl / 1000 / distanceKm * 100 });
        }
        anchor = entry; accumulatedMl = 0;
      }
    }
    previousMileage = entry.mileage; i = end;
  }
  const measuredDistanceKm = periods.reduce((n, p) => n + p.distanceKm, 0), measuredVolumeMl = periods.reduce((n, p) => n + p.volumeMl, 0);
  return { periods, issues, measuredDistanceKm, measuredVolumeMl, consumption: measuredDistanceKm ? measuredVolumeMl / 1000 / measuredDistanceKm * 100 : null, openVolumeMl: accumulatedMl };
}
export function fuelAnalytics(state: AppData, vehicleId: string, today: string) {
  if (!state.vehicles.some(v => v.id === vehicleId) || !validDate(today)) throw new ValidationError('Wybierz samochód i poprawną datę analizy.');
  const own = state.fuel.filter(f => f.vehicleId === vehicleId);
  const fuel = own.filter(f => f.date <= today).sort((a, b) => a.date.localeCompare(b.date) || a.mileage - b.mileage || a.id.localeCompare(b.id));
  const measured = fuelMeasurements(fuel);
  const [year, month] = today.split('-').map(Number);
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 12 + i, 1));
    const key = date.toISOString().slice(0, 7), entries = fuel.filter(f => f.date.startsWith(key));
    return { month: key, purchasedMl: entries.reduce((n, f) => n + f.volumeMl, 0), costCents: entries.reduce((n, f) => n + f.costCents, 0), fillCount: entries.length };
  });
  return { ...measured, months, futureCount: own.filter(f => f.date > today).length };
}
