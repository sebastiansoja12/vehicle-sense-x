import { Text, View } from 'react-native';
import type { DiagnosticSnapshot } from './types';
import { number } from '../ui';
import { styles as s } from '../theme';
export function OilTemperatureDetails({ value }: { value: DiagnosticSnapshot }) {
  return <View style={{ marginTop: 12, gap: 6 }}><Text style={s.body}>Temperatura oleju: {value.oilTemperatureC == null ? 'brak odczytu' : `${number(value.oilTemperatureC, 1)} °C`}</Text><Text style={s.fine}>PID 5C · wartość z czasu raportu i wskazanego ECU. Temperatura nie określa poziomu oleju ani terminu wymiany. Ten moduł nie odczytuje poziomu ani pozostałej trwałości oleju przez OBD.</Text></View>;
}
