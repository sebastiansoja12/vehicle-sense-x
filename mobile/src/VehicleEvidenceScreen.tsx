import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from './AppProvider';
import { localDay } from './domain';
import { buildVehicleEvidence, evidenceStatusLabels } from './vehicle-evidence';
import { Button, Empty, Note, Page, Section, Title, number } from './ui';
import { styles as s } from './theme';

export function VehicleEvidenceScreen() {
  const { data } = useApp(), vehicle = data.vehicles.find(v => v.id === data.activeVehicleId);
  if (!vehicle) return <Page><Title title="Audyt danych samochodu" /><Empty title="Najpierw wybierz samochód" description="Audyt sprawdza istniejące dane wybranego auta, bez zapytań do internetu." action={<Button label="Otwórz garaż" onPress={() => router.navigate('/garage')} />} /></Page>;
  const evidence = buildVehicleEvidence(data, vehicle.id, localDay());
  const routes = { diagnostics: '/diagnostics', garage: '/garage', maintenance: '/maintenance', expenses: '/expenses', comparison: '/diagnostic-comparison' } as const;
  return <Page><Button label="Wróć do garażu" secondary onPress={() => router.navigate('/garage')} /><View style={{ height: 18 }} /><Title title="Audyt danych samochodu" subtitle={`${vehicle.make} ${vehicle.model} · ${evidence.checkedOn}`} />
    <Note>Sprawdzamy kompletność i spójność zapisanych informacji. To nie jest ocena stanu technicznego, wykrywanie oszustwa ani punktowy certyfikat sprawności. Cała analiza działa lokalnie.</Note>
    {evidence.items.map(item => <Section key={item.id} title={item.title}>
      <Text style={[s.body, { marginTop: 14, fontWeight: '700' }]}>{evidenceStatusLabels[item.status]}</Text>
      {item.details.map(detail => <Text key={detail} style={[s.muted, { marginTop: 10 }]}>{detail}</Text>)}
      <View style={{ marginTop: 14 }}><Button label={item.action === 'comparison' ? 'Otwórz porównanie odczytów' : 'Przejdź do danych źródłowych'} secondary onPress={() => {
        const pair = evidence.followUp;
        if (item.action === 'comparison' && pair.beforeId && pair.afterId) router.push({ pathname: '/diagnostic-comparison', params: { before: pair.beforeId, after: pair.afterId } });
        else router.push(routes[item.action]);
      }} /></View>
    </Section>)}
    {evidence.mileageConflicts.length > 0 && <Section title="Wpisy wymagające sprawdzenia">
      {evidence.mileageConflicts.slice(0, 10).map((c, i) => <View key={`${c.earlierId}-${c.laterId}-${i}`} style={s.listRow}><Text style={s.body}>{c.earlierDate}: {number(c.earlierMileage)} km → {c.laterDate}: {number(c.laterMileage)} km</Text><Text style={s.fine}>Późniejsza data ma niższy przebieg. Sprawdź wpisy paliwa i serwisu oraz jednostki. Nie poprawiamy ich automatycznie.</Text></View>)}
      {evidence.mileageConflicts.length > 10 && <Text style={s.fine}>Pokazano 10 z {evidence.mileageConflicts.length} niespójności.</Text>}
    </Section>}
    <Note>Metadane źródła, daty i kopie garażu nie są podpisem cyfrowym ani niezależnym potwierdzeniem autentyczności. Brak wykrytej niespójności oznacza wyłącznie brak sprzeczności w dostępnych danych.</Note>
  </Page>;
}
