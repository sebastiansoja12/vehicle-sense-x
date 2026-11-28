import { useEffect, useRef, useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from './AppProvider';
import type { Vehicle } from './domain';
import { compareDiagnostics, selectDiagnosticPair, diagnosticParameterKeys, diagnosticParameters, dtcStatusLabels, codeChangeLabels } from './obd/comparison';
import type { DiagnosticComparison } from './obd/comparison';
import type { DiagnosticSnapshot } from './obd/types';
import { OilTemperatureDetails } from './obd/OilTemperatureDetails';
import { ReadinessDetails } from './obd/ReadinessDetails';
import { diagnosticComparisonHtml } from './reports';
import { shareReport } from './file-export';
import { Button, Empty, Note, Page, Section, Title, number } from './ui';
import { styles as s } from './theme';

function readingLabel(value: DiagnosticSnapshot) {
  return `${new Date(value.timestamp).toLocaleString('pl-PL')} · ${value.ecu ? `CAN ${value.ecu.responseId} / ${value.ecu.protocol}` : 'ECU niepotwierdzony'}`;
}
function ReadingDetails({ value, label }: { value: DiagnosticSnapshot; label: string }) {
  return <Section title={label}>
    <Text style={[s.body, { marginTop: 14 }]}>{readingLabel(value)}</Text>
    <Text style={s.fine}>{value.source === 'obd' ? 'Zapisany odczyt OBD2' : 'Import · bez weryfikacji adaptera'} · {value.adapterName}</Text>
    <Text style={[s.muted, { marginTop: 8 }]}>Odczytane statusy: {value.readStatuses.map(status => dtcStatusLabels[status]).join(', ')}</Text>
    <Text selectable style={[s.body, { marginTop: 8 }]}>{value.codes.length ? value.codes.map(c => `${c.code} (${dtcStatusLabels[c.status]})`).join(' · ') : 'Brak kodów w odczytanych statusach.'}</Text>
    <OilTemperatureDetails value={value} />
    {value.readiness !== undefined && <ReadinessDetails value={value} />}
  </Section>;
}
export function DiagnosticComparisonScreen() {
  const { data } = useApp();
  const params = useLocalSearchParams();
  const requested = typeof params.before === 'string' && params.before.length > 0 && params.before.length <= 200 && typeof params.after === 'string' && params.after.length > 0 && params.after.length <= 200 ? { beforeId: params.before, afterId: params.after } : undefined;
  const vehicle = data.vehicles.find(v => v.id === data.activeVehicleId);
  return vehicle ? <ComparisonForVehicle key={JSON.stringify([vehicle.id,requested?.beforeId,requested?.afterId])} vehicle={vehicle} requested={requested} /> : <Page><Title title="Porównanie diagnostyki" /><Empty title="Najpierw wybierz samochód" description="Porównujemy wyłącznie odczyty przypisane do tego samego auta." action={<Button label="Otwórz garaż" onPress={() => router.navigate('/garage')} />} /></Page>;
}
function ComparisonForVehicle({ vehicle, requested }: { vehicle: Vehicle; requested?: { beforeId: string; afterId: string } }) {
  const { data } = useApp();
  const history = data.diagnostics.filter(s => s.vehicleId === vehicle.id).sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id));
  const [selection, setSelection] = useState(() => requested ?? selectDiagnosticPair(history, vehicle.id));
  const [showPicker, setShowPicker] = useState(false), [page, setPage] = useState(0), [symptoms, setSymptoms] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const exporting = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const before = history.find(s => s.id === selection.beforeId), after = history.find(s => s.id === selection.afterId);
  let comparison: DiagnosticComparison | null = null, selectionError = '';
  if (before && after) {
    try { comparison = compareDiagnostics(before, after); } catch (e) { selectionError = e instanceof Error ? e.message : 'Wybierz inne odczyty.'; }
  } else if (history.length >= 2) selectionError = 'Wybrany odczyt jest niedostępny. Wybierz dwa odczyty z listy.';
  const pages = Math.max(1, Math.ceil(history.length / 20)), currentPage = Math.min(page, pages - 1);
  const pageRows = history.slice(currentPage * 20, currentPage * 20 + 20);
  function choose(id: string, side: 'beforeId' | 'afterId') { setSelection(current => ({ ...current, [side]: id })); setError(''); }
  async function exportReport(createdAt: number) {
    if (!before || !after || !comparison || exporting.current) return;
    exporting.current = true; setBusy(true); setError('');
    try { await shareReport(diagnosticComparisonHtml({ vehicle, before, after, symptoms, createdAt })); }
    catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Nie udało się przygotować raportu.'); }
    finally { exporting.current = false; if (mounted.current) setBusy(false); }
  }
  return <Page>
    <Button label="Diagnostyka" secondary onPress={() => router.navigate('/diagnostics')} /><View style={{ height: 18 }} />
    <Title title="Porównanie diagnostyki" subtitle={`${vehicle.make} ${vehicle.model} · zapisane odczyty`} />
    <Note>Porównaj odczyt A sprzed naprawy z późniejszym B. Zapisane raporty nie potwierdzają, czy między pomiarami wykonano naprawę albo skasowano kody. Porównanie działa lokalnie, bez internetu.</Note>
    {history.length < 2 && <Empty title="Potrzebne są dwa zapisane odczyty" description={`Zapisane dla tego auta: ${history.length}. Odczytaj i zapisz raport przed naprawą, a potem wykonaj i zapisz kolejny. Możesz też zaimportować raporty VehicleSenseX; importy będą oznaczone.`} action={<Button label="Przejdź do odczytu lub importu" onPress={() => router.navigate('/diagnostics')} />} />}
    {history.length > 0 && <Section title="Wybrane odczyty">
      <Text style={[s.body, { marginTop: 14 }]}>A · {before ? readingLabel(before) : 'Nie wybrano'}</Text>
      <Text style={[s.body, { marginVertical: 12 }]}>B · {after ? readingLabel(after) : 'Nie wybrano'}</Text>
      <Button label={showPicker ? 'Ukryj listę odczytów' : 'Wybierz inne odczyty'} secondary disabled={busy} onPress={() => setShowPicker(value => !value)} />
      {showPicker && <>
        <Text style={[s.fine, { marginTop: 14 }]}>Strona {currentPage + 1} z {pages} · {history.length} odczytów. A musi być wcześniejsze od B. Różnice wyliczamy tylko dla tego samego adresu ECU i protokołu.</Text>
        {pageRows.map(value => <View key={value.id} style={s.listRow}>
          <Text style={s.body}>{readingLabel(value)}</Text><Text style={s.fine}>{value.adapterName} · {value.source === 'import' ? 'Import bez weryfikacji' : 'OBD2'} · kody: {value.codes.length}</Text>
          <View style={[s.row, { flexWrap: 'wrap' }]}><Button label={`A${value.id === selection.beforeId ? ' · wybrany' : ' · wybierz'}`} secondary={value.id !== selection.beforeId} disabled={busy} onPress={() => choose(value.id, 'beforeId')} /><Button label={`B${value.id === selection.afterId ? ' · wybrany' : ' · wybierz'}`} secondary={value.id !== selection.afterId} disabled={busy} onPress={() => choose(value.id, 'afterId')} /></View>
        </View>)}
        <View style={[s.row, { marginTop: 14 }]}><Button label="Poprzednie 20" secondary disabled={busy || currentPage === 0} onPress={() => setPage(currentPage - 1)} /><Button label="Kolejne 20" secondary disabled={busy || currentPage + 1 >= pages} onPress={() => setPage(currentPage + 1)} /></View>
      </>}
    </Section>}
    {selectionError !== '' && <Text accessibilityRole="alert" style={s.error}>{selectionError}</Text>}
    {comparison && before && after && <>
      <Section title="Zakres porównania">
        <Text style={[s.body, { marginTop: 14 }]}>{comparison.scope === 'same-ecu' ? `Ten sam adres CAN ${before.ecu!.responseId} · protokół ${before.ecu!.protocol}` : 'Zakres ECU jest różny lub niepotwierdzony — bez wyliczania zmian.'}</Text>
        <Text style={s.muted}>Czas między zapisanymi pomiarami: {number(comparison.elapsedMs / 3_600_000, 2)} h. Data pochodzi z odczytu; import nie potwierdza jej autentyczności.</Text>
        <Text style={[s.fine, { marginTop: 8 }]}>Wspólnie odczytane statusy: {comparison.commonStatuses.map(status => dtcStatusLabels[status]).join(', ') || 'brak'}.</Text>
      </Section>
      <ReadingDetails value={before} label="A — wcześniejszy odczyt" /><ReadingDetails value={after} label="B — późniejszy odczyt" />
      {comparison.scope === 'same-ecu' && <Section title="Kody i ich statusy">
        {comparison.codes.length ? comparison.codes.map(code => <View key={`${code.status}-${code.code}`} style={s.listRow}><Text style={[s.body, { fontWeight: '700' }]}>{code.code} · {dtcStatusLabels[code.status]}</Text><Text style={s.muted}>{codeChangeLabels[code.change]}</Text><Text style={s.fine}>A: {code.before === 'unknown' ? 'status nieodczytany' : code.before === 'present' ? 'obecny' : 'nieobserwowany'} · B: {code.after === 'unknown' ? 'status nieodczytany' : code.after === 'present' ? 'obecny' : 'nieobserwowany'}</Text></View>) : <Text style={[s.muted, { marginTop: 14 }]}>Brak kodów do porównania w odczytanych statusach. Nie potwierdza to sprawności auta.</Text>}
      </Section>}
      <Section title="Parametry chwilowe · A i B">
        {diagnosticParameterKeys.map(key => { const p = comparison.parameters[key], meta = diagnosticParameters[key]; return <View key={key} style={s.listRow}><Text style={s.body}>{meta.label}</Text><Text style={s.muted}>A: {p.before === null ? 'brak odczytu' : `${number(p.before, meta.digits)} ${meta.unit}`} · B: {p.after === null ? 'brak odczytu' : `${number(p.after, meta.digits)} ${meta.unit}`}</Text><Text style={s.fine}>B minus A: {p.delta === null ? 'brak porównania' : `${p.delta > 0 ? '+' : ''}${number(p.delta, meta.digits)} ${meta.unit}`}</Text></View>; })}
      </Section>
      <Section title="Jak interpretować wynik?">{comparison.warnings.map(warning => <Text key={warning} style={[s.muted, { marginTop: 12 }]}>{warning}</Text>)}</Section>
      <Section title="Raport dla warsztatu">
        <View style={[s.field, { marginTop: 16 }]}><Text style={s.label}>Objawy i warunki występowania · opcjonalnie</Text><TextInput accessibilityLabel="Objawy do raportu dla warsztatu" style={[s.input, { minHeight: 120, textAlignVertical: 'top' }]} value={symptoms} editable={!busy} onChangeText={setSymptoms} multiline maxLength={2000} placeholder="np. Szarpanie po rozgrzaniu, podczas przyspieszania. Kontrolka zapaliła się wczoraj." /><Text style={s.fine}>{symptoms.length}/2000 · opis nie jest zapisywany w garażu; opuszczenie ekranu może go usunąć.</Text></View>
        <Text style={[s.muted, { marginBottom: 14 }]}>Raport zawiera dwa wybrane odczyty, opis auta i wpisane objawy. Pomijamy VIN, tablice, ślady GPS oraz historię serwisu. Nazwy adapterów i opis objawów zostaną wyeksportowane — sprawdź, czy nie zawierają danych osobowych.</Text>
        <Button label={busy ? 'Przygotowywanie raportu…' : Platform.OS === 'web' ? 'Pobierz porównanie HTML' : 'Udostępnij porównanie PDF'} disabled={busy} onPress={() => void exportReport(Date.now())} />
        <View style={{ gap: 12, marginTop: 16 }}><Button label="Znajdź warsztat w okolicy" secondary onPress={() => router.push('/workshops')} /><Button label="Otwórz historię serwisu" secondary onPress={() => router.push('/maintenance')} /></View>
      </Section>
    </>}
    {error !== '' && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  </Page>;
}
