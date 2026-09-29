// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/** @fileoverview Manages fetching and checking accessibility features. */
import { TestImportManager } from './testing/test_import_manager.js';
var AccessibilityFeature = chrome.accessibilityPrivate.AccessibilityFeature;
export class Features {
    enabled_ = {};
    static instance;
    static async init() {
        if (Features.instance) {
            throw new Error('Cannot create two instances of Features in the same context');
        }
        Features.instance = new Features();
        await Features.instance.fetch_();
    }
    static isEnabled(featureName) {
        // Note: Will return undefined for any feature if Features not initialized.
        return Features.instance.enabled_[featureName];
    }
    async fetch_() {
        const promises = [];
        for (const feature of Object.values(AccessibilityFeature)) {
            promises.push(new Promise(resolve => {
                chrome.accessibilityPrivate.isFeatureEnabled(feature, result => {
                    this.enabled_[feature] = result;
                    resolve();
                });
            }));
        }
        return Promise.all(promises);
    }
}
TestImportManager.exportForTesting(Features);
