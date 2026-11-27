import CarPlay
import Foundation
import ImageIO
import UIKit

struct VehicleDisplayRow: Codable {
  let title: String
  let detail: String
}
struct VehicleDisplayPayload: Codable {
  let vehicleId: String
  let vehicleLabel: String
  let subtitle: String
  let photoBase64: String?
  let recordedAt: Double?
  let rows: [VehicleDisplayRow]

  var isValid: Bool {
    !vehicleId.isEmpty && vehicleId.count <= 200 && !vehicleLabel.isEmpty && vehicleLabel.count <= 160
      && subtitle.count <= 160 && rows.count <= 8
      && rows.allSatisfy { $0.title.count <= 80 && $0.detail.count <= 240 }
      && (photoBase64?.utf8.count ?? 0) <= 1_398_104
      && (recordedAt == nil || (recordedAt!.isFinite && recordedAt! >= 0 && recordedAt! <= Date().timeIntervalSince1970 * 1000 + 5000))
  }
}

// Accessed on the main queue. Deliberately memory-only: never restore a previous car after a process restart.
final class VehicleCarPlayStore {
  static let shared = VehicleCarPlayStore()
  static let changed = Notification.Name("VehicleSenseXCarDisplayChanged")
  private(set) var payload: VehicleDisplayPayload?
  var connectedScenes = 0
  var enabled: Bool { Bundle.main.object(forInfoDictionaryKey: "VehicleSenseXCarPlayEnabled") as? Bool == true }

  private init() {}

  func sync(_ json: String?) throws -> Bool {
    guard enabled, let json = json else { clear(); return enabled }
    guard let data = json.data(using: .utf8), data.count <= 1_500_000,
          let next = try? JSONDecoder().decode(VehicleDisplayPayload.self, from: data), next.isValid else {
      clear()
      throw NSError(domain: "VehicleRadio", code: 1, userInfo: [NSLocalizedDescriptionKey: "Nieprawidłowe dane widoku CarPlay."])
    }
    payload = next
    NotificationCenter.default.post(name: Self.changed, object: nil)
    return true
  }
  private func clear() {
    payload = nil
    NotificationCenter.default.post(name: Self.changed, object: nil)
  }
}

@objc(VehicleSenseXCarPlaySceneDelegate)
public final class VehicleCarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
  private var controller: CPInterfaceController?
  private var template: CPListTemplate?
  private var observer: NSObjectProtocol?
  private var refreshTimer: Timer?
  private var lastRender = Date.distantPast
  private var displayedVehicleId: String?

  deinit {
    refreshTimer?.invalidate()
    if let observer = observer { NotificationCenter.default.removeObserver(observer) }
  }

  public func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didConnect interfaceController: CPInterfaceController) {
    controller = interfaceController
    VehicleCarPlayStore.shared.connectedScenes += 1
    observer = NotificationCenter.default.addObserver(forName: VehicleCarPlayStore.changed, object: nil, queue: .main) { [weak self] _ in
      Task { @MainActor in self?.scheduleRender() }
    }
    render()
  }
  public func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didDisconnectInterfaceController interfaceController: CPInterfaceController) {
    refreshTimer?.invalidate(); refreshTimer = nil
    if let observer = observer { NotificationCenter.default.removeObserver(observer) }
    observer = nil; controller = nil; template = nil
    VehicleCarPlayStore.shared.connectedScenes = max(0, VehicleCarPlayStore.shared.connectedScenes - 1)
  }
  private func scheduleRender() {
    // User vehicle changes and deletion clear old identity immediately; periodic data updates are throttled.
    if VehicleCarPlayStore.shared.payload?.vehicleId != displayedVehicleId { refreshTimer?.invalidate(); refreshTimer = nil; render(); return }
    let delay = 10 - Date().timeIntervalSince(lastRender)
    if delay <= 0 { render(); return }
    guard refreshTimer == nil else { return }
    refreshTimer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
      Task { @MainActor in self?.refreshTimer = nil; self?.render() }
    }
  }
  private func thumbnail(_ base64: String?) -> UIImage? {
    guard let base64 = base64, let data = Data(base64Encoded: base64), data.count <= 1_048_576,
          let source = CGImageSourceCreateWithData(data as CFData, [kCGImageSourceShouldCache: false] as CFDictionary),
          let image = CGImageSourceCreateThumbnailAtIndex(source, 0, [kCGImageSourceCreateThumbnailFromImageAlways: true, kCGImageSourceThumbnailMaxPixelSize: 160, kCGImageSourceCreateThumbnailWithTransform: true] as CFDictionary) else { return nil }
    return UIImage(cgImage: image)
  }
  private func row(_ title: String, _ detail: String, image: UIImage? = nil) -> CPListItem {
    let item = CPListItem(text: title, detailText: detail, image: image)
    item.isEnabled = false
    return item
  }
  private func render() {
    guard let controller = controller else { return }
    let payload = VehicleCarPlayStore.shared.payload
    displayedVehicleId = payload?.vehicleId
    var items: [CPListItem] = []
    if let payload = payload {
      items.append(row(payload.vehicleLabel, payload.subtitle, image: thumbnail(payload.photoBase64)))
      let formatter = DateFormatter(); formatter.dateStyle = .short; formatter.timeStyle = .medium
      let stamp = payload.recordedAt.map { formatter.string(from: Date(timeIntervalSince1970: $0 / 1000)) } ?? "Brak odczytu"
      items.append(row("Czas zapisanego odczytu", stamp + " · nie Live"))
      items.append(contentsOf: payload.rows.map { row($0.title, $0.detail) })
    } else {
      items.append(row("Brak danych samochodu", "Otwórz garaż na telefonie, gdy jest to bezpieczne. Zapisz odczyt diagnostyczny."))
    }
    let sections = [CPListSection(items: Array(items.prefix(CPListTemplate.maximumItemCount)))]
    if let template = template { template.updateSections(sections) }
    else {
      let next = CPListTemplate(title: "VehicleSenseX · odczyt zapisany", sections: sections)
      template = next
      controller.setRootTemplate(next, animated: false) { [weak self] success, _ in
        if !success { self?.template = nil }
      }
    }
    lastRender = Date()
  }
}
