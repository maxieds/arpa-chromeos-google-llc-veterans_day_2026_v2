// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Context, ContextChecker } from '../context_checker.js';
import { Macro, MacroError } from './macro.js';
import { MacroName } from './macro_names.js';
/** Implements a macro that sets selection between two words or phrases. */
export class SmartSelectBetweenMacro extends Macro {
    inputController_;
    startPhrase_;
    endPhrase_;
    constructor(inputController, startPhrase, endPhrase) {
        super(MacroName.SMART_SELECT_BTWN_INCL, new ContextChecker(inputController).add(Context.EMPTY_EDITABLE));
        this.inputController_ = inputController;
        this.startPhrase_ = startPhrase;
        this.endPhrase_ = endPhrase;
    }
    run() {
        if (!this.inputController_.isActive()) {
            return this.createRunMacroResult_(
            /*isSuccess=*/ false, MacroError.FAILED_ACTUATION);
        }
        this.inputController_.selectBetween(this.startPhrase_, this.endPhrase_);
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
    isSmart() {
        return true;
    }
}
