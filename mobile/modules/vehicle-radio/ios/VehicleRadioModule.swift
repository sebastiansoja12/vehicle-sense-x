import AVFAudio
import ExpoModulesCore

public class VehicleRadioModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VehicleRadio")
    AsyncFunction("syncCarDisplay") { (json: String?) throws -> Bool in
      try VehicleCarPlayStore.shared.sync(json)
    }.runOnQueue(.main)
    AsyncFunction("getCarDisplayStatus") { () -> [String: Bool] in
      ["configured": VehicleCarPlayStore.shared.enabled, "connected": VehicleCarPlayStore.shared.connectedScenes > 0]
    }.runOnQueue(.main)
    AsyncFunction("getOutputs") { () -> [String: Any] in
      let outputs = AVAudioSession.sharedInstance().currentRoute.outputs.prefix(32).map { port in
        let kind: String
        switch port.portType {
        case .bluetoothA2DP, .bluetoothHFP, .bluetoothLE: kind = "bluetooth"
        case .carAudio: kind = "car"
        case .usbAudio: kind = "usb"
        case .headphones, .lineOut: kind = "wired"
        case .builtInSpeaker, .builtInReceiver: kind = "speaker"
        case .airPlay: kind = "airplay"
        default: kind = "other"
        }
        let name = String(port.portName.prefix(120))
        return ["name": name.isEmpty ? "Wyjście audio" : name, "type": kind]
      }
      return ["scope": "current", "outputs": outputs]
    }
  }
}
