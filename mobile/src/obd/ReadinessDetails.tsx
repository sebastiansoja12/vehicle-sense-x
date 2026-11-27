import { Text, View } from 'react-native';
import type { DiagnosticSnapshot } from './types';
import { decodeReadiness, monitorLabels } from './readiness';
import { Note, number } from '../ui';
import { styles as s } from '../theme';

export function ReadinessDetails({ value }: { value: DiagnosticSnapshot }) {
  if (!value.readiness) return <Text style={[s.fine, { marginTop: 12 }]}>Gotowość emisji: brak danych w tym raporcie. Starsze raporty mogą nie zawierać tego odczytu; wymagane jest wsparcie PID 01 przez ECU i nowy pełny skan.</Text>;
  const result = decodeReadiness(value.readiness);
  return <View style={{ gap: 10, marginTop: 16 }}>
    <Text style={s.sectionTitle}>Monitory gotowości emisji OBD</Text>
    <Text style={s.body}>MIL według ECU: {result.mil ? 'włączona' : 'wyłączona'} · liczba DTC w PID 01: {result.dtcCount}</Text>
    <Text style={s.fine}>Typ zapłonu według ECU: {result.ignition === 'spark' ? 'iskrowy' : 'samoczynny'}. Liczba DTC z PID 01 nie jest sumą wszystkich statusów i sterowników.</Text>
    {result.monitors.map(m => <View key={m.id} style={s.between}><Text style={[s.muted, { flex: 1 }]}>{monitorLabels[m.id]}</Text><Text style={s.fine}>{!m.available ? 'Nieobsługiwany' : m.complete ? 'Zakończony' : 'Niezakończony'}</Text></View>)}
    <Text style={s.muted}>Rozgrzania od skasowania DTC: {value.readiness.warmupsSinceClear === null ? 'brak odczytu' : number(value.readiness.warmupsSinceClear)}</Text>
    <Text style={s.muted}>Dystans od skasowania DTC: {value.readiness.distanceSinceClearKm === null ? 'brak odczytu' : `${number(value.readiness.distanceSinceClearKm)} km`}</Text>
    <Note>Zakończenie monitorów nie oznacza pozytywnego badania technicznego. Niezakończone monitory lub niskie liczniki mogą mieć różne przyczyny; nie potwierdzają ukrywania usterek. To wartości zgłoszone przez wybrany ECU w czasie raportu.</Note>
  </View>;
}
