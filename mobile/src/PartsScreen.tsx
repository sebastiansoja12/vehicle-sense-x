import { useState } from 'react';
import { Linking, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from './AppProvider';
import { buildPartsQuery, searchAutomotive } from './automotive-client';
import type { ServiceResults } from './automotive-client';
import { ServiceConnection, ServiceConsent, ServiceSetupNote, useAutomotive, useServiceTask } from './AutomotiveProvider';
import { Button, Empty, Note, Page, Section, Title } from './ui';
import { styles as s } from './theme';
const amount = (minor: number, currency: string) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(minor / 100);

export function PartsScreen() {
  const { data } = useApp(), { session } = useAutomotive();
  const car = data.vehicles.find(v => v.id === data.activeVehicleId);
  return <PartsSearch key={JSON.stringify([session, car?.id, car?.make, car?.model, car?.year, car?.engine])} />;
}
function PartsSearch() {
  const app = useApp(), { config, ready } = useAutomotive(), task = useServiceTask();
  const car = app.data.vehicles.find(v => v.id === app.data.activeVehicleId);
  const [part, setPart] = useState(''), [includeCar, setIncludeCar] = useState(true), [consent, setConsent] = useState(false);
  const [result, setResult] = useState<ServiceResults['parts'] | null>(null);
  const { cancel } = task;
  let preview = '', queryError = '';
  try { preview = buildPartsQuery(part, includeCar ? car : undefined); } catch (e) { queryError = e instanceof Error ? e.message : 'Sprawdź zapytanie.'; }
  async function search() {
    setResult(null);
    const value = await task.run(signal => searchAutomotive({ ...config, kind: 'parts', input: { query: preview }, consent, signal }));
    if (value) setResult(value);
  }
  async function open(url: string) { try { await Linking.openURL(url); } catch { task.setError('Nie udało się otworzyć oferty w sklepie.'); } }
  return <Page><Button label="Wróć" secondary onPress={() => router.back()} /><View style={{ height: 18 }} /><Title title="Części i ceny" subtitle="Rzeczywiste oferty eBay · rynek polski" />
    <Section title="Jakiej części szukasz?">
      <View style={[s.field, { marginTop: 16 }]}><Text style={s.label}>Nazwa części lub numer OEM producenta</Text><TextInput accessibilityLabel="Część lub numer OEM" style={s.input} value={part} editable={!task.busy} onChangeText={value => { setPart(value); setResult(null); }} maxLength={160} placeholder="np. filtr oleju lub 90915-YZZJ1" /></View>
      {car ? <><Text style={s.muted}>Wybrane auto: {car.make} {car.model} · {car.year} · {car.engine}</Text><View style={[s.row, { marginVertical: 16 }]}><Switch accessibilityLabel="Dodaj markę, model, rok i silnik do wyszukiwania części" value={includeCar} disabled={task.busy} onValueChange={value => { setIncludeCar(value); setResult(null); setConsent(false); }} /><Text style={[s.muted, { flex: 1 }]}>Uwzględnij opis mojego auta w wyszukiwaniu</Text></View></> : <Note>Możesz wyszukiwać po nazwie lub numerze OEM bez dodawania samochodu. Auto dodasz w garażu.</Note>}
      <Text selectable style={s.fine}>{preview ? `Zapytanie do eBay: ${preview}` : queryError}</Text>
      <ServiceConsent value={consent} onChange={value => { cancel(); setConsent(value); }}>Zgadzam się wysłać widoczne zapytanie do prywatnego serwera i eBay. Gdy włączę opis auta, zawiera markę, model, rocznik i silnik. Bez VIN, tablic, przebiegu i historii.</ServiceConsent>
      <View style={{ gap: 12 }}><Button label={task.busy ? 'Pobieranie ofert…' : 'Pokaż oferty i ceny'} disabled={!ready || !consent || task.busy || !preview} onPress={() => void search()} />{task.busy && <Button label="Anuluj wyszukiwanie" secondary onPress={cancel} />}</View>
    </Section>
    <Note>Wyszukiwanie po opisie auta nie potwierdza zgodności części. Sprawdź numer OEM, wersję silnika i dopasowanie u sprzedawcy. Cena dotyczy oferty, bez robocizny; nie jest wyceną naprawy.</Note>
    {result && <Section title={`Oferty: ${result.offers.length}`}>
      <Text style={[s.fine, { marginTop: 12 }]}>Źródło: eBay · EBAY_PL · pobrano {new Date(result.fetchedAt).toLocaleString('pl-PL')}. Kolejność dostawcy; pokazujemy do 20 ofert.</Text>
      <Text style={s.fine}>Zapytanie: {result.query}</Text>
      {result.skipped > 0 && <Note>Pominięto {result.skipped} ofert z niepełnymi lub nieobsługiwanymi danymi.</Note>}
      {!result.offers.length && <Empty title="Brak ofert dla tego zapytania" description="Spróbuj numeru OEM, krótszej nazwy części lub wyłącz dołączanie opisu auta. Brak wyników nie oznacza braku części na rynku." />}
      {result.offers.map(offer => <View key={offer.id} style={s.listRow}><Text style={[s.body, { fontWeight: '700' }]}>{offer.title}</Text><Text style={[s.statValue, { fontSize: 27 }]}>{amount(offer.priceMinor, offer.currency)}</Text><Text style={s.muted}>{offer.shippingMinor === null ? 'Dostawa: koszt nieznany — sprawdź w ofercie.' : `Dostawa według oferty: od ${amount(offer.shippingMinor, offer.currency)} · razem od ${amount(offer.priceMinor + offer.shippingMinor, offer.currency)}`}</Text><Text style={s.fine}>Sprzedawca: {offer.seller || 'brak danych'} · Stan: {offer.condition || 'brak danych'}</Text><Button label="Szczegóły i zakup u sprzedawcy" secondary onPress={() => void open(offer.url)} /></View>)}
      <Text style={[s.fine, { marginTop: 14 }]}>Waluta pozostaje zgodna z ofertą — bez przeliczeń kursowych. Ceny i dostępność mogą się zmienić. Dostawa zależy od adresu i wybranej opcji; końcową kwotę sprawdź u sprzedawcy. Przegląd ofert odbywa się w aplikacji, zakup na stronie eBay.</Text>
      <Button label="Odśwież ceny" secondary disabled={task.busy || !consent} onPress={() => void search()} />
    </Section>}
    {task.error !== '' && <Text accessibilityRole="alert" style={s.error}>{task.error}</Text>}
    {!ready && <><ServiceSetupNote /><ServiceConnection /></>}
  </Page>;
}
