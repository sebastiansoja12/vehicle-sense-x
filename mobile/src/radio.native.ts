import { Linking, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { createRadioAudioTest } from './radio-audio.ts';

export function createRadioTest() { return createRadioAudioTest(Speech); }
export async function openBluetoothSettings(): Promise<void> {
  if (Platform.OS === 'android') await Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
  else await Linking.openSettings();
}
