// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class BrowserUtil {
    /**
     * Opens a URL in the browser.
     * @param url The URL to open.
     */
    static async openBrowserUrl(url) {
        chrome.windows.getAll((windows) => {
            if (windows.length > 0) {
                // Open in existing window.
                chrome.tabs.create({ url }, (_tab) => { });
            }
            else {
                // No window open, cannot use chrome.tabs API (chrome.tabs.create
                // would error).
                chrome.windows.create({ url });
            }
        });
    }
}
