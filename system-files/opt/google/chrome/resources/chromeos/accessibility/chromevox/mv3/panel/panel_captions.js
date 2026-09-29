// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { BackgroundBridge } from '../common/background_bridge.js';
/**
 * @fileoverview Handles processing and displaying braille in the ChromeVox
 * panel.
 */
class BrailleCaptions {
    brailleTableElement_ = $('braille-table');
    brailleTableElement2_ = $('braille-table2');
    addBorders(cell) {
        if (cell.tagName === 'TD') {
            cell.className = 'highlighted-cell';
            const companionIDs = cell.getAttribute('data-companionIDs');
            companionIDs.split(' ').forEach(companionID => $(companionID).className = 'highlighted-cell');
        }
    }
    clearTables() {
        this.clearTable_(this.brailleTableElement_);
        this.clearTable_(this.brailleTableElement2_);
    }
    removeBorders(cell) {
        if (cell.tagName === 'TD') {
            cell.className = 'unhighlighted-cell';
            const companionIDs = cell.getAttribute('data-companionIDs');
            companionIDs.split(' ').forEach(companionID => $(companionID).className = 'unhighlighted-cell');
        }
    }
    routeCursor(cell) {
        if (cell.tagName === 'TD') {
            const displayPosition = parseInt(cell.id.split('-')[0], 10);
            if (Number.isNaN(displayPosition)) {
                throw new Error('The display position is calculated assuming that the cell ID ' +
                    'is formatted like int-string. For example, 0-brailleCell is a ' +
                    'valid cell ID.');
            }
            BackgroundBridge.BrailleBackground.brailleRoute(displayPosition);
        }
    }
    clearTable_(table) {
        const rowCount = table.rows.length;
        for (let i = 0; i < rowCount; i++) {
            table.deleteRow(0);
        }
    }
}
function $(id) {
    return document.getElementById(id);
}
export var PanelCaptions;
(function (PanelCaptions) {
    function init() {
        if (PanelCaptions.braille) {
            throw new Error('Cannot create two PanelCaptions instances');
        }
        PanelCaptions.braille = new BrailleCaptions();
    }
    PanelCaptions.init = init;
})(PanelCaptions || (PanelCaptions = {}));
