// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from './testing/test_import_manager.js';
/**
 * This class assists with processing repeated events in nontrivial ways by
 * allowing only the most recent event to be processed.
 */
export class RepeatedEventHandler {
    eventStack_ = [];
    nodes_;
    type_;
    callback_;
    exactMatch_;
    capture_;
    listening_ = false;
    handler_;
    constructor(nodes, type, callback, options = {}) {
        this.nodes_ = nodes instanceof Array ? nodes : [nodes];
        if (options.allAncestors) {
            nodes = this.nodes_; // Make sure nodes is an array.
            this.nodes_ = [];
            for (let node of nodes) {
                while (node) {
                    this.nodes_.push(node);
                    // TODO(b/314203187): Not null asserted, check these to make sure they
                    // are correct.
                    node = node.parent;
                }
            }
        }
        this.type_ = type;
        this.callback_ = callback;
        this.exactMatch_ = options.exactMatch || false;
        this.capture_ = options.capture || false;
        this.handler_ = event => this.onEvent_(event);
        this.start();
    }
    /** Starts listening or handling events. */
    start() {
        if (this.listening_) {
            return;
        }
        this.listening_ = true;
        for (const node of this.nodes_) {
            node.addEventListener(this.type_, this.handler_, this.capture_);
        }
    }
    /** Stops listening or handling future events. */
    stop() {
        if (!this.listening_) {
            return;
        }
        this.listening_ = false;
        for (const node of this.nodes_) {
            node.removeEventListener(this.type_, this.handler_, this.capture_);
        }
    }
    onEvent_(event) {
        this.eventStack_.push(event);
        setTimeout(() => this.handleEvent_(), 0);
    }
    handleEvent_() {
        if (!this.listening_ || this.eventStack_.length === 0) {
            return;
        }
        // TODO(b/314203187): Not null asserted, check these to make sure they are
        // correct.
        const event = this.eventStack_.pop();
        if (this.exactMatch_ && !this.nodes_.includes(event.target)) {
            return;
        }
        this.eventStack_ = [];
        this.callback_(event);
    }
}
TestImportManager.exportForTesting(RepeatedEventHandler);
