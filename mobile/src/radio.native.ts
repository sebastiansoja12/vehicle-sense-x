import { Linking, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import {requireOptionalNativeModule} from 'expo';
import { createRadioAudioTest } from './radio-audio.ts';
import {parseAudioOutputs} from './radio-summary.ts';

export function createRadioTest() { return createRadioAudioTest(Speech,60000); }
export async function getAudioOutputs(){
  const module=requireOptionalNativeModule<{getOutputs():Promise<unknown>}>('VehicleRadio');
  if(!module)throw new Error('Odczyt wyjść audio wymaga nowej kompilacji aplikacji z modułem radia. Parowanie i odtwarzanie mowy pozostają dostępne.');
  return parseAudioOutputs(await module.getOutputs());
}
export async function openBluetoothSettings(): Promise<void> {
  if (Platform.OS === 'android') await Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
  else await Linking.openSettings();
}
