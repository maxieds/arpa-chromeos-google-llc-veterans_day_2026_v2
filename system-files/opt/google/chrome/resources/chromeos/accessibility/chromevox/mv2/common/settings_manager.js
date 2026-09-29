// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Class to manage Chrome settings prefs for ChromeVox. Wraps
 * around Settings for the underlying gets and sets. Acts as a translation layer
 * for key names, and for migrating. Will automatically migrate the ChromeVox
 * prefs that are listed in the |CHROMEVOX_PREFS| constant at the bottom of the
 * file. The prefs will move out of chrome.storage.local (used by the
 * LocalStorage class) into the Chrome settings prefs system (used by other
 * Accessibility services).
 *
 */
import { LocalStorage } from '/common/local_storage.js';
import { Settings } from '/common/settings.js';
import { StringUtil } from '/common/string_util.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
export class SettingsManager {
    static instance;
    static CHROMEVOX_PREFS;
    static LIVE_CAPTION_PREF;
    static EVENT_STREAM_FILTERS;
    static async init() {
        if (SettingsManager.instance) {
            throw new Error('SettingsManager.init() should be called at most once in each ' +
                'browser context.');
        }
        SettingsManager.instance = new SettingsManager();
        await Settings.init(SettingsManager.getAllPrefNames());
        SettingsManager.migrateFromChromeStorage_();
    }
    /**
     * Gets Chrome settings pref name from local storage key name.
     * E.g. 'eventStreamFilters' -> 'settings.a11y.chromevox.event_stream_filters'
     * @param localStorageKey Name of a key used in local storage.
     * @return Corresponding name for the Chrome settings pref.
     */
    static getPrefName_(localStorageKey) {
        return 'settings.a11y.chromevox.' +
            StringUtil.camelToSnake(localStorageKey);
    }
    /**
     * Gets all Chrome settings pref names.
     */
    static getAllPrefNames() {
        return SettingsManager.CHROMEVOX_PREFS.map(SettingsManager.getPrefName_)
            .concat([SettingsManager.LIVE_CAPTION_PREF]);
    }
    /**
     * Migrates prefs from chrome.storage.local to Chrome settings prefs.
     */
    static migrateFromChromeStorage_() {
        for (const key of SettingsManager.CHROMEVOX_PREFS) {
            let value = LocalStorage.get(key);
            if (value === undefined) {
                continue;
            }
            // Convert virtualBrailleColumns and virtualBrailleRows to numbers.
            if (['virtualBrailleColumns', 'virtualBrailleRows'].includes(key)) {
                value = parseInt(value, 10);
            }
            const prefName = SettingsManager.getPrefName_(key);
            try {
                Settings.set(prefName, value);
                LocalStorage.remove(key);
            }
            catch {
                console.error('Invalid settings pref name:', prefName);
            }
        }
        // This object starts empty so that we can know if there are any event
        // stream filters left to migrate from LocalStorage.
        let eventStreamFilters = {};
        for (const key of SettingsManager.EVENT_STREAM_FILTERS) {
            const value = LocalStorage.get(key);
            if (value === undefined) {
                continue;
            }
            eventStreamFilters[key] = value;
            LocalStorage.remove(key);
        }
        if (Object.keys(eventStreamFilters).length) {
            // Combine with any event stream filters already in settings prefs.
            eventStreamFilters = {
                ...Settings.get(this.getPrefName_('eventStreamFilters')),
                ...eventStreamFilters,
            };
            Settings.set(this.getPrefName_('eventStreamFilters'), eventStreamFilters);
        }
    }
    static addListenerForKey(key, callback) {
        const pref = SettingsManager.getPrefName_(key);
        Settings.addListener(pref, callback);
    }
    static get(key, isChromeVox = true) {
        let pref = key;
        if (isChromeVox) {
            pref = SettingsManager.getPrefName_(key);
        }
        return Settings.get(pref);
    }
    /**
     * @param key
     * @param type A string (for primitives) or type constructor
     *     (for classes) corresponding to the expected type
     */
    static getTypeChecked(key, type, isChromeVox = true) {
        const value = SettingsManager.get(key, isChromeVox);
        if ((typeof type === 'string') && (typeof value === type)) {
            return value;
        }
        throw new Error('Value in SettingsManager for key "' + key + '" is not a ' + type);
    }
    static getBoolean(key, isChromeVox = true) {
        const value = SettingsManager.getTypeChecked(key, 'boolean', isChromeVox);
        return Boolean(value);
    }
    static getNumber(key) {
        const value = SettingsManager.getTypeChecked(key, 'number');
        if (isNaN(value)) {
            throw new Error('Value in SettingsManager for key "' + key + '" is NaN');
        }
        return Number(value);
    }
    static getString(key) {
        const value = SettingsManager.getTypeChecked(key, 'string');
        return String(value);
    }
    static set(key, value) {
        const pref = SettingsManager.getPrefName_(key);
        Settings.set(pref, value);
    }
    /**
     * Get event stream filters from the event_stream_filter dictionary pref.
     */
    static getEventStreamFilters() {
        return Settings.get(this.getPrefName_('eventStreamFilters'));
    }
    /**
     * Set an event stream filter on the event_stream_filter dictionary pref.
     */
    static setEventStreamFilter(key, value) {
        if (!SettingsManager.EVENT_STREAM_FILTERS.includes(key)) {
            throw new Error('Cannot set unknown event stream filter: ' + key);
        }
        const eventStreamFilters = Settings.get(this.getPrefName_('eventStreamFilters'));
        eventStreamFilters[key] = value;
        Settings.set(this.getPrefName_('eventStreamFilters'), eventStreamFilters);
    }
}
/**
 * List of the prefs used in ChromeVox, including in options page, each stored
 * as a Chrome settings pref.
 * @const {!Array<string>}
 */
SettingsManager.CHROMEVOX_PREFS = [
    'announceDownloadNotifications',
    'announceRichTextAttributes',
    'audioStrategy',
    'autoRead',
    'brailleSideBySide',
    'brailleTable',
    'brailleTable6',
    'brailleTable8',
    'brailleTableType',
    'brailleWordWrap',
    'capitalStrategy',
    'capitalStrategyBackup',
    'enableBrailleLogging',
    'enableEarconLogging',
    'enableEventStreamLogging',
    'enableSpeechLogging',
    'eventStreamFilters',
    'languageSwitching',
    'menuBrailleCommands',
    'numberReadingStyle',
    'preferredBrailleDisplayAddress',
    'punctuationEcho',
    'smartStickyMode',
    'speakTextUnderMouse',
    'usePitchChanges',
    'useVerboseMode',
    'virtualBrailleColumns',
    'virtualBrailleRows',
    'voiceName',
];
/**
 * The preference for when live caption is enabled.
 */
SettingsManager.LIVE_CAPTION_PREF =
    'accessibility.captions.live_caption_enabled';
/**
 * List of event stream filters used on the ChromeVox options page to indicate
 * which events to log, stored together in a Chrome settings dictionary pref.
 * @const {!Array<string>}
 */
SettingsManager.EVENT_STREAM_FILTERS = [
    'activedescendantchanged',
    'alert',
    // TODO(crbug.com/1464633) Fully remove ariaAttributeChangedDeprecated
    // starting in 122, because although it was removed in 118, it is still
    // present in earlier versions of LaCros.
    'ariaAttributeChangedDeprecated',
    'autocorrectionOccured',
    'blur',
    'checkedStateChanged',
    'childrenChanged',
    'clicked',
    'documentSelectionChanged',
    'documentTitleChanged',
    'expandedChanged',
    'focus',
    'focusContextDeprecated',
    'hide',
    'hitTestResult',
    'hover',
    'imageFrameUpdated',
    'invalidStatusChanged',
    'layoutComplete',
    'liveRegionChanged',
    'liveRegionCreated',
    'loadComplete',
    'locationChanged',
    'mediaStartedPlaying',
    'mediaStoppedPlaying',
    'menuEnd',
    'menuItemSelected',
    'menuListValueChangedDeprecated',
    'menuPopupEnd',
    'menuPopupStart',
    'menuStart',
    'mouseCanceled',
    'mouseDragged',
    'mouseMoved',
    'mousePressed',
    'mouseReleased',
    'rowCollapsed',
    'rowCountChanged',
    'rowExpanded',
    'scrollPositionChanged',
    'scrolledToAnchor',
    'selectedChildrenChanged',
    'selection',
    'selectionAdd',
    'selectionRemove',
    'show',
    'stateChanged',
    'textChanged',
    'textSelectionChanged',
    'treeChanged',
    'valueInTextFieldChanged',
];
TestImportManager.exportForTesting(SettingsManager);
