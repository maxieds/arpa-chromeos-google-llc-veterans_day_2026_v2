// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Context, ContextChecker } from '../context_checker.js';
import { Macro, MacroError } from './macro.js';
import { MacroName } from './macro_names.js';
/**
 * Implements a macro that replaces a word or phrase with another word or
 * phrase
 */
export class SmartReplacePhraseMacro extends Macro {
    inputController_;
    deletePhrase_;
    insertPhrase_;
    constructor(inputController, deletePhrase, insertPhrase) {
        super(MacroName.SMART_REPLACE_PHRASE, new ContextChecker(inputController).add(Context.EMPTY_EDITABLE));
        this.inputController_ = inputController;
        this.deletePhrase_ = deletePhrase;
        this.insertPhrase_ = insertPhrase;
    }
    run() {
        if (!this.inputController_.isActive()) {
            return this.createRunMacroResult_(
            /*isSuccess=*/ false, MacroError.FAILED_ACTUATION);
        }
        this.inputController_.replacePhrase(this.deletePhrase_, this.insertPhrase_);
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
    isSmart() {
        return true;
    }
}
