// Understanding Data with Python for iPhone: a native shell around the same files that power the website.
// The web files (index.html, style.css, js/, icons/, pyodide/) are bundled from the folder above ios/,
// so the app works fully offline and stays in sync with the site. See ios/README.md.
import SwiftUI

@main
struct UnderstandingDataApp: App {
    var body: some Scene {
        WindowGroup {
            WebView()
                .background(Color(WebView.paper).ignoresSafeArea())
        }
    }
}
