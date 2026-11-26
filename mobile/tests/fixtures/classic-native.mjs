export const Platform={OS:'android',Version:34};
export const state={permission:'granted',enabled:true,requests:[],bondedReads:0,opens:[],writes:[],closed:0,receive:null,dropped:null};
export function reset(){Object.assign(state,{permission:'granted',enabled:true,requests:[],bondedReads:0,opens:[],writes:[],closed:0,receive:null,dropped:null});Platform.Version=34;}
export const PermissionsAndroid={PERMISSIONS:{BLUETOOTH_CONNECT:'android.permission.BLUETOOTH_CONNECT'},RESULTS:{GRANTED:'granted'},async request(permission){state.requests.push(permission);return state.permission;}};
const address='AA:BB:CC:DD:EE:FF';
const device={address,name:'ELM adapter',async write(data){state.writes.push(data);return true;},async disconnect(){state.closed++;return true;},onDataReceived(listener){state.receive=listener;return {remove(){state.receive=null;}};}};
export default {
 async isBluetoothEnabled(){return state.enabled;},
 async getBondedDevices(){state.bondedReads++;return [device];},
 async connectToDevice(address,options){state.opens.push({address,options});return device;},
 async disconnectFromDevice(){state.closed++;return true;},
 onDeviceDisconnected(listener){state.dropped=listener;return {remove(){state.dropped=null;}};},
};
