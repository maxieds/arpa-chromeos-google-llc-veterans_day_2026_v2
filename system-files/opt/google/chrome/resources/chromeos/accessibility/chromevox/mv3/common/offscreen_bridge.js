// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Provides an interface for communication with the offscreen
 * document.
 */
import { BridgeHelper } from '/common/bridge_helper.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { BridgeConstants } from './bridge_constants.js';
const OffscreenTarget = BridgeConstants.Offscreen.TARGET;
const OffscreenAction = BridgeConstants.Offscreen.Action;
const OffscreenTestTarget = BridgeConstants.OffscreenTest.TARGET;
const OffscreenTestAction = BridgeConstants.OffscreenTest.Action;
export class OffscreenBridge {
    static chromeVoxReady() {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.CHROMEVOX_READY);
    }
    static earconCancelProgress() {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.EARCON_CANCEL_PROGRESS);
    }
    static earconCancelLoading() {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.EARCON_CANCEL_LOADING);
    }
    static earconResetPan() {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.EARCON_RESET_PAN);
    }
    static earconSetPositionForRect(rect, container) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.EARCON_SET_POSITION_FOR_RECT, rect, container);
    }
    static imageDataFromUrl(imageDataUrl, imageState) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.IMAGE_DATA_FROM_URL, imageDataUrl, imageState);
    }
    static learnModeRegisterListeners() {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.LEARN_MODE_REGISTER_LISTENERS);
    }
    static learnModeRemoveListeners() {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.LEARN_MODE_REMOVE_LISTENERS);
    }
    static libLouisStartWorker(wasmPath) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.LIBLOUIS_START_WORKER, wasmPath);
    }
    static libLouisRPC(json) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.LIBLOUIS_RPC, json);
    }
    static onClipboardDataChanged(forceRead) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.ON_CLIPBOARD_DATA_CHANGED, forceRead);
    }
    static playEarcon(earconId) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.PLAY_EARCON, earconId);
    }
    static shouldSetDefaultVoice() {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.SHOULD_SET_DEFAULT_VOICE);
    }
    static sreMove(keyCode) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.SRE_MOVE, keyCode);
    }
    static sreWalk(mathml) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.SRE_WALK, mathml);
    }
    static tenjiBackTranslate(tenjiString) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.TENJI_BACK_TRANSLATE, tenjiString);
    }
    static tenjiStartWorker(tenjiData) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.TENJI_START_WORKER, tenjiData);
    }
    static tenjiTranslate(text) {
        return BridgeHelper.sendMessage(OffscreenTarget, OffscreenAction.TENJI_TRANSLATE, text);
    }
    // For testing purposes only.
    static recordEarconsForTest() {
        return BridgeHelper.sendMessage(OffscreenTestTarget, OffscreenTestAction.RECORD_EARCONS);
    }
    static reportEarconsForTest() {
        return BridgeHelper.sendMessage(OffscreenTestTarget, OffscreenTestAction.REPORT_EARCONS);
    }
}
TestImportManager.exportForTesting(OffscreenBridge);
