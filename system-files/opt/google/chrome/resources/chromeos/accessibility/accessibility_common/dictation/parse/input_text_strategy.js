// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { InputTextViewMacro } from '/common/action_fulfillment/macros/input_text_view_macro.js';
import { ParseStrategy } from './parse_strategy.js';
/** A parsing strategy that tells text to be input as-is. */
export class InputTextStrategy extends ParseStrategy {
    constructor(inputController) {
        super(inputController);
        // InputTextStrategy is always enabled.
        this.enabled = true;
    }
    async parse(text) {
        return new InputTextViewMacro(text, this.getInputController());
    }
}
