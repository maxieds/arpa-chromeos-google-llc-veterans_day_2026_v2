// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview JavaScript shim for the liblouis Web Assembly wrapper.
 */
import { BridgeHelper } from '/common/bridge_helper.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { BridgeConstants } from '../../common/bridge_constants.js';
import { OffscreenBridge } from '../../common/offscreen_bridge.js';
const TARGET = BridgeConstants.LibLouis.TARGET;
const Action = BridgeConstants.LibLouis.Action;
/** Encapsulates a liblouis Web Assembly instance in the page. */
export class LibLouis {
    /** Path to .wasm file for the module. */
    wasmPath_;
    /** Whether liblouis is loaded. */
    isLoaded_ = false;
    /** Pending RPC callbacks. Maps from message IDs to callbacks. */
    pendingRpcCallbacks_ = {};
    /** Next message ID to be used. Incremented with each sent message. */
    nextMessageId_ = 1;
    /**
     * @param wasmPath Path to .wasm file for the module.
     * @param tablesDir Path to tables directory.
     */
    constructor(wasmPath, _tablesDir, loadCallback) {
        this.wasmPath_ = wasmPath;
        BridgeHelper.registerHandler(TARGET, Action.MESSAGE, (data) => this.onInstanceMessage_(data));
        BridgeHelper.registerHandler(TARGET, Action.ERROR, (message) => this.onInstanceError_(message));
        this.loadOrReload_(loadCallback);
    }
    isLoaded() {
        return this.isLoaded_;
    }
    /**
     * Returns a translator for the desired table, asynchronously.
     * This object must be attached to a document when requesting a translator.
     * @param {string} tableNames Comma separated list of braille table names for
     *     liblouis.
     * @return {!Promise<LibLouis.Translator>} the translator, or {@code null}
     *     on failure.
     */
    async getTranslator(tableNames) {
        return new Promise(resolve => {
            if (!this.isLoaded_) {
                // TODO: save last callback.
                resolve(null /* translator */);
                return;
            }
            this.rpc('CheckTable', { 'table_names': tableNames }, (reply) => {
                if (reply['success']) {
                    const translator = new LibLouis.Translator(this, tableNames);
                    resolve(translator);
                }
                else {
                    resolve(null /* translator */);
                }
            });
        });
    }
    /**
     * Dispatches a message to the remote end and returns the reply
     * asynchronously. A message ID will be automatically assigned (as a
     * side-effect).
     * @param command Command name to be sent.
     * @param message JSONable message to be sent.
     * @param callback Callback to receive the reply.
     */
    async rpc(command, message, callback) {
        const messageId = '' + this.nextMessageId_++;
        message['message_id'] = messageId;
        message['command'] = command;
        const json = JSON.stringify(message);
        if (LibLouis.DEBUG) {
            globalThis.console.debug('RPC -> ' + json);
        }
        this.pendingRpcCallbacks_[messageId] = callback;
        const error = await OffscreenBridge.libLouisRPC(json);
        if (error.message) {
            throw Error(error.message);
        }
    }
    /** Invoked when the Web Assembly instance successfully loads. */
    onInstanceLoad_() { }
    /** Invoked when the Web Assembly instance fails to load. */
    onInstanceError_(message) {
        globalThis.console.error('Error in liblouis ' + message);
        this.loadOrReload_();
    }
    /** Invoked when the Web Assembly instance posts a message. */
    onInstanceMessage_(data) {
        if (LibLouis.DEBUG) {
            globalThis.console.debug('RPC <- ' + data);
        }
        const message = /** @type {!Object} */ (JSON.parse(data));
        const messageId = message['in_reply_to'];
        if (messageId === undefined) {
            globalThis.console.warn('liblouis Web Assembly module sent message with no ID', message);
            return;
        }
        if (message['error'] !== undefined) {
            globalThis.console.error('liblouis Web Assembly error', message['error']);
        }
        const callback = this.pendingRpcCallbacks_[messageId];
        if (callback !== undefined) {
            delete this.pendingRpcCallbacks_[messageId];
            callback(message);
        }
    }
    loadOrReload_(loadCallback) {
        OffscreenBridge.libLouisStartWorker(this.wasmPath_);
        this.rpc('load', {}, () => {
            this.isLoaded_ = true;
            loadCallback && loadCallback(this);
            this.onInstanceLoad_();
        });
    }
}
(function (LibLouis) {
    /**
     * Constants taken from liblouis.h.
     * Controls braille indicator insertion during translation.
     */
    let FormType;
    (function (FormType) {
        FormType[FormType["PLAIN_TEXT"] = 0] = "PLAIN_TEXT";
        FormType[FormType["ITALIC"] = 1] = "ITALIC";
        FormType[FormType["UNDERLINE"] = 2] = "UNDERLINE";
        FormType[FormType["BOLD"] = 4] = "BOLD";
        FormType[FormType["COMPUTER_BRAILLE"] = 8] = "COMPUTER_BRAILLE";
    })(FormType = LibLouis.FormType || (LibLouis.FormType = {}));
    /** Set to {@code true} to enable debug logging of RPC messages. */
    LibLouis.DEBUG = false;
    /** Braille translator which uses a Web Assembly instance of liblouis. */
    class Translator {
        instance_;
        tableNames_;
        /**
         * @param instance The instance wrapper.
         * @param tableNames Comma separated list of Table names to be passed to
         *     liblouis.
         */
        constructor(instance, tableNames) {
            this.instance_ = instance;
            this.tableNames_ = tableNames;
        }
        translate(text, formTypeMap, callback) {
            if (!this.instance_.isLoaded()) {
                callback(null /*cells*/, null /*textToBraille*/, null /*brailleToText*/);
                return;
            }
            // TODO(https://crbug.com/1340093): the upstream LibLouis translations for
            // form type output is broken.
            formTypeMap = 0;
            const message = {
                'table_names': this.tableNames_,
                text,
                form_type_map: formTypeMap,
            };
            this.instance_.rpc('Translate', message, (reply) => {
                let cells = null;
                let textToBraille = null;
                let brailleToText = null;
                if (reply['success'] && typeof reply['cells'] === 'string') {
                    cells = Translator.decodeHexString_(reply['cells']);
                    if (reply['text_to_braille'] !== undefined) {
                        textToBraille = reply['text_to_braille'];
                    }
                    if (reply['braille_to_text'] !== undefined) {
                        brailleToText = reply['braille_to_text'];
                    }
                }
                else if (text.length > 0) {
                    // TODO(plundblad): The nacl wrapper currently returns an error
                    // when translating an empty string.  Address that and always log
                    // here.
                    console.error('Braille translation error for ' + JSON.stringify(message));
                }
                callback(cells, textToBraille, brailleToText);
            });
        }
        backTranslate(cells, callback) {
            if (!this.instance_.isLoaded()) {
                callback(null /*text*/);
                return;
            }
            if (cells.byteLength === 0) {
                // liblouis doesn't handle empty input, so handle that trivially
                // here.
                callback('');
                return;
            }
            const message = {
                'table_names': this.tableNames_,
                'cells': Translator.encodeHexString_(cells),
            };
            this.instance_.rpc('BackTranslate', message, (reply) => {
                if (!reply['success'] || typeof reply['text'] !== 'string') {
                    callback(null /* text */);
                    return;
                }
                let text = reply['text'];
                // TODO(https://crbug.com/1340087): LibLouis has bugs in
                // backtranslation.
                const view = new Uint8Array(cells);
                if (view.length > 0 && view[view.length - 1] === 0 &&
                    !text.endsWith(' ')) {
                    // LibLouis omits spaces for some backtranslated contractions even
                    // though it is passed a blank cell. This is a workaround until
                    // LibLouis fixes this issue.
                    text += ' ';
                }
                callback(text);
            });
        }
        /**
         * Decodes a hexadecimal string to an {@code ArrayBuffer}.
         * @param hex Hexadecimal string.
         * @return Decoded binary data.
         */
        static decodeHexString_(hex) {
            if (!/^([0-9a-f]{2})*$/i.test(hex)) {
                throw Error('invalid hexadecimal string');
            }
            const array = new Uint8Array(hex.length / 2);
            let idx = 0;
            for (let i = 0; i < hex.length; i += 2) {
                array[idx++] = parseInt(hex.substring(i, i + 2), 16);
            }
            return array.buffer;
        }
        /**
         * Encodes an {@code ArrayBuffer} in hexadecimal.
         * @param arrayBuffer Binary data.
         * @return Hexadecimal string.
         */
        static encodeHexString_(arrayBuffer) {
            const array = new Uint8Array(arrayBuffer);
            let hex = '';
            for (const b of array) {
                hex += (b < 0x10 ? '0' : '') + b.toString(16);
            }
            return hex;
        }
    }
    LibLouis.Translator = Translator;
})(LibLouis || (LibLouis = {}));
TestImportManager.exportForTesting(LibLouis);
