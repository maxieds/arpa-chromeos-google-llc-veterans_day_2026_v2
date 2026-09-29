// Copyright 2015 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Commands to pass from the ChromeVox background page context
 * to the ChromeVox Panel.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
/**
 * Create one command to pass to the ChromeVox Panel.
 */
export class PanelCommand {
    type;
    data;
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
    getPanelWindow() {
        const views = chrome.extension.getViews();
        for (let i = 0; i < views.length; i++) {
            if (views[i]['location'].href.indexOf('panel/panel.html') > 0) {
                return views[i];
            }
        }
        throw new Error('Could not find the panel window');
    }
    waitForPanel() {
        return new Promise(resolve => {
            const panelWindow = this.getPanelWindow();
            if (panelWindow.document.readyState === 'complete') {
                // The panel may already have loaded. In this case, resolve() and
                // do not wait for a load event that has already fired.
                resolve();
            }
            panelWindow.addEventListener('load', () => {
                resolve();
            });
        });
    }
    /** Send this command to the ChromeVox Panel window. */
    async send() {
        // Do not send commands to the ChromeVox Panel window until it has finished
        // loading and is ready to receive commands.
        await this.waitForPanel();
        const panelWindow = this.getPanelWindow();
        panelWindow.postMessage(JSON.stringify(this), window.location.origin);
    }
}
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
    PanelCommandType["ENABLE_TEST_HOOKS"] = "enable_test_hooks";
})(PanelCommandType || (PanelCommandType = {}));
TestImportManager.exportForTesting(PanelCommand, ['PanelCommandType', PanelCommandType]);
