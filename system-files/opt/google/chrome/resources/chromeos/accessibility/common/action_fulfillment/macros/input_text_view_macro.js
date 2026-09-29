// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { ContextChecker } from '../context_checker.js';
import { Macro, MacroError } from './macro.js';
import { MacroName } from './macro_names.js';
/**
 * Macro that inputs text at the current cursor position.
 */
export class InputTextViewMacro extends Macro {
    text_;
    inputController_;
    constructor(text, inputController, macroName = MacroName.INPUT_TEXT_VIEW) {
        super(macroName, new ContextChecker(inputController));
        this.text_ = text;
        this.inputController_ = inputController;
    }
    run() {
        if (!this.inputController_.isActive()) {
            return this.createRunMacroResult_(
            /*isSuccess=*/ false, MacroError.FAILED_ACTUATION);
        }
        this.inputController_.commitText(this.text_);
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
}
/** Macro to type a new line character. */
export class NewLineMacro extends InputTextViewMacro {
    constructor(inputController) {
        super('\n', inputController, MacroName.NEW_LINE);
    }
}
