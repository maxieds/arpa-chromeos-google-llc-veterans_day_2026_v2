// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * Represents a strategy for parsing speech input and converting it into a
 * Macro.
 */
export class ParseStrategy {
    inputController_;
    enabled = false;
    constructor(inputController) {
        this.inputController_ = inputController;
    }
    getInputController() {
        return this.inputController_;
    }
    isEnabled() {
        return this.enabled;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /** Refreshes this strategy when the locale changes. */
    refresh() { }
    /** Accepts text, parses it, and returns a Macro. */
    async parse(text) {
        throw new Error(`The parse() function must be implemented by each subclass. Trying to parse text: ${text}`);
    }
}
