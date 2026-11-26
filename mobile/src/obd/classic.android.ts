import {PermissionsAndroid,Platform} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import type {BluetoothDevice} from 'react-native-bluetooth-classic';
import {createClassicSession} from './classic-session';
import {ObdError} from './protocol';
import type {BleTransport,ScannedDevice} from './types';
async function ready(){if(Number(Platform.Version)>=31){const granted=await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);if(granted!==PermissionsAndroid.RESULTS.GRANTED)throw new ObdError('Brak zgody na Bluetooth.');}if(!await RNBluetoothClassic.isBluetoothEnabled())throw new ObdError('Włącz Bluetooth w ustawieniach telefonu.');}
export async function listClassicDevices():Promise<ScannedDevice[]>{await ready();const devices=await RNBluetoothClassic.getBondedDevices();return devices.map(device=>({id:device.address,name:device.name,rssi:null}));}
export async function createClassicTransport(address:string):Promise<BleTransport>{
 if(!/^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(address))throw new ObdError('Wybierz sparowany adapter Bluetooth Classic.');await ready();
 let expired=false;let timer:ReturnType<typeof setTimeout>|undefined;
 const opening=RNBluetoothClassic.connectToDevice(address,{connectorType:'rfcomm',connectionType:'delimited',delimiter:'',charset:'ascii',readSize:1024});
 const device=await new Promise<BluetoothDevice>((resolve,reject)=>{timer=setTimeout(()=>{expired=true;void RNBluetoothClassic.disconnectFromDevice(address).catch(()=>{});reject(new ObdError('Przekroczono czas połączenia Bluetooth Classic. Sprawdź parowanie i zasięg.','timeout'));},15000);opening.then(value=>{clearTimeout(timer);if(expired){void value.disconnect().catch(()=>{});return;}resolve(value);},error=>{clearTimeout(timer);reject(error);});});
 try{return createClassicSession(device,listener=>RNBluetoothClassic.onDeviceDisconnected(event=>{if(event.device.address===address)listener();}));}catch(e){await device.disconnect().catch(()=>{});throw e;}
}
