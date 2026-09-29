// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * The facial gestures that are supported by FaceGaze. New values should also
 * be added to FacialGesturesToMediapipeGestures in
 * facegaze/gesture_detector.ts, FacialGesture definition in
 * accessibility_private.json, and ConvertFacialGestureType in
 * accessibility_extension_api_ash.cc. Please keep alphabetical.
 */
export var FacialGesture;
(function (FacialGesture) {
    FacialGesture["BROW_INNER_UP"] = "browInnerUp";
    FacialGesture["BROWS_DOWN"] = "browsDown";
    FacialGesture["EYE_SQUINT_LEFT"] = "eyeSquintLeft";
    FacialGesture["EYE_SQUINT_RIGHT"] = "eyeSquintRight";
    FacialGesture["EYES_BLINK"] = "eyesBlink";
    FacialGesture["EYES_LOOK_DOWN"] = "eyesLookDown";
    FacialGesture["EYES_LOOK_LEFT"] = "eyesLookLeft";
    FacialGesture["EYES_LOOK_RIGHT"] = "eyesLookRight";
    FacialGesture["EYES_LOOK_UP"] = "eyesLookUp";
    FacialGesture["JAW_LEFT"] = "jawLeft";
    FacialGesture["JAW_OPEN"] = "jawOpen";
    FacialGesture["JAW_RIGHT"] = "jawRight";
    FacialGesture["MOUTH_FUNNEL"] = "mouthFunnel";
    FacialGesture["MOUTH_LEFT"] = "mouthLeft";
    FacialGesture["MOUTH_PUCKER"] = "mouthPucker";
    FacialGesture["MOUTH_RIGHT"] = "mouthRight";
    FacialGesture["MOUTH_SMILE"] = "mouthSmile";
    FacialGesture["MOUTH_UPPER_UP"] = "mouthUpperUp";
})(FacialGesture || (FacialGesture = {}));
