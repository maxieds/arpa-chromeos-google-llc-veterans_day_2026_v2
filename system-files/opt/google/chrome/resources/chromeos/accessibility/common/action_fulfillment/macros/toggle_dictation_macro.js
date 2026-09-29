// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from '../../testing/test_import_manager.js';
import { Macro, ToggleDirection } from './macro.js';
import { MacroName } from './macro_names.js';
/**
 * Class that implements a macro to toggle Dictation. When run by Dictation,
 * this will stop listening (since it had to be listening to execute the macro).
 */
export class ToggleDictationMacro extends Macro {
    toggleDirection_;
    constructor(dictationActive) {
        super(MacroName.TOGGLE_DICTATION);
        this.toggleDirection_ =
            dictationActive ? ToggleDirection.OFF : ToggleDirection.ON;
    }
    isToggle() {
        return true;
    }
    getToggleDirection() {
        return this.toggleDirection_;
    }
    run() {
        chrome.accessibilityPrivate.toggleDictation();
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
}
TestImportManager.exportForTesting(ToggleDictationMacro);
