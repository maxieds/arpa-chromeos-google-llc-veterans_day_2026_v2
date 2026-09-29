// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Macro } from '/common/action_fulfillment/macros/macro.js';
import { MacroName } from '/common/action_fulfillment/macros/macro_names.js';
/**
 * Class that implements a macro to reset the cursor position.
 */
export class ResetCursorMacro extends Macro {
    mouseController_;
    constructor(mouseController) {
        super(MacroName.RESET_CURSOR);
        this.mouseController_ = mouseController;
    }
    run() {
        this.mouseController_.resetLocation();
        return this.createRunMacroResult_(/*isSuccess=*/ true);
    }
}
