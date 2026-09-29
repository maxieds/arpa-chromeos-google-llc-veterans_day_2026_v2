// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from '/common/testing/test_import_manager.js';
/**
 * The types of commands that can be sent between the offscreen document and the
 * Accessibility Common service workers.
 */
export var OffscreenCommandType;
(function (OffscreenCommandType) {
    // From service worker to offscreen document:
    OffscreenCommandType["DICTATION_PLAY_CANCEL"] = "DictationPlayCancel";
    OffscreenCommandType["DICTATION_PLAY_START"] = "DictationPlayStart";
    OffscreenCommandType["DICTATION_PLAY_END"] = "DictationPlayEnd";
    OffscreenCommandType["DICTATION_PUMPKIN_INSTALL"] = "DictationPumpkinInstall";
    OffscreenCommandType["DICTATION_PUMPKIN_RECEIVE"] = "DictationPumpkinReceive";
    OffscreenCommandType["DICTATION_PUMPKIN_SEND"] = "DictationPumpkinSend";
    OffscreenCommandType["FACEGAZE_WEBCAM_DETECT_LANDMARK"] = "FacegazeWebCamDetectLandmark";
    OffscreenCommandType["FACEGAZE_WEBCAM_INITIALIZE"] = "FacegazeWebCamInitialize";
    OffscreenCommandType["FACEGAZE_WEBCAM_STOP"] = "FacegazeWebCamStop";
    // Test-only:
    OffscreenCommandType["FACEGAZE_CREATE_FACE_LANDMARKER_FOR_TEST"] = "FacegazeCreateFaceLandmarkerForTest";
    OffscreenCommandType["FACEGAZE_MOCK_NO_CAMERA_FOR_TEST"] = "FacegazeMockNoCameraForTest";
    OffscreenCommandType["FACEGAZE_MOCK_TIMEOUT_FOR_TEST"] = "FacegazeMockTimeoutForTest";
    OffscreenCommandType["FACEGAZE_MOCK_RUN_LATEST_TIMEOUT_FOR_TEST"] = "FacegazeRunLatestTimeoutForTest";
    OffscreenCommandType["FACEGAZE_CONNECT_TO_WEB_CAM_FOR_TEST"] = "FacegazeConnectToWebCamForTest";
    OffscreenCommandType["FACEGAZE_GET_CAMERA_RETRIES_FOR_TEST"] = "FacegazeGetCameraRetriesForTest";
    OffscreenCommandType["FACEGAZE_SET_CAMERA_RETRIES_FOR_TEST"] = "FacegazeSetCameraRetriesForTest";
    OffscreenCommandType["FACEGAZE_HAS_FACE_LANDMARKER_FOR_TEST"] = "FacegazeHasFaceLandmarkerForTest";
    OffscreenCommandType["FACEGAZE_WEBCAM_STOP_FOR_TEST"] = "FacegazeWebCamStopForTest";
    // From offscreen document to service worker:
    OffscreenCommandType["FACEGAZE_SW_INSTALL_ASSETS"] = "FacegazeSwInstallAssets";
    OffscreenCommandType["FACEGAZE_SW_ON_TRACK_MUTED"] = "FacegazeSwOnTrackMuted";
    OffscreenCommandType["FACEGAZE_SW_ON_TRACK_UNMUTED"] = "FacegazeSwOnTrackUnmuted";
    OffscreenCommandType["FACEGAZE_SW_SET_PREF"] = "FacegazeSwSetPref";
    OffscreenCommandType["FACEGAZE_SW_UPDATE_BUBBLE_REMAINING_RETRIES"] = "FacegazeSwUpdateBubbleRemainingRetries";
    OffscreenCommandType["MESSENGER_SW_READY"] = "MessengerSwReady";
})(OffscreenCommandType || (OffscreenCommandType = {}));
TestImportManager.exportForTesting(['OffscreenCommandType', OffscreenCommandType]);
