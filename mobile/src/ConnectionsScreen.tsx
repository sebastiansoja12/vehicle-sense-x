import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Linking from 'expo-linking';
import { createRadioTest, getAudioOutputs, openBluetoothSettings } from './radio';
import {buildRadioSummary} from './radio-summary';
import type {AudioOutputs} from './radio-summary';
import {useApp} from './AppProvider';
import {localDay} from './domain';
import { Button, Note, Page, Section, Title } from './ui';
import { styles as s } from './theme';

export function ConnectionsScreen() {
  const app=useApp();
  const vehicle=app.data.vehicles.find(car=>car.id===app.data.activeVehicleId);
  const player = useMemo(() => createRadioTest(), []);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [outputs,setOutputs]=useState<AudioOutputs|null>(null);
  const [outputError,setOutputError]=useState('');
  const [refreshing,setRefreshing]=useState(false);
  const focused = useRef(false);
  const outputRequest=useRef(0);
  const refreshOutputs=useCallback(async()=>{
    const request=++outputRequest.current;
    setRefreshing(true);setOutputs(null);setOutputError('');
    try{const next=await getAudioOutputs();if(focused.current&&request===outputRequest.current)setOutputs(next);}
    catch(e){if(focused.current&&request===outputRequest.current)setOutputError(e instanceof Error?e.message:'Nie można odczytać wyjść audio.');}
    finally{if(focused.current&&request===outputRequest.current)setRefreshing(false);}
  },[]);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    setPlaying(false);
    if(Platform.OS!=='web')void refreshOutputs();
    return () => { focused.current = false;outputRequest.current++;void player.stop().catch(() => {}); };
  }, [player,refreshOutputs]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {outputRequest.current++;void player.stop().catch(() => {});}
      else if(focused.current&&Platform.OS!=='web')void refreshOutputs();
    });
    return () => subscription.remove();
  }, [player,refreshOutputs]);
  async function settings() {
    setError('');
    try { await openBluetoothSettings(); }
    catch { if (focused.current) setError('Otwórz ręcznie ustawienia Bluetooth telefonu i sparuj radio lub adapter.'); }
  }
  async function testAudio(text?:string) {
    if (playing) return;
    setPlaying(true); setError(''); setMessage('');
    try {
      await player.play(text);
      if (focused.current) setMessage(text?'System zakończył czytanie podsumowania. Sprawdź, czy było słychać je w radiu.':'Próba zakończona. Sprawdź, czy komunikat było słychać w radiu. Zakończenie syntezy mowy nie potwierdza wybranego wyjścia Bluetooth.');
    } catch (e) { if (focused.current) setError(e instanceof Error ? e.message : 'Próba dźwięku nie powiodła się.'); }
    finally { if (focused.current) setPlaying(false); }
  }
  function readSummary(){
    try{if(!vehicle)throw new Error('Wybierz samochód w garażu.');void testAudio(buildRadioSummary(app.data,vehicle.id,localDay()));}
    catch(e){setError(e instanceof Error?e.message:'Nie można przygotować podsumowania.');}
  }
  async function openGuide(url:string){
    setError('');try{await Linking.openURL(url);}catch{if(focused.current)setError('Nie udało się otworzyć instrukcji. Sprawdź połączenie z internetem.');}
  }
  return <Page>
    <Button label="Wróć" secondary onPress={() => router.back()} />
    <Title title="Radio i połączenia" subtitle="Dźwięk bez adaptera · CarPlay / Android Auto · OBD2" />
    <Note>Dźwięk, zapis tras GPS i podsumowanie garażu działają bez adaptera OBD2. Radio musi obsługiwać wybraną metodę połączenia; sam Bluetooth nie dodaje mu CarPlay ani Android Auto.</Note>
    <Section title="Radio Bluetooth">
      <Text style={[s.body, { marginTop: 16 }]}>Sparuj telefon z radiem w ustawieniach Bluetooth. W radiu wybierz źródło Bluetooth Audio, a w telefonie włącz dźwięk multimediów dla tego urządzenia.</Text>
      <Text style={[s.muted, { marginVertical: 14 }]}>Telefon może jednocześnie przesyłać dźwięk do radia i odczytywać dane przez osobny adapter OBD2, jeśli sprzęt obsługuje te połączenia. Radio z samą funkcją rozmów telefonicznych może nie odtwarzać komunikatów aplikacji.</Text>
      {Platform.OS === 'ios' && <Note>Na iPhonie otwórz Ustawienia → Bluetooth i wybierz radio. Wyjście dźwięku wybierzesz w Centrum sterowania. Przycisk poniżej otwiera ustawienia aplikacji; iOS nie udostępnia tu bezpośredniego przejścia do parowania. Wyłącz tryb cichy przed próbą.</Note>}
      <View style={{ gap: 12, marginTop: 16 }}>
        <Button label={Platform.OS === 'ios' ? 'Ustawienia aplikacji' : 'Ustawienia Bluetooth'} secondary disabled={playing || Platform.OS === 'web'} onPress={() => void settings()} />
        <Button label={playing ? 'Trwa próba dźwięku…' : 'Sprawdź dźwięk w radiu'} disabled={playing || Platform.OS === 'web'} onPress={() => void testAudio()} />
        <Button label="Odczytaj podsumowanie auta" secondary disabled={playing||Platform.OS==='web'||!vehicle} onPress={readSummary}/>
        {playing && <Button label="Zatrzymaj dźwięk" secondary onPress={() => void player.stop().catch(() => {})} />}
      </View>
      <Text style={[s.fine, { marginTop: 14 }]}>Próba odtwarza wyłącznie stały komunikat testowy przez systemową syntezę mowy i aktualne wyjście telefonu. Nie odczytuje VIN ani danych diagnostycznych. Głos może wymagać instalacji w ustawieniach systemu. Głośnik wybiera system; aplikacja nie wymusza połączenia ani nie potwierdza trasy dźwięku.</Text>
      <Text style={[s.fine,{marginTop:10}]}>Podsumowanie czyta markę i model, zapisany przebieg, spalanie z tankowań oraz liczbę osiągniętych terminów serwisowych. Nie czyta VIN, tablic, tytułów przypomnień ani notatek. Słychać je na aktualnym wyjściu telefonu. Czytanie zatrzymuje się po opuszczeniu ekranu lub przejściu aplikacji w tło.</Text>
    </Section>
    <Section title="Wyjścia audio telefonu">
      {outputs&&<><Text style={[s.body,{marginTop:16}]}>{outputs.scope==='current'?'Bieżąca trasa sesji audio iOS':'Dostępne wyjścia audio Androida'}</Text>{outputs.outputs.length?outputs.outputs.map((output,index)=><View key={`${index}-${output.type}`} style={s.listRow}><Text style={s.body}>{output.name}</Text><Text style={s.fine}>{{bluetooth:'Bluetooth',car:'Car Audio',usb:'USB',wired:'Przewodowe',speaker:'Głośnik / słuchawka telefonu',airplay:'AirPlay',other:'Inne wyjście'}[output.type]}</Text></View>):<Text style={s.muted}>System nie zgłosił wyjść audio.</Text>}<Text style={[s.fine,{marginVertical:12}]}>{outputs.scope==='available'?'Lista nie potwierdza, do którego urządzenia trafia mowa. Wybierz wyjście multimediów w systemie i wykonaj próbę.':'Trasa audio nie potwierdza uruchomienia CarPlay ani zgodności radia. Może zmienić się po rozpoczęciu odtwarzania.'}</Text></>}
      {outputError!==''&&<Text accessibilityRole="alert" style={s.error}>{outputError}</Text>}
      <View style={{marginTop:16}}><Button label={refreshing?'Odczytywanie wyjść…':'Odśwież wyjścia audio'} secondary disabled={refreshing||Platform.OS==='web'} onPress={()=>void refreshOutputs()}/></View>
    </Section>
    <Section title="CarPlay i Android Auto bez OBD2">
      <Text style={[s.body,{marginTop:16}]}>Radio zgodne z CarPlay lub Android Auto połącz z telefonem przez port USB obsługujący dane albo fabryczny tryb bezprzewodowy. W połączeniu bezprzewodowym potrzebne jest również Wi-Fi. Nie jest to adapter diagnostyczny.</Text>
      {Platform.OS==='ios'?<Text style={[s.muted,{marginTop:12}]}>Na iPhonie włącz Siri. Dla USB wybierz port oznaczony CarPlay; dla połączenia bezprzewodowego włącz Bluetooth i Wi-Fi, uruchom parowanie w radiu i wybierz auto w Ustawienia → Ogólne → CarPlay.</Text>:<Text style={[s.muted,{marginTop:12}]}>Na zgodnym telefonie z Androidem podłącz przewód do portu danych radia i wykonaj konfigurację Android Auto. Dla trybu bezprzewodowego radio i telefon muszą go obsługiwać; podczas pierwszego parowania włącz Bluetooth oraz Wi-Fi.</Text>}
      <Note>Animowany kokpit działa w aplikacji. Osobny widok CarPlay korzysta z listy systemowej, zdjęcia auta i zapisanych odczytów; wymaga zatwierdzonej kompilacji z uprawnieniem Apple. Nie jest to projekcja Android Auto — ta platforma nie ma osobnej kategorii diagnostycznej.</Note>
      <View style={{gap:12,marginTop:16}}>
        <Button label="Otwórz kokpit diagnostyczny" secondary onPress={()=>router.navigate('/cockpit')}/>
        {Platform.OS!=='android'&&<Button label="Instrukcja Apple CarPlay ↗" secondary onPress={()=>void openGuide('https://support.apple.com/guide/iphone/connect-to-carplay-iph6860e6b53/ios')}/>}
        {Platform.OS!=='ios'&&<Button label="Instrukcja Android Auto ↗" secondary onPress={()=>void openGuide('https://support.google.com/androidauto/answer/6348019')}/>}
        <Button label="Trasy GPS bez adaptera" secondary onPress={()=>router.navigate('/trips')}/>
      </View>
    </Section>
    <Section title="Dane samochodu przez OBD2">
      <Text style={[s.muted, { marginVertical: 16 }]}>Podłącz adapter do złącza diagnostycznego, włącz zapłon i wybierz go na ekranie diagnostyki. BLE i Wi-Fi działają na Androidzie i iOS. Bluetooth Classic SPP jest dostępny na Androidzie; najpierw sparuj adapter w systemie, używając kodu z jego instrukcji.</Text>
      <Button label="Przejdź do diagnostyki" secondary onPress={() => router.navigate('/diagnostics')} />
      <Text style={[s.fine, { marginTop: 14 }]}>Zwykłe radio Bluetooth nie przekazuje aplikacji pełnej diagnostyki ECU. W tej aplikacji odczyt i kasowanie DTC wymagają zgodnego adaptera. Wybrane dane udostępniane przez producentów lub Android Car Hardware API zależą od konkretnego samochodu, uprawnień i integracji — nie zastępują uniwersalnie OBD2. Konfigurację wykonuj przy zaparkowanym pojeździe.</Text>
    </Section>
    {Platform.OS === 'web' && <Note>Połączenia sprzętowe i próba radia wymagają zainstalowanej aplikacji na telefonie.</Note>}
    {error !== '' && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {message !== '' && <Note>{message}</Note>}
  </Page>;
}
