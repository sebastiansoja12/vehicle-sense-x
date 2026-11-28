export function createRadioTest() {
  return {
    async play(_text?:string): Promise<void> { throw new Error('Próba radia wymaga aplikacji na Androidzie lub iOS.'); },
    async stop(): Promise<void> {},
  };
}
export async function openBluetoothSettings(): Promise<void> { throw new Error('Parowanie radia wykonaj w ustawieniach Bluetooth telefonu.'); }
export async function getAudioOutputs():Promise<import('./radio-summary').AudioOutputs>{throw new Error('Odczyt wyjść audio wymaga aplikacji na Androidzie lub iOS.');}
