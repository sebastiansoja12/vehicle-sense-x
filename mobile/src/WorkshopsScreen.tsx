import { useState } from 'react';
import { Linking, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { searchAutomotive, navigationUrl, workshopCategories } from './automotive-client';
import type { Place, ServiceResults, WorkshopCategory } from './automotive-client';
import { ServiceConnection, ServiceConsent, ServiceSetupNote, useAutomotive, useServiceTask } from './AutomotiveProvider';
import { Button, Empty, Note, Page, Section, Title, number } from './ui';
import { styles as s } from './theme';

export function WorkshopsScreen() {
  const { session } = useAutomotive();
  return <WorkshopSearch key={session} />;
}
function WorkshopSearch() {
  const { config, ready } = useAutomotive(), task = useServiceTask();
  const [city, setCity] = useState(''), [consent, setConsent] = useState(false), [places, setPlaces] = useState<Place[]>([]), [placeSearched, setPlaceSearched] = useState(false);
  const [origin, setOrigin] = useState<Place | null>(null), [radiusKm, setRadius] = useState(10), [category, setCategory] = useState<WorkshopCategory>('repair');
  const [result, setResult] = useState<ServiceResults['workshops'] | null>(null);
  const { cancel } = task;
  function changeFilter(change: () => void) { cancel(); change(); setResult(null); }
  async function findCity() {
    setResult(null); setPlaces([]); setOrigin(null); setPlaceSearched(false);
    const value = await task.run(signal => searchAutomotive({ ...config, kind: 'places', input: { query: city }, consent, signal }));
    if (value) { setPlaces(value.places); setPlaceSearched(true); }
  }
  async function find(selected: Place) {
    setResult(null); setOrigin(selected);
    const value = await task.run(signal => searchAutomotive({ ...config, kind: 'workshops', input: { latitude: selected.latitude, longitude: selected.longitude, radiusKm, category }, consent, signal }));
    if (value) setResult(value);
  }
  async function gps() {
    setResult(null); setPlaces([]); setOrigin(null); setPlaceSearched(false);
    const value = await task.run(async signal => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (signal.aborted) throw new Error('Anulowano lokalizację.');
      if (permission.status !== 'granted') throw new Error('Brak zgody na GPS. Wpisz miejscowość lub włącz uprawnienie w ustawieniach telefonu.');
      const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (signal.aborted) throw new Error('Anulowano lokalizację.');
      if (Date.now() - fix.timestamp > 120_000 || fix.coords.accuracy === null || fix.coords.accuracy > 5000) throw new Error('Lokalizacja jest zbyt stara lub niedokładna. Wpisz miejscowość albo ponów GPS.');
      const selected: Place = { id: 'gps', label: `Moja lokalizacja · dokładność około ${Math.round(fix.coords.accuracy)} m`, latitude: fix.coords.latitude, longitude: fix.coords.longitude };
      const response = await searchAutomotive({ ...config, kind: 'workshops', input: { latitude: selected.latitude, longitude: selected.longitude, radiusKm, category }, consent, signal });
      return { selected, response };
    });
    if (value) { setOrigin(value.selected); setResult(value.response); }
  }
  async function open(url: string) { try { await Linking.openURL(url); } catch { task.setError('Nie udało się otworzyć telefonu, strony lub nawigacji.'); } }
  return <Page>
    <Button label="Wróć" secondary onPress={() => router.back()} /><View style={{ height: 18 }} />
    <Title title="Warsztaty w okolicy" subtitle="Warsztat, wulkanizacja, przegląd i sklep z częściami" />
    <Section title="Gdzie szukamy?">
      <View style={[s.field, { marginTop: 16 }]}><Text style={s.label}>Miejscowość lub adres w Polsce</Text><TextInput accessibilityLabel="Miejscowość lub adres warsztatu" style={s.input} value={city} editable={!task.busy} onChangeText={value => { setCity(value); setPlaces([]); setPlaceSearched(false); setOrigin(null); setResult(null); }} maxLength={120} placeholder="np. Poznań, Jeżyce" /></View>
      <Text style={s.label}>Rodzaj miejsca</Text><View style={{ gap: 8 }}>{(Object.keys(workshopCategories) as WorkshopCategory[]).map(key => <Button key={key} label={`${category === key ? '✓ ' : ''}${workshopCategories[key]}`} secondary={category !== key} disabled={task.busy} onPress={() => changeFilter(() => setCategory(key))} />)}</View>
      <Text style={[s.label, { marginTop: 18 }]}>Promień wyszukiwania</Text><View style={s.row}>{[5, 10, 25].map(km => <View key={km} style={{ flex: 1 }}><Button label={`${km} km${radiusKm === km ? ' ✓' : ''}`} secondary={radiusKm !== km} disabled={task.busy} onPress={() => changeFilter(() => setRadius(km))} /></View>)}</View>
      <ServiceConsent value={consent} onChange={value => { cancel(); setConsent(value); }}>Zgadzam się wysłać wpisany adres do serwera i Nominatim, a wybraną lokalizację/GPS oraz promień do serwera i Overpass (OpenStreetMap). VIN, tablice i historia auta nie są wysyłane. GPS pobieramy jednorazowo po naciśnięciu przycisku.</ServiceConsent>
      <View style={{ gap: 12 }}><Button label={task.busy ? 'Trwa wyszukiwanie…' : 'Szukaj miejscowości'} disabled={!ready || !consent || task.busy || city.trim().length < 2} onPress={() => void findCity()} /><Button label="Szukaj przy mojej lokalizacji GPS" secondary disabled={!ready || !consent || task.busy} onPress={() => void gps()} />{origin && <Button label="Szukaj ponownie w wybranym miejscu" secondary disabled={!ready || !consent || task.busy} onPress={() => void find(origin)} />}{task.busy && <Button label="Anuluj wyszukiwanie" secondary onPress={cancel} />}</View>
    </Section>
    {places.length > 0 && <Section title="Wybierz miejscowość">{places.map(p => <View key={p.id} style={s.listRow}><Text style={s.body}>{p.label}</Text><Button label="Szukaj w tej okolicy" secondary disabled={task.busy || !consent} onPress={() => void find(p)} /></View>)}</Section>}
    {placeSearched && !places.length && <Empty title="Nie znaleziono miejscowości" description="Podaj większą miejscowość, pełniejszy adres lub użyj GPS." />}
    {origin && <Note>{origin.label}. Odległości są mierzone w linii prostej od wybranego punktu; dojazd może być dłuższy.</Note>}
    {result && <Section title={`${workshopCategories[result.category]} · wyniki: ${result.workshops.length}`}>
      <Text style={[s.fine, { marginTop: 12 }]}>Źródło: OpenStreetMap · pobrano {new Date(result.fetchedAt).toLocaleString('pl-PL')} · promień {result.radiusKm} km</Text>
      {result.limited && <Note>Lista jest ograniczona. Zmniejsz promień, aby zobaczyć więcej miejsc w najbliższym otoczeniu.</Note>}
      {!result.workshops.length && <Empty title="Brak miejsc w tym obszarze" description="Zwiększ promień lub zmień kategorię. Brak wpisu w OpenStreetMap nie oznacza, że w okolicy nie ma warsztatów." />}
      {result.workshops.map(shop => <View key={shop.id} style={s.listRow}><Text style={[s.body, { fontWeight: '700' }]}>{shop.name}</Text><Text style={s.muted}>{number(shop.distanceM / 1000, 1)} km w linii prostej · {shop.address || 'Brak adresu w źródle'}</Text><Text style={s.fine}>Godziny według OSM: {shop.openingHours || 'brak danych'}. Potwierdź telefonicznie.</Text><View style={{ gap: 10, marginTop: 8 }}>{shop.phone && <Button label={`Zadzwoń: ${shop.phone}`} secondary onPress={() => void open(`tel:${shop.phone}`)} />}<Button label="Wyznacz dojazd" secondary onPress={() => void open(navigationUrl(shop))} />{shop.website && <Button label="Strona warsztatu" secondary onPress={() => void open(shop.website!)} />}</View></View>)}
      <Text style={[s.fine, { marginTop: 14 }]}>© autorzy OpenStreetMap · ODbL. Dane mogą być niepełne lub nieaktualne; brak ocen i potwierdzenia jakości usług.</Text><Button label="Źródło i licencja OpenStreetMap" secondary onPress={() => void open('https://www.openstreetmap.org/copyright')} />
    </Section>}
    {task.error !== '' && <Text accessibilityRole="alert" style={s.error}>{task.error}</Text>}
    {!ready && <><ServiceSetupNote /><ServiceConnection /></>}
  </Page>;
}
