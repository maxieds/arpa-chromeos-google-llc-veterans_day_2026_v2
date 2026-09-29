// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from './testing/test_import_manager.js';
export class AsyncUtil {
    static async getDesktop() {
        return new Promise(resolve => chrome.automation.getDesktop(resolve));
    }
    static async getFocus() {
        return new Promise(resolve => chrome.automation.getFocus(resolve));
    }
    static async getLocalizedDomKeyStringForKeyCode(keyCode) {
        return new Promise(resolve => chrome.accessibilityPrivate.getLocalizedDomKeyStringForKeyCode(keyCode, resolve));
    }
}
TestImportManager.exportForTesting(AsyncUtil);
