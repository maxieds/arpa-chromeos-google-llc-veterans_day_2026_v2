// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Defines the gestures that ChromeVox can process.
 */
/**
 * Must match string values in ax::mojom::Gesture, defined in
 *     ui/accessibility/ax_enums.mojom.
 */
export var Gesture;
(function (Gesture) {
    Gesture["CLICK"] = "click";
    Gesture["SWIPE_DOWN_1"] = "swipeDown1";
    Gesture["SWIPE_DOWN_2"] = "swipeDown2";
    Gesture["SWIPE_DOWN_3"] = "swipeDown3";
    Gesture["SWIPE_LEFT_1"] = "swipeLeft1";
    Gesture["SWIPE_LEFT_2"] = "swipeLeft2";
    Gesture["SWIPE_LEFT_3"] = "swipeLeft3";
    Gesture["SWIPE_LEFT_4"] = "swipeLeft4";
    Gesture["SWIPE_RIGHT_1"] = "swipeRight1";
    Gesture["SWIPE_RIGHT_2"] = "swipeRight2";
    Gesture["SWIPE_RIGHT_3"] = "swipeRight3";
    Gesture["SWIPE_RIGHT_4"] = "swipeRight4";
    Gesture["SWIPE_UP_1"] = "swipeUp1";
    Gesture["SWIPE_UP_2"] = "swipeUp2";
    Gesture["SWIPE_UP_3"] = "swipeUp3";
    Gesture["TAP_2"] = "tap2";
    Gesture["TAP_4"] = "tap4";
    Gesture["TOUCH_EXPLORE"] = "touchExplore";
})(Gesture || (Gesture = {}));
