// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from '../testing/test_import_manager.js';
export var Context;
(function (Context) {
    Context[Context["INACTIVE_INPUT_CONTROLLER"] = 1] = "INACTIVE_INPUT_CONTROLLER";
    Context[Context["EMPTY_EDITABLE"] = 2] = "EMPTY_EDITABLE";
    Context[Context["NO_SELECTION"] = 3] = "NO_SELECTION";
    Context[Context["INVALID_INPUT"] = 4] = "INVALID_INPUT";
    Context[Context["NO_PREVIOUS_MACRO"] = 5] = "NO_PREVIOUS_MACRO";
})(Context || (Context = {}));
/** A class that can be used to specify and check contexts. */
export class ContextChecker {
    inputController_;
    invalidContexts_ = [];
    constructor(inputController) {
        this.inputController_ = inputController;
    }
    /** @return |this| for chaining */
    add(context) {
        this.invalidContexts_.push(context);
        return this;
    }
    getFailedContext() {
        if (!this.inputController_.isActive()) {
            return Context.INACTIVE_INPUT_CONTROLLER;
        }
        for (const context of this.invalidContexts_) {
            if (this.check_(context)) {
                return context;
            }
        }
        return null;
    }
    check_(context) {
        const data = this.inputController_.getEditableNodeData();
        if (!data) {
            return false;
        }
        switch (context) {
            case Context.EMPTY_EDITABLE:
                return Boolean(!data.value);
            case Context.NO_SELECTION:
                return data.selStart === data.selEnd;
        }
        return false;
    }
}
TestImportManager.exportForTesting(['Context', Context]);
