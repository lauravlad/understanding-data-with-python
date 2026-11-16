import SwiftUI
import UIKit
import WebKit

/// Serves the bundled web files under app://local/… instead of file://.
/// Python (Pyodide) needs this: WebAssembly, background workers and fetch() do not work from file:// pages.
final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "app"
    static let home = URL(string: "app://local/index.html")!

    private static let types: [String: String] = [
        "html": "text/html; charset=utf-8", "css": "text/css; charset=utf-8", "js": "text/javascript; charset=utf-8",
        "json": "application/json", "wasm": "application/wasm", "svg": "image/svg+xml", "png": "image/png",
        "zip": "application/zip", "whl": "application/octet-stream", "webmanifest": "application/manifest+json",
    ]

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, let root = Bundle.main.resourceURL?.standardizedFileURL else {
            task.didFailWithError(URLError(.badURL)); return
        }
        var path = url.path
        if path.isEmpty || path == "/" { path = "/index.html" }
        let file = root.appendingPathComponent(String(path.dropFirst())).standardizedFileURL
        // Only files inside the app bundle may be served.
        guard file.path.hasPrefix(root.path + "/"), let data = try? Data(contentsOf: file, options: .mappedIfSafe) else {
            let missing = HTTPURLResponse(url: url, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: ["Content-Length": "0"])!
            task.didReceive(missing); task.didFinish(); return
        }
        let type = Self.types[file.pathExtension.lowercased()] ?? "application/octet-stream"
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: [
            "Content-Type": type, "Content-Length": String(data.count), "Access-Control-Allow-Origin": "*",
        ])!
        task.didReceive(response); task.didReceive(data); task.didFinish()
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

/// Shows the bundled course full screen.
struct WebView: UIViewRepresentable {
    /// The page background, shown while the page loads.
    static let paper = UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(red: 0x12 / 255, green: 0x16 / 255, blue: 0x1D / 255, alpha: 1)
            : UIColor(red: 0xF4 / 255, green: 0xF1 / 255, blue: 0xEA / 255, alpha: 1)
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()  // keeps progress (localStorage) between launches
        config.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: BundleSchemeHandler.scheme)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsLinkPreview = false
        webView.isOpaque = false
        webView.backgroundColor = Self.paper
        webView.scrollView.backgroundColor = Self.paper
        #if DEBUG
        if #available(iOS 16.4, *) { webView.isInspectable = true }
        #endif

        // Launching with the argument -selftest runs every exercise and shows the result on screen.
        var home = BundleSchemeHandler.home
        if ProcessInfo.processInfo.arguments.contains("-selftest") { home = URL(string: home.absoluteString + "?selftest")! }
        webView.load(URLRequest(url: home))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        /// Pages inside the app stay in the app; links to other websites open in Safari.
        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping @MainActor (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url,
               let scheme = url.scheme?.lowercased(),
               !["app", "about", "blob"].contains(scheme) {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url { UIApplication.shared.open(url) }
            return nil
        }

        /// The page's "Reset all progress" uses confirm(); show it as a native alert.
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor (Bool) -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
            alert.addAction(UIAlertAction(title: "OK", style: .destructive) { _ in completionHandler(true) })
            let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
            if let top = scene?.keyWindow?.rootViewController { top.present(alert, animated: true) } else { completionHandler(false) }
        }
    }
}
