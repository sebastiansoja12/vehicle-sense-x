import { addService, validDate, ValidationError } from './domain.ts';
import type { AppData } from './domain.ts';
import type { Reminder } from './records.ts';
import { addReminder } from './features.ts';
import { maintenanceComponents, scheduleDue, validMaintenanceSchedule, validOilObservation } from './maintenance-model.ts';
import type { MaintenanceComponent, MaintenanceSchedule, OilObservation } from './maintenance-model.ts';
export type MaintenanceInput = { vehicleId: string; component: MaintenanceComponent; action: 'inspect' | 'replace'; title: string; lastDate: string; lastMileage: string; intervalMonths: string; intervalKm: string; source: string };
function whole(value: string, optional = false): number | null {
  if (optional && value.trim() === '') return null;
  if (!/^\d+$/.test(value.trim()) || !Number.isSafeInteger(Number(value))) throw new ValidationError('Przebieg i interwały wymagają liczb całkowitych.');
  return Number(value);
}
export function saveMaintenancePlan(state: AppData, input: MaintenanceInput, id: string, today: string, replaceId?: string): AppData {
  const car = state.vehicles.find(v => v.id === input.vehicleId);
  const schedule: MaintenanceSchedule = { component: input.component, action: input.action, lastDate: input.lastDate.trim(), lastMileage: whole(input.lastMileage)!, intervalMonths: whole(input.intervalMonths, true), intervalKm: whole(input.intervalKm, true), source: input.source.trim() };
  if (!car || !validDate(today) || !validMaintenanceSchedule(schedule) || schedule.lastDate > today || schedule.lastMileage > car.mileage) throw new ValidationError('Sprawdź datę i przebieg ostatniej obsługi, dodatni interwał oraz źródło zaleceń.');
  const previous = replaceId ? state.reminders.find(r => r.id === replaceId && r.vehicleId === car.id && r.schedule && !r.completed) : undefined;
  if (replaceId && !previous) throw new ValidationError('Nie znaleziono aktywnego planu.');
  if (input.component !== 'other' && state.reminders.some(r => r.id !== replaceId && r.vehicleId === car.id && !r.completed && r.schedule?.component === input.component)) throw new ValidationError('Ta część ma już aktywny plan. Edytuj go.');
  const due = scheduleDue(schedule), trimmed = { ...state, reminders: state.reminders.filter(r => r.id !== replaceId) };
  const next = addReminder(trimmed, { vehicleId: car.id, title: input.title, dueDate: due.dueDate ?? '', dueMileage: due.dueMileage === null ? '' : String(due.dueMileage) }, previous?.id ?? id, today);
  next.reminders[next.reminders.length - 1] = { ...next.reminders.at(-1)!, schedule, notificationId: previous?.notificationId ?? null };
  return next;
}
export function maintenanceStatus(reminder: Reminder, mileage: number, today: string) {
  const s = reminder.schedule;
  if (!s || !validMaintenanceSchedule(s) || !validDate(today)) throw new ValidationError('Brak poprawnego harmonogramu.');
  const days = (date: string) => Date.parse(date + 'T12:00:00Z') / 86400000;
  const baselineConflict = mileage < s.lastMileage || today < s.lastDate;
  const remainingKm = reminder.dueMileage === null ? null : reminder.dueMileage - mileage;
  const remainingDays = reminder.dueDate === null ? null : days(reminder.dueDate) - days(today);
  const progresses = [s.intervalKm === null ? null : (mileage - s.lastMileage) / s.intervalKm, reminder.dueDate === null ? null : (days(today) - days(s.lastDate)) / (days(reminder.dueDate) - days(s.lastDate))].filter((v): v is number => v !== null);
  return { remainingKm, remainingDays, baselineConflict, due: !baselineConflict && (remainingKm !== null && remainingKm <= 0 || remainingDays !== null && remainingDays <= 0), progressPercent: baselineConflict ? null : Math.min(100, Math.max(0, ...progresses) * 100) };
}
export function recordMaintenance(state: AppData, reminderId: string, input: { date: string; mileage: string; cost: string; note: string }, serviceId: string, nextId: string, today: string): AppData {
  const reminder = state.reminders.find(r => r.id === reminderId && !r.completed && r.schedule);
  if (!reminder?.schedule) throw new ValidationError('Nie znaleziono aktywnego planu obsługi.');
  if (input.date < reminder.schedule.lastDate || Number(input.mileage) < reminder.schedule.lastMileage) throw new ValidationError('Obsługa nie może poprzedzać bazy tego planu.');
  const next = addService(state, { ...input, vehicleId: reminder.vehicleId, title: `${reminder.schedule.action === 'replace' ? 'Wymiana' : 'Kontrola'}: ${reminder.title}`.slice(0, 100) }, serviceId, today);
  next.service[next.service.length - 1] = { ...next.service.at(-1)!, maintenanceComponent: reminder.schedule.component };
  next.reminders = next.reminders.map(r => r.id === reminderId ? { ...r, completed: true } : r);
  const renewed = saveMaintenancePlan(next, { vehicleId: reminder.vehicleId, title: reminder.title, component: reminder.schedule.component, action: reminder.schedule.action, lastDate: input.date, lastMileage: input.mileage, intervalMonths: reminder.schedule.intervalMonths === null ? '' : String(reminder.schedule.intervalMonths), intervalKm: reminder.schedule.intervalKm === null ? '' : String(reminder.schedule.intervalKm), source: reminder.schedule.source }, nextId, today);
  if (reminder.notificationId !== null) renewed.reminders = renewed.reminders.map(r => r.id === nextId ? { ...r, notificationId: 'vsx-reminder-' + nextId } : r);
  return renewed;
}
export function addOilObservation(state: AppData, input: { vehicleId: string; date: string; mileage: string; level: OilObservation['level']; addedLiters: string; oilLifePercent: string; cost: string; note: string }, id: string, today: string, replaceId?: string): AppData {
  const previous = replaceId ? state.service.find(r => r.id === replaceId && r.vehicleId === input.vehicleId && r.oilObservation) : undefined;
  if (replaceId && !previous) throw new ValidationError('Nie znaleziono kontroli oleju dla tego auta.');
  const liters = input.addedLiters.trim().replace(',', '.'), life = input.oilLifePercent.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,3})?$/.test(liters) || life !== '' && !/^\d+(?:\.\d)?$/.test(life)) throw new ValidationError('Podaj ilość dolewki w litrach i opcjonalne wskazanie trwałości 0–100%.');
  const oilObservation: OilObservation = { level: input.level, addedMl: Math.round(Number(liters) * 1000), oilLifePercent: life === '' ? null : Number(life), source: 'manual' };
  if (!validOilObservation(oilObservation)) throw new ValidationError('Sprawdź poziom oleju, ilość dolewki i wskazanie 0–100%.');
  const next = addService({ ...state, service: state.service.filter(r => r.id !== replaceId) }, { vehicleId: input.vehicleId, date: input.date, mileage: input.mileage, title: oilObservation.addedMl ? 'Kontrola i dolewka oleju' : 'Kontrola oleju', cost: input.cost, note: input.note }, previous?.id ?? id, today);
  next.service[next.service.length - 1] = { ...next.service.at(-1)!, oilObservation, ...(previous?.attachments ? { attachments: previous.attachments } : {}) };
  return next;
}
export { maintenanceComponents };
