// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { CommandStore } from './command_store.js';
var SessionType = chrome.chromeosInfoPrivate.SessionType;
export class PermissionChecker {
    isIncognito_;
    isKioskSession_;
    static instance;
    constructor() {
        this.isIncognito_ = Boolean(chrome.runtime.getManifest()['incognito']);
        this.isKioskSession_ = false;
    }
    static async init() {
        PermissionChecker.instance = new PermissionChecker();
        await PermissionChecker.instance.fetchState_();
    }
    static isAllowed(command) {
        return PermissionChecker.instance.isAllowed_(command);
    }
    isAllowed_(command) {
        if (!this.isIncognito_ && !this.isKioskSession_) {
            return true;
        }
        return !CommandStore.denySignedOut(command);
    }
    async fetchState_() {
        const result = await new Promise(resolve => chrome.chromeosInfoPrivate.get(['sessionType'], resolve));
        this.isKioskSession_ = result['sessionType'] === SessionType.KIOSK;
    }
}
