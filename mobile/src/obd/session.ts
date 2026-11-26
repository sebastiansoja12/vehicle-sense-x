import { Elm327Driver } from './driver.ts';
import { EcuSelectionRequired } from './can.ts';
import type { CanEcu } from './can.ts';
import type { BleTransport, DiagnosticSnapshot } from './types.ts';

export async function startDiagnostics(link: BleTransport, vehicleId: string): Promise<{ driver: Elm327Driver; reading: DiagnosticSnapshot | null; ecus: CanEcu[] }> {
  const driver = new Elm327Driver(link, link.adapterName);
  try {
    await driver.initialize();
    try {
      return { driver, reading: await driver.readSnapshot(vehicleId), ecus: [] };
    } catch (error) {
      if (error instanceof EcuSelectionRequired) return { driver, reading: null, ecus: error.ecus };
      throw error;
    }
  } catch (error) {
    await link.disconnect().catch(() => {});
    throw error;
  }
}
