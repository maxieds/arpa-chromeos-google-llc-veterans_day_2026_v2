// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { EventGenerator } from '../../event_generator.js';
import { Macro, MacroError } from './macro.js';
/** Class that implements a macro to send a synthetic key event. */
export class KeyPressMacro extends Macro {
    runCount_ = 0;
    repeatTimerId_;
    keyCombination_;
    constructor(macroName, keyCombination) {
        super(macroName);
        this.keyCombination_ = keyCombination;
    }
    getKeyCombination() {
        return this.keyCombination_;
    }
    clearInterval_() {
        if (this.repeatTimerId_ !== undefined) {
            clearInterval(this.repeatTimerId_);
            this.repeatTimerId_ = undefined;
        }
    }
    /**
     * The key press macro should be run twice, once at keydown and once at keyup.
     */
    triggersAtActionStartAndEnd() {
        return true;
    }
    run() {
        const key = this.keyCombination_.key;
        const modifiers = this.keyCombination_.modifiers || {};
        // To avoid the modifiers getting stripped away, do not use rewriters if
        // there are modifiers.
        const useRewriters = this.keyCombination_.modifiers ? false : true;
        if (this.runCount_ === 0) {
            EventGenerator.sendKeyDown(key, modifiers, useRewriters);
            // Start sending repeat events on an interval.
            // If the gesture ends before the interval is reached, then a single key
            // press will be generated.
            this.repeatTimerId_ = setInterval(() => EventGenerator.sendKeyDown(key, modifiers, useRewriters, /*isRepeat=*/ true), KeyPressMacro.REPEAT_MS);
        }
        else if (this.runCount_ === 1) {
            this.clearInterval_();
            EventGenerator.sendKeyUp(key, modifiers, useRewriters);
        }
        else {
            console.error('Key press macro cannot be run more than twice.');
            return this.createRunMacroResult_(
            /*isSuccess=*/ false, MacroError.INVALID_USER_INTENT);
        }
        this.runCount_++;
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
}
(function (KeyPressMacro) {
    /**
     * The rate at which repeat key down events should be sent while the key
     * press macro is being held.
     */
    KeyPressMacro.REPEAT_MS = 700;
})(KeyPressMacro || (KeyPressMacro = {}));
