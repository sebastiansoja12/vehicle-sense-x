import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { ServiceConfig } from './automotive-client';
import { validateServiceConfig } from './automotive-client';
import { Button, Note, Section } from './ui';
import { styles as s } from './theme';

const Context = createContext<{ config: ServiceConfig; session: number; configure: (value: ServiceConfig) => void } | null>(null);
export function AutomotiveProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState({ config: { endpoint: process.env.EXPO_PUBLIC_SERVICES_URL || '', token: '' }, session: 0 });
  const configure = useCallback((config: ServiceConfig) => setState(current => ({ config, session: current.session + 1 })), []);
  return <Context.Provider value={{ ...state, configure }}>{children}</Context.Provider>;
}
export function useAutomotive() {
  const value = useContext(Context); if (!value) throw new Error('Brak kontekstu usług.');
  let ready = true; try { validateServiceConfig(value.config); } catch { ready = false; }
  return { ...value, ready };
}
export function ServiceConnection() {
  const { session } = useAutomotive();
  return <ConnectionForm key={session} />;
}
function ConnectionForm() {
  const { config, configure } = useAutomotive();
  const [endpoint, setEndpoint] = useState(config.endpoint), [token, setToken] = useState(config.token), [error, setError] = useState('');
  function save() {
    try { validateServiceConfig({ endpoint: endpoint.trim(), token: token.trim() }); configure({ endpoint: endpoint.trim(), token: token.trim() }); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Sprawdź ustawienia.'); }
  }
  return <Section title="Warsztaty i ceny części · połączenie">
    <Text style={[s.muted, { marginVertical: 14 }]}>Usługi korzystają z prywatnego serwera VehicleSenseX. Wpisz jego adres i token dostępu otrzymany od administratora. Warsztaty nie wymagają klucza AI; ceny części wymagają aktywnego dostępu eBay na serwerze.</Text>
    <View style={s.field}><Text style={s.label}>Adres serwera HTTPS</Text><TextInput accessibilityLabel="Adres serwera usług samochodowych" style={s.input} value={endpoint} onChangeText={setEndpoint} autoCapitalize="none" autoCorrect={false} keyboardType="url" maxLength={2048} placeholder="https://services.example.com" /></View>
    <View style={s.field}><Text style={s.label}>Token aplikacji</Text><TextInput accessibilityLabel="Token usług samochodowych" style={s.input} value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} secureTextEntry maxLength={512} /></View>
    <View style={{ gap: 12 }}><Button label="Użyj połączenia" onPress={save} /><Button label="Usuń token z sesji" secondary onPress={() => { setToken(''); configure({ endpoint: config.endpoint, token: '' }); }} /></View>
    <Text style={[s.fine, { marginTop: 12 }]}>Ustawienia i token pozostają w pamięci tej sesji, poza kopią garażu. Zapis ustawień nie sprawdza dostępu u dostawcy. Klucze eBay pozostają wyłącznie na serwerze.</Text>
    {error !== '' && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  </Section>;
}
export function ServiceConsent({ value, onChange, children }: PropsWithChildren<{ value: boolean; onChange: (value: boolean) => void }>) {
  return <View style={[s.row, { marginVertical: 18 }]}><Switch accessibilityLabel="Zgoda na wysłanie zapytania do usług samochodowych" value={value} onValueChange={onChange} /><Text style={[s.muted, { flex: 1 }]}>{children}</Text></View>;
}
export function ServiceSetupNote() {
  return <Note>Skonfiguruj połączenie z usługami poniżej. Lista warsztatów i ceny pojawią się tutaj po wyszukaniu — bez otwierania wyszukiwarki.</Note>;
}
/** A blurred screen or cancelled task cannot publish a late GPS/network result. */
export function useServiceTask() {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const current = useRef<AbortController | null>(null), focused = useRef(false);
  const cancel = useCallback(() => { current.current?.abort(); current.current = null; setBusy(false); }, []);
  useFocusEffect(useCallback(() => { focused.current = true; setBusy(false); return () => { focused.current = false; current.current?.abort(); current.current = null; }; }, []));
  async function run<T,>(action: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
    current.current?.abort(); const controller = new AbortController(); current.current = controller;
    setBusy(true); setError('');
    try { const result = await action(controller.signal); return focused.current && current.current === controller && !controller.signal.aborted ? result : null; }
    catch (e) { if (focused.current && current.current === controller && !controller.signal.aborted) setError(e instanceof Error ? e.message : 'Operacja nie powiodła się.'); return null; }
    finally { if (focused.current && current.current === controller) { current.current = null; setBusy(false); } }
  }
  return { busy, error, setError, run, cancel };
}
