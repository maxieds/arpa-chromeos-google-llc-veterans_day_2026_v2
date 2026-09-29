// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/** @fileoverview Manages fetching and checking command line flags. */
import { TestImportManager } from './testing/test_import_manager.js';
export var FlagName;
(function (FlagName) {
    FlagName["CHROMEVOX_Q1_FAST_TRACK"] = "enable-chromevox-q1-fast-track-features";
    FlagName["MAGNIFIER_DEBUG_DRAW_RECT"] = "enable-magnifier-debug-draw-rect";
    FlagName["MANIFEST_V3"] = "enable-experimental-accessibility-manifest-v3";
    FlagName["SWITCH_ACCESS_TEXT"] = "enable-experimental-accessibility-switch-access-text";
})(FlagName || (FlagName = {}));
export class Flags {
    enabled_ = {};
    static instance;
    static async init() {
        if (Flags.instance) {
            throw new Error('Cannot create two instances of Flags in the same context');
        }
        Flags.instance = new Flags();
        await Flags.instance.fetch_();
    }
    static isEnabled(flagName) {
        // Note: Will return undefined for any flag if Flags not initialized.
        return Flags.instance.enabled_[flagName];
    }
    async fetch_() {
        const promises = [];
        for (const flag of Object.values(FlagName)) {
            promises.push(new Promise(resolve => {
                chrome.commandLinePrivate.hasSwitch(flag, result => {
                    this.enabled_[flag] = result;
                    resolve();
                });
            }));
        }
        return Promise.all(promises);
    }
}
TestImportManager.exportForTesting(Flags);
