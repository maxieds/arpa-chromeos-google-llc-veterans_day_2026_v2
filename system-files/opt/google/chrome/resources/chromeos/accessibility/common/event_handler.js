// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * This class wraps AutomationNode event listeners, adding some convenience
 * functions.
 */
export class EventHandler {
    nodes_;
    types_;
    callback_;
    capture_;
    exactMatch_;
    listenOnce_;
    listening_ = false;
    predicate_;
    handler_;
    constructor(nodes, types, callback, options = {}) {
        this.nodes_ = nodes instanceof Array ? nodes : [nodes];
        this.types_ = types instanceof Array ? types : [types];
        this.callback_ = callback;
        this.capture_ = options.capture || false;
        this.exactMatch_ = options.exactMatch || false;
        this.listenOnce_ = options.listenOnce || false;
        /**
         * Default is a function that always returns true.
         */
        this.predicate_ = options.predicate || (_e => true);
        this.handler_ = event => this.handleEvent_(event);
    }
    /** Starts listening to events. */
    start() {
        if (this.listening_) {
            return;
        }
        for (const node of this.nodes_) {
            for (const type of this.types_) {
                node.addEventListener(type, this.handler_, this.capture_);
            }
        }
        this.listening_ = true;
    }
    /** Stops listening or handling future events. */
    stop() {
        for (const node of this.nodes_) {
            for (const type of this.types_) {
                node.removeEventListener(type, this.handler_, this.capture_);
            }
        }
        this.listening_ = false;
    }
    /**
     * @return Whether this EventHandler is currently listening for events.
     */
    listening() {
        return this.listening_;
    }
    setCallback(callback) {
        this.callback_ = callback;
    }
    /**
     * Changes what nodes are being listened to. Removes listeners from existing
     *     nodes before adding listeners on new nodes.
     */
    setNodes(nodes) {
        const wasListening = this.listening_;
        // TODO(b/318557827): Shouldn't this be: if (wasListening) this.stop()?
        this.stop();
        this.nodes_ = nodes instanceof Array ? nodes : [nodes];
        if (wasListening) {
            this.start();
        }
    }
    /**
     * Adds another node to the set of nodes being listened to.
     */
    addNode(node) {
        this.nodes_.push(node);
        if (this.listening_) {
            for (const type of this.types_) {
                node.addEventListener(type, this.handler_, this.capture_);
            }
        }
    }
    /**
     * Removes a specific node from the set of nodes being listened to.
     */
    removeNode(node) {
        this.nodes_ = this.nodes_.filter(n => n !== node);
        if (this.listening_) {
            for (const type of this.types_) {
                node.removeEventListener(type, this.handler_, this.capture_);
            }
        }
    }
    handleEvent_(event) {
        if (this.exactMatch_ && !this.nodes_.includes(event.target)) {
            return;
        }
        if (!this.predicate_(event)) {
            return;
        }
        if (this.listenOnce_) {
            this.stop();
        }
        if (this.callback_) {
            this.callback_(event);
        }
    }
}
