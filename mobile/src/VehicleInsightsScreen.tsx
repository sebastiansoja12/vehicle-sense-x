import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from './AppProvider';
import type { Vehicle } from './domain';
import { localDay } from './domain';
import { FuelCharts } from './FuelCharts';
import { MaintenancePlanner } from './MaintenancePlanner';
import { OilLog } from './OilLog';
import { Button, Empty, Page, Title } from './ui';
import { styles as s } from './theme';
function Insights({ vehicle }: { vehicle: Vehicle }) {
  const app = useApp(), today = localDay();
  return <Page><Button label="Wróć do garażu" secondary onPress={() => router.navigate('/garage')} /><View style={{ height: 18 }} /><Title title="Spalanie i obsługa" subtitle={`${vehicle.make} ${vehicle.model} · ${today}`} />
    <Text style={s.muted}>Własne tankowania, harmonogram części i dane oleju. Obliczenia działają lokalnie na zapisach wybranego auta.</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}><Button label="Dodaj tankowanie" disabled={app.busy} onPress={() => app.openForm('fuel')} /><Button label="Historia serwisu i powiadomienia" secondary onPress={() => router.push('/maintenance')} /></View>
    <FuelCharts data={app.data} vehicleId={vehicle.id} today={today} /><MaintenancePlanner vehicle={vehicle} today={today} /><OilLog vehicle={vehicle} today={today} />
  </Page>;
}
export function VehicleInsightsScreen() {
  const app = useApp(), vehicle = app.data.vehicles.find(v => v.id === app.data.activeVehicleId);
  return vehicle ? <Insights key={vehicle.id} vehicle={vehicle} /> : <Page><Title title="Spalanie i obsługa" /><Empty title="Najpierw wybierz samochód" description="Wykresy i harmonogram dotyczą danych konkretnego auta." action={<Button label="Otwórz garaż" onPress={() => router.navigate('/garage')} />} /></Page>;
}
