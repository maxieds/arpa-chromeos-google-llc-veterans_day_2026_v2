// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * Service worker analog to KeyboardEvent for processing
 * KeyboardEvent data. Also matches EventLikeObject.
 */
export class InternalKeyEvent {
    // `id` is used by the browser to identify this key event.
    id;
    type;
    keyCode;
    key;
    altKey;
    ctrlKey;
    metaKey;
    shiftKey;
    searchKeyHeld;
    stickyMode;
    repeat;
    // Match key_sequence.ts EventLikeObject type
    keyPrefix;
    prefixKey;
    constructor(evt) {
        this.id = evt.id;
        this.type = evt.type;
        this.keyCode = evt.keyCode;
        this.key = evt.key;
        this.altKey = evt.altKey;
        this.ctrlKey = evt.ctrlKey;
        this.metaKey = evt.metaKey;
        this.shiftKey = evt.shiftKey;
        this.searchKeyHeld = evt.searchKeyHeld;
        this.stickyMode = evt.stickyMode;
        this.repeat = evt.repeat;
        this.keyPrefix = evt.keyPrefix;
        this.prefixKey = evt.prefixKey;
    }
}
