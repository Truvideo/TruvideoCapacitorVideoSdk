import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(TruvideoSdkVideoPlugin)
public class TruvideoSdkVideoPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TruvideoSdkVideoPlugin"
    public let jsName = "TruvideoSdkVideo"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = TruvideoSdkVideo()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }
}
