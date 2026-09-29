// Copyright 2015 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Commands to pass from the ChromeVox background page context
 * to the ChromeVox Panel.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { BridgeConstants } from './bridge_constants.js';
import { PanelBridge } from './panel_bridge.js';
/**
 * Create one command to pass to the ChromeVox Panel.
 */
export class PanelCommand {
    static panelIsInitialized_ = null;
    type;
    data;
    constructor(type, data) {
        this.type = type;
        this.data = data;
        if (!PanelCommand.panelIsInitialized_) {
            PanelCommand.panelIsInitialized_ = new Promise(resolve => {
                this.waitForPanel(resolve);
            });
        }
    }
    waitForPanel(resolve) {
        const message = {
            target: BridgeConstants.Panel.TARGET,
            action: BridgeConstants.Panel.Action.IS_PANEL_INITIALIZED,
            args: []
        };
        const callback = (initialized) => {
            // Panel is not yet initialized
            if (chrome.runtime.lastError) {
                setTimeout(() => this.waitForPanel(resolve), 500);
                return;
            }
            // Panel is initialized.
            if (initialized) {
                resolve();
            }
        };
        // Instead of using the PanelBridge, we will call
        // chrome.runtime.sendMessage directly, because we need to catch the
        // possible error if the panel is not initialized.
        chrome.runtime.sendMessage(undefined, message, undefined, callback);
    }
    /** Send this command to the ChromeVox Panel window. */
    async send() {
        // Do not send commands to the ChromeVox Panel window until it has finished
        // loading and is ready to receive commands.
        await PanelCommand.panelIsInitialized_;
        PanelBridge.execCommand(this);
    }
}
/**
 * The types of commands that can be sent between the panel popup and the
 * ChromeVox service worker.
 */
export var PanelCommandType;
(function (PanelCommandType) {
    PanelCommandType["CLEAR_SPEECH"] = "clear_speech";
    PanelCommandType["ADD_NORMAL_SPEECH"] = "add_normal_speech";
    PanelCommandType["ADD_ANNOTATION_SPEECH"] = "add_annotation_speech";
    PanelCommandType["CLOSE_CHROMEVOX"] = "close_chromevox";
    PanelCommandType["UPDATE_BRAILLE"] = "update_braille";
    PanelCommandType["OPEN_MENUS"] = "open_menus";
    PanelCommandType["OPEN_MENUS_MOST_RECENT"] = "open_menus_most_recent";
    PanelCommandType["SEARCH"] = "search";
    PanelCommandType["TUTORIAL"] = "tutorial";
})(PanelCommandType || (PanelCommandType = {}));
TestImportManager.exportForTesting(PanelCommand, ['PanelCommandType', PanelCommandType]);
