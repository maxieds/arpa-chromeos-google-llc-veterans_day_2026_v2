// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview A collection of functions and behaviors helpful for message
 * passing between renderers.
 */
import { TestImportManager } from './testing/test_import_manager.js';
export class BridgeHelper {
    /**
     * This function should only be used by Bridges (e.g. BackgroundBridge,
     * PanelBridge) and not called directly by other classes.
     *
     * @param target The name of the class that will handle this request.
     * @param action The name of the intended function or, if not a direct method of the class,
     *     a pseudo-function name.
     *
     * Any arguments to be passed through can be appended to the function. They
     *     must be convertible to JSON objects for message passing - i.e., no
     *     functions or type information will be retained, and no direct
     *     modification of the original context is possible.
     *
     * @return A promise, that resolves when the handler function has finished and
     *     contains any value returned by the handler.
     */
    static sendMessage(target, action, ...args) {
        return new Promise(resolve => chrome.runtime.sendMessage(undefined, { target, action, args }, undefined, resolve));
    }
    static clearAllHandlersForTarget(target) {
        handlers[target] = {};
    }
    /**
     * @param target The name of the class that is registering the handler.
     * @param action The name of the intended function or, if not a direct method
     *     of the class, a pseudo-function name.
     * @param handler A function that performs the indicated action. It may
     *     optionally take parameters, and may have an optional return value
     *     that will be forwarded to the requestor.
     */
    static registerHandler(target, action, handler) {
        if (!target || !action) {
            return;
        }
        if (!handlers[target]) {
            handlers[target] = {};
        }
        if (handlers[target][action]) {
            throw new Error(`Re-assigning handlers for ${target}.${action} is not permitted`);
        }
        handlers[target][action] = handler;
    }
}
// Local to module.
const handlers = {};
chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    const targetHandlers = handlers[message.target];
    if (!targetHandlers || !targetHandlers[message.action]) {
        return false;
    }
    const handler = targetHandlers[message.action];
    Promise.resolve(handler(...message.args)).then(respond);
    return true; /** Wait for asynchronous response. */
});
TestImportManager.exportForTesting(BridgeHelper);
