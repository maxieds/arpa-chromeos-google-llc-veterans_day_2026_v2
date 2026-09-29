// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * This class wraps ChromeEvent listeners, adding some convenience
 * functions.
 */
export class ChromeEventHandler {
    chromeEvent_;
    callback_;
    listening_ = false;
    constructor(chromeEvent_, callback_) {
        this.chromeEvent_ = chromeEvent_;
        this.callback_ = callback_;
    }
    /** Starts listening to events. */
    start() {
        if (this.listening_) {
            return;
        }
        this.listening_ = true;
        this.chromeEvent_.addListener(this.callback_);
    }
    /** Stops listening or handling future events. */
    stop() {
        this.listening_ = false;
        this.chromeEvent_.removeListener(this.callback_);
    }
}
