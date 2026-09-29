// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { ArrayBufferUtil } from '/common/array_buffer_util.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { Messenger } from '../messenger.js';
import { OffscreenCommandType } from '../offscreen_command_type.js';
import { PrefNames } from './constants.js';
/**
 * The interval, in milliseconds, for which we request results from the
 * FaceLandmarker API. This should be frequent enough to give a real-time
 * feeling.
 */
const DETECT_FACE_LANDMARKS_INTERVAL_MS = 60;
/** Handles interaction with the webcam and FaceLandmarker. */
export class WebCamFaceLandmarker {
    bubbleController_;
    // Callbacks.
    onFaceLandmarkerResult_;
    onTrackMuted_;
    onTrackUnmuted_;
    setReadyForTesting_;
    constructor(bubbleController, onFaceLandmarkerResult, onTrackMuted, onTrackUnmuted) {
        this.bubbleController_ = bubbleController;
        // Save callbacks.
        this.onFaceLandmarkerResult_ = onFaceLandmarkerResult;
        this.onTrackMuted_ = onTrackMuted;
        this.onTrackUnmuted_ = onTrackUnmuted;
        this.intervalID_ = null;
        this.readyForTesting_ = new Promise(resolve => {
            this.setReadyForTesting_ = resolve;
        });
        Messenger.registerHandler(OffscreenCommandType.FACEGAZE_SW_UPDATE_BUBBLE_REMAINING_RETRIES, (message) => {
            const text = chrome.i18n.getMessage('facegaze_connect_to_camera', [message.remaining]);
            this.bubbleController_.updateBubble(text);
        });
        Messenger.registerHandler(OffscreenCommandType.FACEGAZE_SW_ON_TRACK_MUTED, () => {
            this.onTrackMuted_();
        });
        Messenger.registerHandler(OffscreenCommandType.FACEGAZE_SW_ON_TRACK_UNMUTED, () => {
            this.onTrackUnmuted_();
        });
        Messenger.registerHandler(OffscreenCommandType.FACEGAZE_SW_INSTALL_ASSETS, () => {
            return this.installAssets_();
        });
        Messenger.registerHandler(OffscreenCommandType.FACEGAZE_SW_SET_PREF, (message) => {
            chrome.settingsPrivate.setPref(message.name, message.value);
        });
    }
    /**
     * Initializes the FaceLandmarker, connects to the webcam, and starts
     * detecting face landmarks.
     */
    async init() {
        await this.initWebCam_();
        this.startDetectingFaceLandmarks_();
    }
    async initWebCam_() {
        await Messenger.send(OffscreenCommandType.FACEGAZE_WEBCAM_INITIALIZE);
        if (chrome.runtime.lastError) {
            return Promise.reject(new Error(chrome.runtime.lastError.message));
        }
        if (this.setReadyForTesting_) {
            this.setReadyForTesting_();
        }
    }
    startDetectingFaceLandmarks_() {
        this.intervalID_ = setInterval(() => this.detectFaceLandmarks_(), DETECT_FACE_LANDMARKS_INTERVAL_MS);
    }
    async detectFaceLandmarks_() {
        const startTime = performance.now();
        const response = await Messenger.send(OffscreenCommandType.FACEGAZE_WEBCAM_DETECT_LANDMARK);
        if (chrome.runtime.lastError) {
            return Promise.reject(new Error(chrome.runtime.lastError.message));
        }
        if (!response) {
            return;
        }
        const latency = performance.now() - startTime;
        // Use a callback to send the result to the main FaceGaze object.
        this.onFaceLandmarkerResult_({ result: response, latency });
    }
    async installAssets_() {
        const assets = await chrome.accessibilityPrivate.installFaceGazeAssets();
        if (!assets) {
            // FaceGaze will not work unless the FaceGaze assets are successfully
            // installed. When the assets fail to install, AccessibilityManager
            // shows a notification to the user informing them of the failure and
            // to try installing again later. As a result, we should turn FaceGaze
            // off here and allow them to toggle the feature back on to retry the
            // download.
            console.error(`Couldn't create FaceLandmarker because FaceGaze assets couldn't
             be installed.`);
            chrome.settingsPrivate.setPref(PrefNames.FACE_GAZE_ENABLED, false);
            return;
        }
        return {
            wasm: await ArrayBufferUtil.arrayBufferToBase64(assets.wasm),
            model: await ArrayBufferUtil.arrayBufferToBase64(assets.model)
        };
    }
    stop() {
        Messenger.send(OffscreenCommandType.FACEGAZE_WEBCAM_STOP);
        if (this.intervalID_ !== null) {
            clearInterval(this.intervalID_);
            this.intervalID_ = null;
        }
    }
    async stopWebCamForTesting() {
        await Messenger.send(OffscreenCommandType.FACEGAZE_WEBCAM_STOP_FOR_TEST);
        if (this.intervalID_ !== null) {
            clearInterval(this.intervalID_);
            this.intervalID_ = null;
        }
    }
}
TestImportManager.exportForTesting(WebCamFaceLandmarker);
