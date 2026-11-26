import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createRadioTest, openBluetoothSettings } from './radio';
import { Button, Note, Page, Section, Title } from './ui';
import { styles as s } from './theme';

export function ConnectionsScreen() {
  const player = useMemo(() => createRadioTest(), []);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const focused = useRef(false);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    setPlaying(false);
    return () => { focused.current = false; void player.stop().catch(() => {}); };
  }, [player]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') void player.stop().catch(() => {});
    });
    return () => subscription.remove();
  }, [player]);
  async function settings() {
    setError('');
    try { await openBluetoothSettings(); }
    catch { if (focused.current) setError('Otwórz ręcznie ustawienia Bluetooth telefonu i sparuj radio lub adapter.'); }
  }
  async function testAudio() {
    if (playing) return;
    setPlaying(true); setError(''); setMessage('');
    try {
      await player.play();
      if (focused.current) setMessage('Próba zakończona. Sprawdź, czy komunikat było słychać w radiu. Zakończenie syntezy mowy nie potwierdza wybranego wyjścia Bluetooth.');
    } catch (e) { if (focused.current) setError(e instanceof Error ? e.message : 'Próba dźwięku nie powiodła się.'); }
    finally { if (focused.current) setPlaying(false); }
  }
  return <Page>
    <Button label="Wróć" secondary onPress={() => router.back()} />
    <Title title="Połączenia" subtitle="Adapter OBD2 i radio samochodowe" />
    <Section title="Radio Bluetooth">
      <Text style={[s.body, { marginTop: 16 }]}>Sparuj telefon z radiem w ustawieniach Bluetooth. W radiu wybierz źródło Bluetooth Audio, a w telefonie włącz dźwięk multimediów dla tego urządzenia.</Text>
      <Text style={[s.muted, { marginVertical: 14 }]}>Telefon może jednocześnie przesyłać dźwięk do radia i odczytywać dane przez osobny adapter OBD2, jeśli sprzęt obsługuje te połączenia. Radio z samą funkcją rozmów telefonicznych może nie odtwarzać komunikatów aplikacji.</Text>
      {Platform.OS === 'ios' && <Note>Na iPhonie otwórz Ustawienia → Bluetooth i wybierz radio. Wyjście dźwięku wybierzesz w Centrum sterowania. Przycisk poniżej otwiera ustawienia aplikacji; iOS nie udostępnia tu bezpośredniego przejścia do parowania. Wyłącz tryb cichy przed próbą.</Note>}
      <View style={{ gap: 12, marginTop: 16 }}>
        <Button label={Platform.OS === 'ios' ? 'Ustawienia aplikacji' : 'Ustawienia Bluetooth'} secondary disabled={playing || Platform.OS === 'web'} onPress={() => void settings()} />
        <Button label={playing ? 'Trwa próba dźwięku…' : 'Sprawdź dźwięk w radiu'} disabled={playing || Platform.OS === 'web'} onPress={() => void testAudio()} />
        {playing && <Button label="Zatrzymaj dźwięk" secondary onPress={() => void player.stop().catch(() => {})} />}
      </View>
      <Text style={[s.fine, { marginTop: 14 }]}>Próba odtwarza wyłącznie stały komunikat testowy przez systemową syntezę mowy i aktualne wyjście telefonu. Nie odczytuje VIN ani danych diagnostycznych. Głos może wymagać instalacji w ustawieniach systemu. Głośnik wybiera system; aplikacja nie wymusza połączenia ani nie potwierdza trasy dźwięku.</Text>
    </Section>
    <Section title="Dane samochodu przez OBD2">
      <Text style={[s.muted, { marginVertical: 16 }]}>Podłącz adapter do złącza diagnostycznego, włącz zapłon i wybierz go na ekranie diagnostyki. BLE i Wi-Fi działają na Androidzie i iOS. Bluetooth Classic SPP jest dostępny na Androidzie; najpierw sparuj adapter w systemie, używając kodu z jego instrukcji.</Text>
      <Button label="Przejdź do diagnostyki" secondary onPress={() => router.navigate('/diagnostics')} />
      <Text style={[s.fine, { marginTop: 14 }]}>Zwykłe radio Bluetooth nie przekazuje danych ECU. Wymagany jest zgodny adapter diagnostyczny. Obsługa zależy od protokołu adaptera i samochodu. Konfigurację i diagnostykę wykonuj przy zaparkowanym pojeździe.</Text>
    </Section>
    {Platform.OS === 'web' && <Note>Połączenia sprzętowe i próba radia wymagają zainstalowanej aplikacji na telefonie.</Note>}
    {error !== '' && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {message !== '' && <Note>{message}</Note>}
  </Page>;
}
