// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview The driver for the UI for incremental search.
 */
import { constants } from '/common/constants.js';
import { BackgroundBridge } from '../common/background_bridge.js';
import { PanelInterface } from './panel_interface.js';
const Dir = constants.Dir;
export class ISearchUI {
    static instance;
    onKeyDown;
    onTextInput;
    input_;
    dir_ = Dir.FORWARD;
    constructor(input) {
        this.input_ = input;
        this.onKeyDown = event => this.onKeyDown_(event);
        this.onTextInput = event => this.onTextInput_(event);
        input.addEventListener('keydown', this.onKeyDown, true);
        input.addEventListener('textInput', this.onTextInput, false);
    }
    static async init(input) {
        if (ISearchUI.instance) {
            ISearchUI.instance.destroy();
        }
        await BackgroundBridge.PanelBackground.createNewISearch();
        ISearchUI.instance = new ISearchUI(input);
        input.focus();
        input.select();
        return ISearchUI.instance;
    }
    onKeyDown_(evt) {
        // TODO(b/314203187): Not null asserted, check that this is correct.
        switch (evt.key) {
            case 'ArrowUp':
                this.dir_ = Dir.BACKWARD;
                break;
            case 'ArrowDown':
                this.dir_ = Dir.FORWARD;
                break;
            case 'Escape':
                PanelInterface.instance.closeMenusAndRestoreFocus();
                return false;
            case 'Enter':
                PanelInterface.instance.setPendingCallback(async () => await BackgroundBridge.PanelBackground.setRangeToISearchNode());
                PanelInterface.instance.closeMenusAndRestoreFocus();
                return false;
            default:
                return false;
        }
        // TODO(b/314203187): Not null asserted, check that this is correct.
        BackgroundBridge.PanelBackground.incrementalSearch(this.input_.value, this.dir_, true);
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    }
    onTextInput_(evt) {
        const searchStr = evt.target.value + evt.data;
        BackgroundBridge.PanelBackground.incrementalSearch(searchStr, this.dir_);
        return true;
    }
    /** Unregisters event handlers. */
    destroy() {
        BackgroundBridge.PanelBackground.destroyISearch();
        const input = this.input_;
        this.input_ = null;
        input?.removeEventListener('keydown', this.onKeyDown, true);
        input?.removeEventListener('textInput', this.onTextInput, false);
    }
}
