// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Macro, ToggleDirection } from './macro.js';
/** Class that implements a macro that runs the supplied callback. */
export class CustomCallbackMacro extends Macro {
    callback_;
    toggleDirection_ = ToggleDirection.NONE;
    constructor(macroName, callback, toggleDirection) {
        super(macroName);
        this.callback_ = callback;
        if (toggleDirection) {
            this.toggleDirection_ = toggleDirection;
        }
    }
    isToggle() {
        return this.toggleDirection_ !== ToggleDirection.NONE;
    }
    getToggleDirection() {
        return this.toggleDirection_;
    }
    run() {
        this.callback_();
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
}
