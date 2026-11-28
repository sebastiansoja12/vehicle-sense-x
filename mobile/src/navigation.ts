export const navigationItems=[
 {label:'Start',href:'/',icon:'grid-outline',group:'main',routes:['/']},
 {label:'Diagnostyka',href:'/diagnostics',icon:'pulse-outline',group:'main',routes:['/diagnostics','/cockpit','/connections','/diagnostic-comparison']},
 {label:'Trasy',href:'/trips',icon:'navigate-outline',group:'main',routes:['/trips','/analytics']},
 {label:'Paliwo i koszty',href:'/expenses',icon:'wallet-outline',group:'main',routes:['/expenses']},
 {label:'Garaż',href:'/garage',icon:'car-sport-outline',group:'main',routes:['/garage','/health','/vehicle-evidence','/vehicle-outlook','/catalog-sources']},
 {label:'Spalanie i obsługa',href:'/insights',icon:'stats-chart-outline',group:'tools',routes:['/insights','/maintenance']},
 {label:'Akcesoria',href:'/accessories',icon:'bag-handle-outline',group:'tools',routes:['/accessories']},
 {label:'Warsztaty',href:'/workshops',icon:'build-outline',group:'tools',routes:['/workshops']},
 {label:'Części',href:'/parts',icon:'layers-outline',group:'tools',routes:['/parts']},
 {label:'Asystent',href:'/assistant',icon:'chatbubble-ellipses-outline',group:'tools',routes:['/assistant']},
 {label:'Ustawienia',href:'/settings',icon:'settings-outline',group:'settings',routes:['/settings','/privacy']},
] as const;
export const isWideWeb=(width:number,platform:string)=>platform==='web'&&width>=1100;
export function activeNavigation(path:string){return navigationItems.find(item=>item.routes.some(route=>path===route||route!=='/'&&path.startsWith(route+'/')))?.href??null;}
