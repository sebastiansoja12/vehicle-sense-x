import TcpSocket from 'react-native-tcp-socket';
import {connectWifi} from './wifi-core';
import type {WifiProfile,TcpSocket as SocketBoundary} from './wifi-core';
export {validateWifiProfile} from './wifi-core';
export async function createWifiTransport(profile:WifiProfile){return connectWifi(profile,options=>{const socket=TcpSocket.createConnection(options,()=>{});return {on:(event,listener)=>socket.on(event,listener),write:(data,callback)=>socket.write(data,'utf8',callback),destroy:()=>socket.destroy(),setNoDelay:enabled=>socket.setNoDelay(enabled)} satisfies SocketBoundary;});}
