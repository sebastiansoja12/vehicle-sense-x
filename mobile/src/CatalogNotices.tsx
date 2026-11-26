import {Text,View} from 'react-native';
import {Link,router} from 'expo-router';
import {catalogProvenance} from './vehicle-catalog-data';
import {Page,Title,Section,Button} from './ui';
import {styles as s} from './theme';

const credits:Record<string,string>={
 'uk-dft-vehicle-licensing':'Contains public sector information licensed under the Open Government Licence v3.0. Source: Department for Transport and Driver and Vehicle Licensing Agency.',
 'eea-co2-monitoring':'Source: European Environment Agency (EEA), Monitoring of CO2 emissions from passenger cars and vans, Regulation (EU) 2019/631. Licensed under Creative Commons Attribution 4.0 International.',
 'rdw-nl-vehicle-register':'Source: Open Data RDW (Dienst Wegverkeer). Public domain / CC0.',
 'nhtsa-vpic':'Source: National Highway Traffic Safety Administration (NHTSA), Vehicle Product Information Catalog. U.S. government public data.',
};
export function CatalogNotices(){return <View style={{gap:14,marginVertical:12}}>
 <Text style={s.muted}>Katalog offline · wersja danych w aplikacji {catalogProvenance.snapshotDate}. Nazwy pochodzą z publicznych katalogów i rejestrów. Zawartość może być niepełna, a część nazw obejmuje wersje. Wybór modelu nie potwierdza rocznika, silnika ani wyposażenia Twojego samochodu.</Text>
 <Text style={s.fine}>Zmiany VehicleSenseX: wybrano samochody osobowe i MPV z czterech źródeł, pominięto lata i dane pojedynczych pojazdów, połączono powtórzenia pisowni. Nie dodano zdjęć ani logo producentów.</Text>
 <Link href="https://github.com/MeterApp/vehicle-db" style={s.linkText}>Katalog zbiorczy: MeterApp/vehicle-db ›</Link>
 {catalogProvenance.sources.map(source=><View key={source.source_id} style={{gap:8}}>
  <Text style={s.body}>{source.source_name}</Text><Text style={s.fine}>{credits[source.source_id]} Dane pobrane przez katalog źródłowy: {source.retrieved_at}.</Text>
  <Link href={source.source_url} style={s.linkText}>Źródło danych ›</Link>
  {'license_url' in source&&<Link href={source.license_url} style={s.linkText}>{source.license} ›</Link>}
 </View>)}
 </View>;}
export function CatalogSourcesScreen(){return <Page><Button label="Ustawienia" secondary onPress={()=>router.navigate('/settings')}/><View style={{height:20}}/><Title title="Katalog samochodów" subtitle="Źródła i warunki wykorzystania danych"/><Section title="Marki i modele"><CatalogNotices/></Section></Page>;}
