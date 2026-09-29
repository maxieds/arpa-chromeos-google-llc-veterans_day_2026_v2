// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Sends Braille commands to the Braille API.
 */
import { BridgeHelper } from '/common/bridge_helper.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { BridgeConstants } from '../../common/bridge_constants.js';
import { ChromeVoxState } from '../chromevox_state.js';
import { LogStore } from '../logging/log_store.js';
import { BrailleDisplayManager } from './braille_display_manager.js';
import { BrailleInputHandler } from './braille_input_handler.js';
import { BrailleKeyEventRewriter } from './braille_key_event_rewriter.js';
import { BrailleTranslatorManager } from './braille_translator_manager.js';
export class BrailleBackground {
    frozen_ = false;
    static instance;
    constructor() {
        BrailleDisplayManager.instance.setCommandListener((evt, content) => this.routeBrailleKeyEvent_(evt, content));
        BridgeHelper.registerHandler(BridgeConstants.BrailleBackground.TARGET, BridgeConstants.BrailleBackground.Action.BRAILLE_ROUTE, (displayPosition) => this.route(displayPosition));
    }
    static init() {
        if (BrailleBackground.instance) {
            throw new Error('Cannot create two BrailleBackground instances');
        }
        // Must be called first.
        BrailleTranslatorManager.init();
        // Must be called before creating BrailleBackground.
        BrailleDisplayManager.init();
        BrailleInputHandler.init();
        BrailleKeyEventRewriter.init();
        BrailleBackground.instance = new BrailleBackground();
    }
    /** BrailleInterface implementation. */
    write(params) {
        if (this.frozen_) {
            return;
        }
        LogStore.instance.writeBrailleLog(params.text.toString());
        this.setContent_(params, null);
    }
    /** BrailleInterface implementation. */
    writeRawImage(imageDataUrl) {
        if (this.frozen_) {
            return;
        }
        BrailleDisplayManager.instance.setImageContent(imageDataUrl);
    }
    /** BrailleInterface implementation. */
    freeze() {
        this.frozen_ = true;
    }
    /** BrailleInterface implementation. */
    thaw() {
        this.frozen_ = false;
    }
    /** BrailleInterface implementation. */
    getDisplayState() {
        return BrailleDisplayManager.instance.getDisplayState();
    }
    /** BrailleInterface implementation. */
    panLeft() {
        BrailleDisplayManager.instance.panLeft();
    }
    /** BrailleInterface implementation. */
    panRight() {
        BrailleDisplayManager.instance.panRight();
    }
    /** BrailleInterface implementation. */
    route(displayPosition) {
        return BrailleDisplayManager.instance.route(displayPosition);
    }
    /** BrailleInterface implementation. */
    async backTranslate(cells) {
        return await BrailleTranslatorManager.backTranslate(cells);
    }
    setContent_(newContent, _newContentId) {
        const updateContent = () => BrailleDisplayManager.instance.setContent(newContent, BrailleInputHandler.instance.getExpansionType());
        BrailleInputHandler.instance.onDisplayContentChanged(newContent.text, updateContent);
        updateContent();
    }
    /**
     * Handles braille key events by dispatching either to the event rewriter,
     * input handler, or ChromeVox's background object.
     * @param content Content of display when event fired.
     */
    routeBrailleKeyEvent_(brailleEvt, content) {
        if (BrailleKeyEventRewriter.instance.onBrailleKeyEvent(brailleEvt)) {
            return;
        }
        if (BrailleInputHandler.instance.onBrailleKeyEvent(brailleEvt)) {
            return;
        }
        if (ChromeVoxState.instance) {
            ChromeVoxState.instance.onBrailleKeyEvent(brailleEvt, content);
        }
    }
}
TestImportManager.exportForTesting(BrailleBackground);
