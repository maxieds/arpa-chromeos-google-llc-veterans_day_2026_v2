// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Context, ContextChecker } from '../context_checker.js';
import { Macro, MacroError } from './macro.js';
import { MacroName } from './macro_names.js';
/**
 * Implements a macro that inserts a word or phrase before another word or
 * phrase
 */
export class SmartInsertBeforeMacro extends Macro {
    inputController_;
    insertPhrase_;
    beforePhrase_;
    constructor(inputController, insertPhrase, beforePhrase) {
        super(MacroName.SMART_INSERT_BEFORE, new ContextChecker(inputController).add(Context.EMPTY_EDITABLE));
        this.inputController_ = inputController;
        this.insertPhrase_ = insertPhrase;
        this.beforePhrase_ = beforePhrase;
    }
    run() {
        if (!this.inputController_.isActive()) {
            return this.createRunMacroResult_(
            /*isSuccess=*/ false, MacroError.FAILED_ACTUATION);
        }
        this.inputController_.insertBefore(this.insertPhrase_, this.beforePhrase_);
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
    isSmart() {
        return true;
    }
}
