export function createRadioTest() {
  return {
    async play(): Promise<void> { throw new Error('Próba radia wymaga aplikacji na Androidzie lub iOS.'); },
    async stop(): Promise<void> {},
  };
}
export async function openBluetoothSettings(): Promise<void> { throw new Error('Parowanie radia wykonaj w ustawieniach Bluetooth telefonu.'); }
