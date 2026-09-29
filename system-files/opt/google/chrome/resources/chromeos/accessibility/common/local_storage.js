// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Class to handle accessing/storing/caching local storage data.
 */
import { TestImportManager } from './testing/test_import_manager.js';
export class LocalStorage {
    values_ = null;
    sessionValues_ = null;
    keyCallbacks_ = {};
    static instance;
    constructor(onInit) {
        this.getLocalAndSessionValues(onInit);
        chrome.storage.local.onChanged.addListener((updates) => this.update_(updates));
    }
    // ========== Static methods ==========
    static async init() {
        if (LocalStorage.instance) {
            throw new Error('LocalStorage.init() should be called at most once in each ' +
                'browser context.');
        }
        LocalStorage.instance =
            await new Promise(resolve => new LocalStorage(resolve));
        LocalStorage.migrateFromLocalStorage_();
    }
    static addListenerForKey(key, callback) {
        // TODO(b/314203187): Not nulls asserted, check these to make sure they are
        // correct.
        if (!LocalStorage.instance.keyCallbacks_[key]) {
            LocalStorage.instance.keyCallbacks_[key] = [];
        }
        if (callback) {
            LocalStorage.instance.keyCallbacks_[key].push(callback);
        }
    }
    static get(key, defaultValue = undefined) {
        LocalStorage.assertReady_();
        const value = LocalStorage.instance.values_[key];
        if (value !== undefined) {
            return value;
        }
        return defaultValue;
    }
    static getTypeChecked(key, type, defaultValue) {
        const value = LocalStorage.get(key, defaultValue);
        if (typeof value === type) {
            return value;
        }
        throw new Error('Value in LocalStorage for key "' + key + '" is not a ' + type);
    }
    static getBoolean(key, defaultValue) {
        const value = LocalStorage.getTypeChecked(key, 'boolean', defaultValue);
        return Boolean(value);
    }
    static getNumber(key, defaultValue) {
        const value = LocalStorage.getTypeChecked(key, 'number', defaultValue);
        if (isNaN(value)) {
            throw new Error('Value in LocalStorage for key "' + key + '" is NaN');
        }
        return Number(value);
    }
    static getString(key, defaultValue) {
        const value = LocalStorage.getTypeChecked(key, 'string', defaultValue);
        return String(value);
    }
    static remove(key) {
        LocalStorage.assertReady_();
        chrome.storage.local.remove(key);
        delete LocalStorage.instance.values_[key];
    }
    static set(key, val) {
        LocalStorage.assertReady_();
        chrome.storage.local.set({ [key]: val });
        LocalStorage.instance.values_[key] = val;
    }
    static toggle(key) {
        LocalStorage.assertReady_();
        const val = LocalStorage.get(key);
        if (typeof val !== 'boolean') {
            throw new Error('Cannot toggle value of non-boolean setting');
        }
        LocalStorage.set(key, !val);
    }
    // ========= Session storage ==========
    static getInSession(key, defaultValue = undefined) {
        LocalStorage.assertReady_();
        const value = LocalStorage.instance.sessionValues_[key];
        if (value !== undefined) {
            return value;
        }
        return defaultValue;
    }
    static setInSession(key, val) {
        LocalStorage.assertReady_();
        chrome.storage.session.set({ [key]: val });
        LocalStorage.instance.sessionValues_[key] = val;
    }
    // ========= Private Methods ==========
    async getLocalAndSessionValues(onInit) {
        const [values, sessionValues] = await Promise.all([chrome.storage.local.get(), chrome.storage.session.get()]);
        this.values_ = values;
        this.sessionValues_ = sessionValues;
        onInit(this);
    }
    update_(updates) {
        for (const key in updates) {
            // TODO(b/314203187): Not null asserted, check these to make sure they are
            // correct.
            this.values_[key] = updates[key].newValue;
            if (this.keyCallbacks_[key]) {
                this.keyCallbacks_[key].forEach(callback => callback(updates[key].newValue));
            }
        }
    }
    static migrateFromLocalStorage_() {
        if (!globalThis.localStorage) {
            return;
        }
        // Save the keys, because otherwise the values are shifting under us as we
        // iterate.
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        for (const key of keys) {
            let val = localStorage[key];
            delete localStorage[key];
            if (val === String(true)) {
                val = true;
            }
            else if (val === String(false)) {
                val = false;
            }
            else if (/^\d+$/.test(val)) {
                // A string that with at least one digit and no other characters is an
                // integer.
                val = parseInt(val, 10);
            }
            else if (/^[\d]+[.][\d]+$/.test(val)) {
                // A string with at least one digit, followed by a dot, followed by at
                // least one digit is a floating point number.
                //
                // When converting floats to strings, v8 adds the leading 0 if there
                // were no digits before the decimal. E.g. String(.2) === "0.2"
                //
                // Similarly, integer values followed by a dot and any number of zeroes
                // are stored without a decimal and will be handled by the above case.
                // E.g. String(1.0) === "1"
                val = parseFloat(val);
            }
            else if (/^{.*}$/.test(val) || /^\[.*]$/.test(val)) {
                // If a string begins and ends with curly or square brackets, try to
                // convert it to an object/array. JSON.parse() will throw an error if
                // the string is not valid JSON syntax. In that case, the variable value
                // will remain unchanged (with a type of 'string').
                try {
                    val = JSON.parse(val);
                }
                catch (syntaxError) {
                }
            }
            // We cannot call LocalStorage.set() because assertReady will fail.
            chrome.storage.local.set({ [key]: val });
            LocalStorage.instance.values_[key] = val;
        }
    }
    static assertReady_() {
        if (!LocalStorage.instance || !LocalStorage.instance.values_) {
            throw new Error('LocalStorage should not be accessed until initialization is ' +
                'complete.');
        }
    }
}
TestImportManager.exportForTesting(LocalStorage);
