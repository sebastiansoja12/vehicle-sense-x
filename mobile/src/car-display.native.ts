import {Platform} from 'react-native';
import {requireOptionalNativeModule} from 'expo';
import type {CarDisplayPayload} from './cockpit.ts';
export async function syncCarDisplay(payload:CarDisplayPayload|null):Promise<boolean>{
 if(Platform.OS!=='ios')return false;
 const module=requireOptionalNativeModule<{syncCarDisplay?:(json:string|null)=>Promise<boolean>}>('VehicleRadio');
 if(!module?.syncCarDisplay)return false;
 return await module.syncCarDisplay(payload===null?null:JSON.stringify(payload))===true;
}
