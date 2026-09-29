// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Extends the service worker lifetime indefinitely by calling
 * chrome.runtime.getPlatformInfo() every 20 seconds.
 */
import { TestImportManager } from './testing/test_import_manager.js';
export class KeepAlive {
    static instance;
    interval;
    static init() {
        if (!KeepAlive.instance) {
            KeepAlive.instance = new KeepAlive();
            KeepAlive.instance.startHeartbeat();
        }
    }
    static stop() {
        if (KeepAlive.instance) {
            clearInterval(KeepAlive.instance.interval);
            delete KeepAlive.instance;
        }
    }
    runHeartbeat() {
        chrome.runtime.getPlatformInfo();
    }
    startHeartbeat() {
        // Run the heartbeat once.
        this.runHeartbeat();
        // Then again every 20 seconds.
        this.interval = setInterval(() => this.runHeartbeat(), 20 * 1000);
    }
}
TestImportManager.exportForTesting(KeepAlive);
