import makes from './vehicle-catalog-data.ts';
import type {Vehicle} from './domain.ts';

export const accessoryCategories={
 all:'Wszystkie',protection:'Ochrona',transport:'Transport',comfort:'Komfort',care:'Pielęgnacja',
} as const;
export type AccessoryCategory=keyof typeof accessoryCategories;
export type Accessory={
 id:string;searchTerm:string;category:Exclude<AccessoryCategory,'all'>;title:string;reason:string;check:string;
 source?:{label:string;url:string};
};

const accessories={
 mats:{id:'mats',searchTerm:'dywaniki',category:'protection',title:'Dywaniki dopasowane do podłogi',
  reason:'Dobry początek na co dzień: pomagają utrzymać wnętrze w czystości po deszczu, śniegu i podróżach.',
  check:'Sprawdź generację auta, kształt podłogi i fabryczne mocowania. Dywanik kierowcy nie może przeszkadzać w pracy pedałów.'},
 trunk:{id:'trunk',searchTerm:'mata bagażnika',category:'protection',title:'Mata lub wykładzina bagażnika',
  reason:'Przydatna przy zakupach, wózku i sprzęcie sportowym. Oddziela zabrudzony bagaż od tapicerki.',
  check:'Porównaj nadwozie, poziom podłogi bagażnika i wersję napędu. Hybryda, kombi i hatchback mogą potrzebować innych mat.'},
 roof:{id:'roof',searchTerm:'bagażnik dachowy',category:'transport',title:'Bagażnik dachowy i boks',
  reason:'Na dłuższe wyjazdy, gdy walizki lub sprzęt zajmują zbyt dużo miejsca w kabinie.',
  check:'Sprawdź typ dachu i relingów, zestaw mocowań oraz dopuszczalne obciążenie dachu. Uwzględnij masę belek, boksa i ładunku.'},
 bike:{id:'bike',searchTerm:'uchwyt rowerowy',category:'transport',title:'Uchwyt do przewozu rowerów',
  reason:'Pozwala zabrać rowery na weekend i zachować miejsce w środku samochodu.',
  check:'Dobierz montaż do auta: hak albo dach. Sprawdź limity masy auta i uchwytu, masę rowerów oraz wymagania oświetlenia i tablicy.'},
 organizer:{id:'organizer',searchTerm:'organizer bagażnika',category:'comfort',title:'Organizer przestrzeni bagażowej',
  reason:'Pomaga uporządkować drobiazgi i oddzielić codzienne wyposażenie od reszty bagażu.',
  check:'Zmierz dostępną przestrzeń i sprawdź sposób mocowania. Organizer nie zastępuje zabezpieczenia ciężkiego ładunku.'},
 care:{id:'care',searchTerm:'kosmetyki samochodowe',category:'care',title:'Zestaw do pielęgnacji wnętrza',
  reason:'Ułatwia regularne czyszczenie i dobranie środka do powierzchni zamiast jednego preparatu do wszystkiego.',
  check:'Dobierz preparat do materiału: skóry, tkaniny, tworzywa lub ekranu. Stosuj instrukcję i najpierw wykonaj próbę w mało widocznym miejscu.'},
 'travel-comfort':{id:'travel-comfort',searchTerm:'Travel Comfort',category:'comfort',title:'BMW Travel & Comfort',
  reason:'Modułowy system z uchwytem na tablet, wieszakiem lub stolikiem może ułatwić podróż pasażerom z tyłu.',
  check:'Potwierdź zgodność uchwytu bazowego z fotelem i zagłówkiem konkretnego BMW oraz wymagane elementy montażowe.'},
 youclip:{id:'youclip',searchTerm:'YouClip',category:'comfort',title:'Dacia YouClip',
  reason:'System mocowania drobiazgów: wybierz uchwyt na telefon, torbę albo akcesorium 3 w 1 według swoich potrzeb.',
  check:'Sprawdź dostępne punkty YouClip lub zgodny adapter zagłówka dla swojego modelu. Nie każda wersja ma fabryczne punkty mocowania.',
  source:{label:'Dacia · system YouClip',url:'https://www.dacia.pl/akcesoria-youclip.html'}},
} satisfies Record<string,Accessory>;

type AccessoryId=keyof typeof accessories;
export type AccessoryBrand={name:string;aliases:readonly string[];catalog:{url:string;checkedOn:string}|null;ids:readonly AccessoryId[]};
// shortcut: editorial snapshot, refresh sources and selections when updating the catalogue; no live stock or fitment feed.
const manufacturerBrands:readonly AccessoryBrand[]=[
 {name:'Toyota',aliases:['toyota'],catalog:{url:'https://www.toyota.pl/serwis-i-akcesoria/oryginalne-akcesoria',checkedOn:'2026-11-26'},ids:['mats','trunk','roof','bike']},
 {name:'Volkswagen',aliases:['volkswagen','vw'],catalog:{url:'https://www.volkswagen.pl/pl/serwis-akcesoria-i-aktualizacje/oryginalne-akcesoria-volkswagen.html',checkedOn:'2026-11-26'},ids:['trunk','mats','roof','bike','care']},
 {name:'Škoda',aliases:['skoda'],catalog:{url:'https://eshop.skoda-auto.com/pl_PL/',checkedOn:'2026-11-26'},ids:['trunk','mats','organizer','roof']},
 {name:'BMW',aliases:['bmw'],catalog:{url:'https://www.bmw.pl/pl/more-bmw/parts-and-accessories/bmw-akcesoria.html',checkedOn:'2026-11-26'},ids:['mats','trunk','travel-comfort','roof','bike','care']},
 {name:'Audi',aliases:['audi'],catalog:{url:'https://www.audi.pl/pl/strefa-klienta/akcesoria/',checkedOn:'2026-11-26'},ids:['mats','trunk','roof','bike']},
 {name:'Ford',aliases:['ford'],catalog:{url:'https://www.ford.pl/serwis/twoj-pojazd/akcesoria',checkedOn:'2026-11-26'},ids:['mats','trunk','roof','bike']},
 {name:'Renault',aliases:['renault'],catalog:{url:'https://www.renault.pl/akcesoria-butik-lifestyle/akcesoria-renault.html',checkedOn:'2026-11-26'},ids:['mats','trunk','organizer','roof']},
 {name:'Dacia',aliases:['dacia'],catalog:{url:'https://www.dacia.pl/akcesoria.html',checkedOn:'2026-11-26'},ids:['mats','trunk','youclip','roof','bike']},
 {name:'Hyundai',aliases:['hyundai'],catalog:{url:'https://www.hyundai.com/pl/pl/serwis/czesci-akcesoria-wyposazenie/akcesoria.html',checkedOn:'2026-11-26'},ids:['mats','trunk','roof','bike']},
 {name:'Kia',aliases:['kia'],catalog:{url:'https://www.kia.com/pl/serwis/czesci-i-akcesoria/akcesoria/',checkedOn:'2026-11-26'},ids:['mats','trunk','roof','bike']},
 {name:'Mercedes-Benz',aliases:['mercedes-benz','mercedes benz','mercedes'],catalog:{url:'https://store.mercedes-benz.pl/',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'Honda',aliases:['honda'],catalog:{url:'https://akcesoria.honda.pl/',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'Volvo',aliases:['volvo'],catalog:{url:'https://www.volvocars.com/pl/collections/car-accessories/',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'Nissan',aliases:['nissan'],catalog:{url:'https://www.nissan.pl/dla-wlasciciela/akcesoria-nissan.html',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'Lexus',aliases:['lexus'],catalog:{url:'https://www.lexus-polska.pl/owners/accessories',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'SEAT',aliases:['seat'],catalog:{url:'https://www.seat.pl/seat-samochody/akcesoria-samochodowe',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'Tesla',aliases:['tesla'],catalog:{url:'https://shop.tesla.com/pl_pl',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'Peugeot',aliases:['peugeot'],catalog:{url:'https://www.peugeot.pl/nasze-uslugi/akcesoria.html',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
 {name:'Opel',aliases:['opel'],catalog:{url:'https://www.opel.pl/nasze-uslugi/akcesoria.html',checkedOn:'2026-11-27'},ids:['mats','trunk','roof']},
];
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').toLowerCase().trim().replace(/\s+/g,' ');
const commonIds:readonly AccessoryId[]=['mats','trunk','organizer','roof','bike','care'];

export const accessoryBrands:readonly AccessoryBrand[]=makes.map(make=>
 manufacturerBrands.find(brand=>brand.aliases.includes(normalize(make.name)))??{name:make.name,aliases:[normalize(make.name)],catalog:null,ids:commonIds});
const byMake=new Map(accessoryBrands.flatMap(brand=>brand.aliases.map(alias=>[alias,brand] as const)));

export function recommendAccessories(make:string,category:AccessoryCategory='all',query=''):{brand:AccessoryBrand|null;items:Accessory[]}{
 const key=normalize(make);
 const brand=byMake.get(key)??(key?{name:make.trim().replace(/\s+/g,' '),aliases:[key],catalog:null,ids:commonIds}:null);
 const words=normalize(query).split(' ');
 const ids=[...new Set([...(brand?.ids??[]),...commonIds])];
 const items=ids.map(id=>accessories[id]).filter(item=>
  (category==='all'||item.category===category)&&words.every(word=>normalize(`${item.title} ${item.reason} ${accessoryCategories[item.category]}`).includes(word)));
 return {brand,items};
}

export function accessorySearchUrl(vehicle:Pick<Vehicle,'make'|'model'|'year'>,item?:Accessory):string{
 const query=[item?.searchTerm??'akcesoria',vehicle.make,vehicle.model,String(vehicle.year)].join(' ').trim().replace(/\s+/g,' ');
 const url=new URL('https://allegro.pl/listing');
 url.searchParams.set('string',query);
 return url.href;
}
