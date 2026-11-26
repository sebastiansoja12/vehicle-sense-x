export const seed = {
  vehicles: [{ id: 'tiguan', name: 'Volkswagen Tiguan', detail: '2.0 TDI · DSG · 4Motion', year: 2021, mileage: 68450, plate: 'WA 8426K', power: '150 KM', fuel: 'Diesel', vin: '', active: true }],
  fuel: [
    { id: 'f1', date: '2026-11-22', liters: 48.2, price: 6.49, mileage: 68450, full: true },
    { id: 'f2', date: '2026-11-08', liters: 45.6, price: 6.39, mileage: 67750, full: true },
    { id: 'f3', date: '2026-10-25', liters: 47.1, price: 6.44, mileage: 67050, full: true }
  ],
  service: [
    { id: 's1', title: 'Wymiana oleju i filtrów', date: '2026-08-18', mileage: 63450, cost: 690, note: 'Olej silnikowy i filtry: oleju, powietrza, kabinowy' },
    { id: 's2', title: 'Wymiana opon na zimowe', date: '2026-11-10', mileage: 67980, cost: 200, note: 'Komplet opon zimowych · wyważenie' }
  ]
};

export function fuelSummary(records) {
  const sorted = [...records].sort((a, b) => b.mileage - a.mileage);
  const cost = records.reduce((sum, r) => sum + r.liters * r.price, 0);
  // shortcut: incomplete fill-ups are not estimated; add interval aggregation when partial-fill analytics ships.
  const intervals = sorted.slice(0, -1).flatMap((record, i) => {
    const previous = sorted[i + 1];
    const distance = record.mileage - previous.mileage;
    return record.full && previous.full && distance > 0 ? [{ liters: record.liters, distance }] : [];
  });
  const distance = intervals.reduce((sum, r) => sum + r.distance, 0);
  const liters = intervals.reduce((sum, r) => sum + r.liters, 0);
  return { cost, consumption: distance ? liters / distance * 100 : null, distance };
}

export function validateFuel(record, latestMileage) {
  if (![record.liters, record.price, record.mileage].every(Number.isFinite)) return 'Wpisz poprawne wartości liczbowe.';
  if (record.liters <= 0 || record.liters > 250) return 'Ilość paliwa musi wynosić od 0 do 250 litrów.';
  if (record.price <= 0 || record.price > 100) return 'Wpisz poprawną cenę za litr.';
  if (!Number.isInteger(record.mileage) || record.mileage < latestMileage) return `Przebieg nie może być niższy niż ${latestMileage} km.`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date) || Number.isNaN(Date.parse(record.date))) return 'Wybierz poprawną datę.';
  return null;
}

export function csvCell(value) { return '"' + String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""') + '"'; }
