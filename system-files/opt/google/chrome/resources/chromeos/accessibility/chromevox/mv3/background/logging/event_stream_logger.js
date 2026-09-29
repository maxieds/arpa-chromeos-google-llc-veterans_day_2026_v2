// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Creates event stream logger.
 */
import { AsyncUtil } from '/common/async_util.js';
import { BridgeHelper } from '/common/bridge_helper.js';
import { LocalStorage } from '/common/local_storage.js';
import { BridgeConstants } from '../../common/bridge_constants.js';
import { EventLog } from '../../common/log_types.js';
import { SettingsManager } from '../../common/settings_manager.js';
import { LogStore } from './log_store.js';
var EventType = chrome.automation.EventType;
const Action = BridgeConstants.EventStreamLogger.Action;
const TARGET = BridgeConstants.EventStreamLogger.TARGET;
export class EventStreamLogger {
    listener_ = (event) => this.onEvent_(event);
    node_;
    static instance;
    constructor(node) {
        this.node_ = node;
    }
    /** Initializes global state for EventStreamLogger. */
    static async init() {
        const desktop = await AsyncUtil.getDesktop();
        EventStreamLogger.instance = new EventStreamLogger(desktop);
        EventStreamLogger.instance.updateAllFilters(SettingsManager.getBoolean('enableEventStreamLogging'));
        BridgeHelper.registerHandler(TARGET, Action.NOTIFY_EVENT_STREAM_FILTER_CHANGED, (name, enabled) => EventStreamLogger.instance.onFilterChanged_(name, enabled));
    }
    updateAllFilters(checked) {
        for (const type of Object.values(EventType)) {
            if (LocalStorage.get(type)) {
                this.onFilterChanged_(type, checked);
            }
        }
    }
    // ============ Private methods =============
    /** Adds onEvent_ to this handler. */
    addListener_(eventType) {
        this.node_.addEventListener(eventType, this.listener_, false);
    }
    /** Removes onEvent_ from this handler. */
    removeListener_(eventType) {
        this.node_.removeEventListener(eventType, this.listener_, false);
    }
    onEvent_(evt) {
        const eventLog = new EventLog(evt);
        LogStore.instance.writeLog(eventLog);
        console.log(eventLog.toString());
    }
    onFilterChanged_(eventType, checked) {
        if (checked) {
            this.addListener_(eventType);
        }
        else {
            this.removeListener_(eventType);
        }
    }
}
