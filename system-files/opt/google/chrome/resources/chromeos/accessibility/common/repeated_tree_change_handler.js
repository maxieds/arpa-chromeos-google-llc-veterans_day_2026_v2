// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from './testing/test_import_manager.js';
/**
 * This class assists with processing repeated tree changes in nontrivial ways
 * by allowing only the most recent tree change to be processed.
 */
export class RepeatedTreeChangeHandler {
    changeStack_ = [];
    callback_;
    handler_;
    /**
     * A predicate for which tree changes are of interest. If none is provided,
     * default to always return true.
     */
    predicate_;
    /**
     * @param options |predicate| A generic predicate that filters for
     *     changes of interest.
     */
    constructor(filter, callback, options = {}) {
        this.callback_ = callback;
        this.predicate_ = options.predicate || (() => true);
        this.handler_ = change => this.onChange_(change);
        chrome.automation.addTreeChangeObserver(filter, this.handler_);
    }
    onChange_(change) {
        if (this.predicate_(change)) {
            this.changeStack_.push(change);
            setTimeout(() => this.handleChange_(), 0);
        }
    }
    handleChange_() {
        if (this.changeStack_.length === 0) {
            return;
        }
        const change = this.changeStack_.pop();
        this.changeStack_ = [];
        // TODO(b/314203187): Not null asserted, check these to make sure this is
        // correct.
        this.callback_(change);
    }
}
TestImportManager.exportForTesting(RepeatedTreeChangeHandler);
