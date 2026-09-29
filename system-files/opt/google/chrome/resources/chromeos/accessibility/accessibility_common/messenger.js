// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { OffscreenCommandType } from './offscreen_command_type.js';
/*
 * Helper to wrap messaging api between offscreen doc and service worker.
 */
export class Messenger {
    static OFFSCREEN_DOCUMENT_PATH = 'accessibility_common/offscreen.html';
    static instance;
    context_;
    // A promise that tracks when offscreen doc is ready.
    offscreenDocumentPromise_ = null;
    // Resolves the above promise when received 'READY' from offscreen doc.
    setOffscreenDocumentReady_;
    // Whether a `chrome.offscreen.createDocument` is in progress.
    offscreenDocumentCreating_ = false;
    // Tracks registered message handlers.
    registry_;
    // Tracks resolvers for waitForHandled.
    handlerResolvers_ = new Map();
    constructor(context) {
        this.context_ = context;
        this.registry_ = new Map();
        chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => this.handleMessage_(message, sendResponse));
    }
    static async init(context) {
        if (Messenger.instance) {
            throw 'Error: trying to create two instances of singleton Messenger.';
        }
        Messenger.instance = new Messenger(context);
        if (context === Messenger.Context.OFFSCREEN) {
            Messenger.send(OffscreenCommandType.MESSENGER_SW_READY);
            return;
        }
        if (context === Messenger.Context.SERVICE_WORKER) {
            Messenger.registerHandler(OffscreenCommandType.MESSENGER_SW_READY, () => {
                Messenger.instance.onOffscreenDocumentReady_();
            });
            return Messenger.instance.ensureOffscreenDocument_();
        }
    }
    /*
     * Ensures offscreen document is created. Returns a Promise that resolves when
     * offscreen document is created. This method should handle cases of service
     * worker restart and offscreen doc re-creation.
     */
    async ensureOffscreenDocument_() {
        const offscreenUrl = chrome.runtime.getURL(Messenger.OFFSCREEN_DOCUMENT_PATH);
        const existingContexts = await chrome.runtime.getContexts({
            contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
            documentUrls: [offscreenUrl]
        });
        if (existingContexts.length > 0) {
            // Offscreen document is created in previous service worker runs.
            if (!this.offscreenDocumentPromise_) {
                this.offscreenDocumentPromise_ = Promise.resolve();
            }
        }
        else if (!this.offscreenDocumentCreating_) {
            // Otherwise, create one if there is no pending creation.
            this.offscreenDocumentCreating_ = true;
            this.offscreenDocumentPromise_ = new Promise(resolve => {
                this.setOffscreenDocumentReady_ = resolve;
            });
            chrome.offscreen
                .createDocument({
                url: offscreenUrl,
                reasons: [chrome.offscreen.Reason.WORKERS],
                justification: 'Audio web API and web assembly execution',
            })
                .catch(error => {
                console.error('Failed to create offscreen document: ', error);
                this.offscreenDocumentCreating_ = false;
            });
        }
        return this.offscreenDocumentPromise_;
    }
    /**
     * Handles `MESSENGER_SW_READY` message from offscreen document.
     */
    onOffscreenDocumentReady_() {
        this.offscreenDocumentCreating_ = false;
        this.setOffscreenDocumentReady_();
    }
    doSend_(command, data) {
        return chrome.runtime.sendMessage(
        /*extensionId=*/ undefined, 
        /*message=*/ Object.assign({ command }, data));
    }
    // Sends a command message to the other side. Returns a promise that resolves
    // if the other side sends back a reply.
    static send(command, data = {}) {
        if (Messenger.instance.context_ == Messenger.Context.OFFSCREEN) {
            return Messenger.instance.doSend_(command, data);
        }
        return Messenger.instance.ensureOffscreenDocument_().then(() => {
            return Messenger.instance.doSend_(command, data);
        });
    }
    // Registers a command handler.
    static registerHandler(command, handler) {
        Messenger.instance.registry_.set(command, handler);
    }
    /**
     * Test-only helper that returns a promise that resolves after the given
     * command handler has run.
     */
    static waitForHandled(command) {
        return new Promise(resolve => {
            const resolvers = Messenger.instance.handlerResolvers_.get(command);
            if (resolvers) {
                resolvers.push(resolve);
            }
            else {
                Messenger.instance.handlerResolvers_.set(command, [resolve]);
            }
        });
    }
    // Gets the handler for a given command.
    static getHandler(command) {
        return Messenger.instance.registry_.get(command);
    }
    // Handles the command message received from the other parts of the extension.
    // For example, when running in the service worker, this handles messages from
    // the offscreen document. And when running in the offscreen document, it
    // handles messages from the service worker.
    handleMessage_(message, sendResponse) {
        const command = message['command'];
        const result = Messenger.getHandler(command)?.(message);
        const resolvers = this.handlerResolvers_.get(command);
        if (resolvers) {
            for (const resolver of resolvers) {
                resolver();
            }
            this.handlerResolvers_.delete(command);
        }
        // If handler is async, return true to allow async sendResponse.
        if (result instanceof Promise) {
            result.then(sendResponse).catch(sendResponse);
            return true;
        }
        // Otherwise return false.
        return false;
    }
}
(function (Messenger) {
    // The context of where `Messenger` runs.
    let Context;
    (function (Context) {
        Context["SERVICE_WORKER"] = "serviceWorker";
        Context["OFFSCREEN"] = "offscreen";
    })(Context = Messenger.Context || (Messenger.Context = {}));
})(Messenger || (Messenger = {}));
TestImportManager.exportForTesting(Messenger);
