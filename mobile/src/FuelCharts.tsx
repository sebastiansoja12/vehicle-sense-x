import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import type { AppData } from './domain';
import { fuelAnalytics } from './fuel-analytics';
import { Button, Empty, Note, Section, Stat, displayDate, money, number } from './ui';
import { colors, styles as s } from './theme';
type Point = { id: string; label: string; value: number };
function Chart({ points, unit, bars = false, selected, select }: { points: Point[]; unit: string; bars?: boolean; selected: number; select: (index: number) => void }) {
  if (!points.length) return null;
  const max = Math.max(1, ...points.map(p => p.value)) * 1.1, x = (i: number) => 44 + (points.length === 1 ? 139 : i / (points.length - 1) * 278), y = (v: number) => 164 - v / max * 140;
  const selectedPoint = points[selected], barWidth = Math.min(24, 220 / points.length);
  return <View style={{ marginTop: 18 }}>
    <View accessible accessibilityRole="image" accessibilityLabel={`Wykres ${unit}. Wartości i wybór punktów poniżej.`}><Svg width="100%" height={210} viewBox="0 0 350 210">
      {[0, .5, 1].map(t => <Line key={t} x1={40} x2={332} y1={y(max * t)} y2={y(max * t)} stroke={colors.line} />)}
      {[0, .5, 1].map(t => <SvgText key={t} x={35} y={y(max * t) + 4} textAnchor="end" fontSize={10} fill={colors.muted}>{number(max * t, max < 20 ? 1 : 0)}</SvgText>)}
      {bars ? points.map((p, i) => <Rect key={p.id} x={x(i) - barWidth / 2} y={y(p.value)} width={barWidth} height={164 - y(p.value)} fill={i === selected ? colors.red : colors.ink} />)
        : <><Polyline points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')} fill="none" stroke={colors.ink} strokeWidth={2} />{points.map((p, i) => <Circle key={p.id} cx={x(i)} cy={y(p.value)} r={i === selected ? 5 : 3} fill={i === selected ? colors.red : colors.ink} />)}</>}
      <SvgText x={44} y={190} textAnchor="start" fontSize={10} fill={colors.muted}>{points[0].label}</SvgText><SvgText x={322} y={190} textAnchor="end" fontSize={10} fill={colors.muted}>{points.at(-1)!.label}</SvgText>
      <SvgText x={44} y={12} fontSize={10} fill={colors.muted}>{unit}</SvgText>
    </Svg></View>
    <Text accessibilityLiveRegion="polite" style={[s.body, { fontWeight: '600', marginBottom: 12 }]}>{selectedPoint.label} · {number(selectedPoint.value, 2)} {unit}</Text>
    <View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><Button label="Poprzedni punkt" secondary disabled={selected <= 0} onPress={() => select(selected - 1)} /></View><View style={{ flex: 1 }}><Button label="Następny punkt" secondary disabled={selected >= points.length - 1} onPress={() => select(selected + 1)} /></View></View>
  </View>;
}
export function FuelCharts({ data, vehicleId, today }: { data: AppData; vehicleId: string; today: string }) {
  const [range, setRange] = useState<6 | 12>(6), [periodId, setPeriodId] = useState(''), [monthId, setMonthId] = useState(''), [cost, setCost] = useState(false), [showPeriods, setShowPeriods] = useState(false);
  const all = fuelAnalytics(data, vehicleId, today), months = all.months.slice(-range), from = months[0].month;
  const periods = all.periods.filter(p => p.endDate.slice(0, 7) >= from), shown = periods.slice(-24);
  const measuredKm = periods.reduce((n, p) => n + p.distanceKm, 0), measuredMl = periods.reduce((n, p) => n + p.volumeMl, 0);
  const average = measuredKm ? measuredMl / 1000 / measuredKm * 100 : null;
  const periodIndex = Math.max(0, shown.findIndex(p => p.id === periodId) < 0 ? shown.length - 1 : shown.findIndex(p => p.id === periodId));
  const monthIndex = months.findIndex(m => m.month === monthId) < 0 ? months.length - 1 : months.findIndex(m => m.month === monthId), selected = shown[periodIndex];
  return <>
    <Section title="Spalanie i ilość paliwa">
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>{([6, 12] as const).map(n => <Pressable key={n} accessibilityRole="radio" aria-checked={range === n} accessibilityLabel={`${n} miesięcy`} onPress={() => setRange(n)} style={{ minHeight: 44, padding: 12, borderWidth: 1, borderColor: colors.ink, backgroundColor: range === n ? colors.ink : colors.paper }}><Text style={[s.body, { color: range === n ? colors.paper : colors.ink }]}>{n} miesięcy</Text></Pressable>)}</View>
      <Text style={[s.fine, { marginTop: 12 }]}>Zakres: {from} — {today}. Cykle przypisujemy do daty końcowego tankowania; mogą zaczynać się przed zakresem.</Text>
      <View style={s.stats}><Stat label="Spalanie · ważone dystansem" value={average === null ? '—' : number(average, 2)} unit="l/100 km" /><Stat label="Paliwo w zamkniętych cyklach" value={measuredKm ? number(measuredMl / 1000, 2) : '—'} unit="l" /><Stat label="Dystans pomiaru" value={measuredKm ? number(measuredKm) : '—'} unit="km" /><Stat label="Zakupione paliwo · zakres" value={number(months.reduce((n, m) => n + m.purchasedMl, 0) / 1000, 2)} unit="l" /></View>
      {shown.length ? <><Chart points={shown.map(p => ({ id: p.id, label: p.endDate, value: p.consumption }))} unit="l/100 km" selected={periodIndex} select={i => setPeriodId(shown[i].id)} /><Text style={[s.muted, { marginTop: 16 }]}>{displayDate(selected.startDate)} — {displayDate(selected.endDate)} · {number(selected.startMileage)} → {number(selected.endMileage)} km · {number(selected.volumeMl / 1000, 2)} l / {number(selected.distanceKm)} km.</Text><Text style={s.fine}>Oś pozioma: kolejne zamknięte cykle, bez proporcji odstępów czasu. Wykres pokazuje ostatnie {shown.length} z {periods.length} cykli w zakresie; średnia obejmuje wszystkie.</Text><View style={{ marginTop: 12 }}><Button label={showPeriods ? 'Ukryj wartości cykli' : 'Pokaż wartości cykli'} secondary onPress={() => setShowPeriods(!showPeriods)} /></View>{showPeriods && shown.map(p => <View key={p.id} style={s.listRow}><Text style={s.body}>{p.startDate} — {p.endDate} · {number(p.consumption, 2)} l/100 km</Text><Text style={s.fine}>{number(p.volumeMl / 1000, 2)} l · {number(p.distanceKm)} km</Text></View>)}</>
        : <Empty title="Brak zamkniętego pomiaru w zakresie" description="Zapisz co najmniej dwa tankowania do pełna z rosnącym przebiegiem. Tankowania częściowe pomiędzy nimi wliczamy do ilości paliwa." />}
      {all.openVolumeMl > 0 && <Text style={[s.muted, { marginTop: 16 }]}>Po ostatnim pełnym zbiorniku dopisano {number(all.openVolumeMl / 1000, 2)} l. Ten cykl nie jest jeszcze zamknięty i nie wchodzi do spalania.</Text>}
      {(all.issues.length > 0 || all.futureCount > 0) && <Note>{all.futureCount > 0 ? `Pominięto przyszłe tankowania: ${all.futureCount}. ` : ''}{all.issues.slice(0, 3).join(' ')}{all.issues.length > 3 ? ` Pozostałe ostrzeżenia: ${all.issues.length - 3}.` : ''}</Note>}
    </Section>
    <Section title="Zakupy paliwa miesiąc po miesiącu">
      <Text style={[s.muted, { marginTop: 16 }]}>Ilość i koszt zapisanych tankowań. Zakupione litry nie oznaczają paliwa spalonego dokładnie w tym miesiącu. Brak wpisów nie potwierdza braku jazdy.</Text>
      <View style={{ marginTop: 12 }}><Button label={cost ? 'Pokaż zakupione litry' : 'Pokaż koszt paliwa'} secondary onPress={() => setCost(!cost)} /></View>
      {months.some(m => m.fillCount) ? <><Chart points={months.map(m => ({ id: m.month, label: m.month, value: cost ? m.costCents / 100 : m.purchasedMl / 1000 }))} unit={cost ? 'zł' : 'l'} bars selected={monthIndex} select={i => setMonthId(months[i].month)} /><Text style={[s.fine, { marginTop: 14 }]}>{months[monthIndex].fillCount} tankowań · {number(months[monthIndex].purchasedMl / 1000, 2)} l · {money(months[monthIndex].costCents)}.</Text></> : <Empty title="Brak tankowań w zakresie" description="Dodaj tankowanie w Paliwie i kosztach, aby zobaczyć własny wykres." />}
    </Section>
  </>;
}
