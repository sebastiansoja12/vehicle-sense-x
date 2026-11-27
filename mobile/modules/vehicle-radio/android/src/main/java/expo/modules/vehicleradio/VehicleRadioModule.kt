package expo.modules.vehicleradio

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class VehicleRadioModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VehicleRadio")
    AsyncFunction("getOutputs") {
      val context = requireNotNull(appContext.reactContext) { "Brak kontekstu audio aplikacji." }
      val manager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      val outputs = manager.getDevices(AudioManager.GET_DEVICES_OUTPUTS).take(32).map { device ->
        val kind = when (device.type) {
          AudioDeviceInfo.TYPE_BLUETOOTH_A2DP, AudioDeviceInfo.TYPE_BLUETOOTH_SCO,
          AudioDeviceInfo.TYPE_BLE_HEADSET, AudioDeviceInfo.TYPE_BLE_SPEAKER -> "bluetooth"
          AudioDeviceInfo.TYPE_USB_DEVICE, AudioDeviceInfo.TYPE_USB_ACCESSORY,
          AudioDeviceInfo.TYPE_USB_HEADSET -> "usb"
          AudioDeviceInfo.TYPE_WIRED_HEADSET, AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
          AudioDeviceInfo.TYPE_LINE_ANALOG -> "wired"
          AudioDeviceInfo.TYPE_BUILTIN_SPEAKER, AudioDeviceInfo.TYPE_BUILTIN_EARPIECE -> "speaker"
          else -> "other"
        }
        mapOf("name" to device.productName.toString().take(120).ifBlank { "Wyjście audio" }, "type" to kind)
      }
      // Connected outputs are available routes, not proof of the current TTS destination.
      mapOf("scope" to "available", "outputs" to outputs)
    }
  }
}
