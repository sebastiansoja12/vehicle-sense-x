import makes from './vehicle-catalog-data.ts';
import {ValidationError} from './validation.ts';
const normalized=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').toLowerCase().trim().replace(/\s+/g,' ');
const makeKey=(text:string)=>normalized(text)==='vw'?'volkswagen':normalized(text);
const byMake=new Map(makes.map(make=>[makeKey(make.name),make]));
function search(names:string[],query:string,limit:number){
 const q=normalized(query),words=q.split(' ');
 const matches=names.map(name=>({name,key:normalized(name)})).filter(item=>words.every(word=>item.key.includes(word)));
 const rank=(key:string)=>key===q?0:key.startsWith(q)?1:2;
 matches.sort((a,b)=>rank(a.key)-rank(b.key)||(a.key<b.key?-1:a.key>b.key?1:0));
 return {items:matches.slice(0,Math.max(1,Math.min(40,Math.trunc(limit)||12))).map(item=>item.name),total:matches.length};
}
export function searchMakes(query:string,limit=12){return search(makes.map(make=>make.name),makeKey(query),limit);}
export function searchModels(make:string,query:string,limit=12){return search(byMake.get(makeKey(make))?.models??[],query,limit);}
export function chooseCatalogMake<T extends {make:string;model:string}>(value:T,make:string):T{
 const found=byMake.get(makeKey(make));if(!found)throw new ValidationError('Wybierz markę z katalogu albo wpisz samochód ręcznie.');
 return {...value,make:found.name,model:makeKey(value.make)===makeKey(found.name)?value.model:''};
}
export function chooseCatalogModel<T extends {make:string;model:string}>(value:T,model:string):T{
 const found=byMake.get(makeKey(value.make))?.models.find(name=>normalized(name)===normalized(model));
 if(!found)throw new ValidationError('Wybierz model tej marki albo wpisz samochód ręcznie.');
 return {...value,model:found};
}
export function initialCatalogMode(make:string,model:string):'catalog'|'manual'{
 if(!make&&!model)return 'catalog';
 const found=byMake.get(makeKey(make));
 return found&&(!model||found.models.some(name=>normalized(name)===normalized(model)))?'catalog':'manual';
}
