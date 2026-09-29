// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { ChromeVoxRange } from '../chromevox_range.js';
import { ChromeVoxPrefs } from '../prefs.js';
import { LogStore } from './log_store.js';
export class LogUrlWatcher {
    static instance;
    static init() {
        // TODO(b/314203187): Not null asserted, check that this is correct.
        ChromeVoxPrefs.instance.enableOrDisableLogUrlWatcher();
    }
    static create() {
        if (LogUrlWatcher.instance) {
            return;
        }
        LogUrlWatcher.instance = new LogUrlWatcher();
        ChromeVoxRange.addObserver(LogUrlWatcher.instance);
        // Initialize using the current range.
        LogUrlWatcher.instance.onCurrentRangeChanged(ChromeVoxRange.current);
    }
    static destroy() {
        if (!LogUrlWatcher.instance) {
            return;
        }
        ChromeVoxRange.removeObserver(LogUrlWatcher.instance);
        LogUrlWatcher.instance = null;
    }
    /** ChromeVoxRangeObserver implementation. */
    onCurrentRangeChanged(range, _fromEditing) {
        if (range && range.start && range.start.node && range.start.node.root) {
            // TODO(b/314203187): Not null asserted, check that this is correct.
            LogStore.instance.shouldSkipOutput =
                range.start.node.root.docUrl.indexOf(chrome.runtime.getURL('chromevox/mv3/log_page/log.html')) === 0;
        }
        else {
            LogStore.instance.shouldSkipOutput = false;
        }
    }
}
