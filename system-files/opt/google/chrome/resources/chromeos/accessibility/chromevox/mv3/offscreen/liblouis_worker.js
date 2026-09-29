// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { BridgeHelper } from '/common/bridge_helper.js';
import { BackgroundBridge } from '../common/background_bridge.js';
import { BridgeConstants } from '../common/bridge_constants.js';
const TARGET = BridgeConstants.Offscreen.TARGET;
const Action = BridgeConstants.Offscreen.Action;
export class LibLouisWorker {
    worker_ = null;
    static instance;
    constructor() {
        BridgeHelper.registerHandler(TARGET, Action.LIBLOUIS_START_WORKER, (wasmPath) => this.startWorker_(wasmPath));
        BridgeHelper.registerHandler(TARGET, Action.LIBLOUIS_RPC, (messageJson) => this.postMessage_(messageJson));
    }
    postMessage_(messageJson) {
        if (!this.worker_) {
            return { message: 'Cannot send RPC: liblouis worker not started.' };
        }
        this.worker_.postMessage(messageJson);
        return {};
    }
    static init() {
        if (LibLouisWorker.instance) {
            throw 'Error: trying to create two instances of singleton ' +
                'LibLouisWorker.';
        }
        LibLouisWorker.instance = new LibLouisWorker();
    }
    startWorker_(wasmPath) {
        this.worker_ = new Worker(wasmPath);
        this.worker_.addEventListener('message', e => this.onInstanceMessage_(e), false /* useCapture */);
        this.worker_.addEventListener('error', e => this.onInstanceError_(e), false /* useCapture */);
    }
    onInstanceMessage_(e) {
        BackgroundBridge.LibLouis.message(e.data);
    }
    onInstanceError_(e) {
        BackgroundBridge.LibLouis.error(e.message);
    }
}
