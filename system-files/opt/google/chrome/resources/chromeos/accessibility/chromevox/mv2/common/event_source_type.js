// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Types available for tracking the current event source.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
export var EventSourceType;
(function (EventSourceType) {
    EventSourceType["NONE"] = "none";
    EventSourceType["BRAILLE_KEYBOARD"] = "brailleKeyboard";
    EventSourceType["STANDARD_KEYBOARD"] = "standardKeyboard";
    EventSourceType["TOUCH_GESTURE"] = "touchGesture";
})(EventSourceType || (EventSourceType = {}));
TestImportManager.exportForTesting(['EventSourceType', EventSourceType]);
