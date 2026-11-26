import type {Reminder} from './records';
export async function requestReminderPermission(){throw new Error('Powiadomienia systemowe działają w aplikacji iOS i Android. Terminy w przeglądarce są widoczne na ekranie serwisu.');}
export async function reconcileReminders(_reminders:Reminder[]){/* Web reminders are shown in the app only. */}
