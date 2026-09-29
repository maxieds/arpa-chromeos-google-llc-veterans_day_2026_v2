// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview ChromeVox log page.
 */
import { BackgroundBridge } from '../common/background_bridge.js';
import { LogType } from '../common/log_types.js';
/** Class to manage the log page. */
export class LogPage {
    static instance;
    constructor() {
        this.initPage_();
    }
    static async init() {
        if (LogPage.instance) {
            throw new Error('LogPage can only be initiated once.');
        }
        LogPage.instance = new LogPage();
        await LogPage.instance.update();
    }
    addLogToPage_(log) {
        const div = document.getElementById(IdName.LIST);
        const p = document.createElement(ElementName.PARAGRAPH);
        const typeName = document.createElement(ElementName.SPAN);
        typeName.textContent = log.logType;
        typeName.className = ClassName.TYPE;
        p.appendChild(typeName);
        const timeStamp = document.createElement(ElementName.SPAN);
        timeStamp.textContent = this.formatTimeStamp_(log.date);
        timeStamp.className = ClassName.TIME;
        p.appendChild(timeStamp);
        /** Add hide tree button when logType is tree. */
        if (log.logType === LogType.TREE) {
            const toggle = document.createElement(ElementName.LABEL);
            const toggleCheckbox = document.createElement(ElementName.INPUT);
            toggleCheckbox.type = InputType.CHECKBOX;
            toggleCheckbox.checked = true;
            toggleCheckbox.onclick = event => textWrapper.hidden =
                !event.target.checked;
            const toggleText = document.createElement(ElementName.SPAN);
            toggleText.textContent = 'show tree';
            toggle.appendChild(toggleCheckbox);
            toggle.appendChild(toggleText);
            p.appendChild(toggle);
        }
        /** textWrapper should be in block scope, not function scope. */
        const textWrapper = document.createElement(ElementName.PRE);
        textWrapper.textContent = log.value;
        textWrapper.className = ClassName.TEXT;
        p.appendChild(textWrapper);
        // TODO(b/314203187): Not null asserted, check that this is correct.
        div.appendChild(p);
    }
    checkboxId_(type) {
        return type + 'Filter';
    }
    createFilterCheckbox_(type, checked) {
        const label = document.createElement(ElementName.LABEL);
        const input = document.createElement(ElementName.INPUT);
        input.id = this.checkboxId_(type);
        input.type = InputType.CHECKBOX;
        input.classList.add(ClassName.FILTER);
        input.checked = checked;
        input.addEventListener(EventType.CLICK, () => this.updateUrlParams_());
        label.appendChild(input);
        const span = document.createElement(ElementName.SPAN);
        span.textContent = type;
        label.appendChild(span);
        // TODO(b/314203187): Not null asserted, check that this is correct.
        document.getElementById(IdName.FILTER).appendChild(label);
    }
    getDownloadFileName_() {
        const date = new Date();
        return [
            'chromevox_logpage',
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
        ].join('_') +
            '.txt';
    }
    initPage_() {
        const params = new URLSearchParams(location.search);
        for (const type of Object.values(LogType)) {
            const enabled = (params.get(type) === String(true) || params.get(type) === null);
            this.createFilterCheckbox_(type, enabled);
        }
        // TODO(b/314203187): Not null asserted, check that this is correct.
        const clearLogButton = document.getElementById(IdName.CLEAR);
        clearLogButton.onclick = () => this.onClear_();
        const saveLogButton = document.getElementById(IdName.SAVE);
        saveLogButton.onclick = event => this.onSave_(event);
    }
    isEnabled_(type) {
        const element = document.getElementById(this.checkboxId_(type));
        return element.checked;
    }
    logToString_(log) {
        const logText = [];
        // TODO(b/314203187): Not null asserted, check that this is correct.
        logText.push(log.querySelector(`.${ClassName.TYPE}`).textContent);
        logText.push(log.querySelector(`.${ClassName.TIME}`).textContent);
        logText.push(log.querySelector(`.${ClassName.TEXT}`).textContent);
        return logText.join(' ');
    }
    async onClear_() {
        await BackgroundBridge.LogStore.clearLog();
        location.reload();
    }
    /**
     * When saveLog button is clicked this function runs.
     * Save the current log appeared in the page as a plain text.
     */
    onSave_(_event) {
        let outputText = '';
        const logs = document.querySelectorAll(`#${IdName.LIST} ${ElementName.PARAGRAPH}`);
        for (const log of logs) {
            outputText += this.logToString_(log) + '\n';
        }
        const a = document.createElement(ElementName.ANCHOR);
        a.download = this.getDownloadFileName_();
        a.href = 'data:text/plain; charset=utf-8,' + encodeURI(outputText);
        a.click();
    }
    /** Update the logs. */
    async update() {
        const logs = await BackgroundBridge.LogStore.getLogs();
        if (!logs) {
            return;
        }
        for (const log of logs) {
            if (this.isEnabled_(log.logType)) {
                this.addLogToPage_(log);
            }
        }
    }
    /** Update the URL parameter based on the checkboxes. */
    updateUrlParams_() {
        const urlParams = [];
        for (const type of Object.values(LogType)) {
            urlParams.push(type + 'Filter=' + LogPage.instance.isEnabled_(type));
        }
        location.search = '?' + urlParams.join('&');
    }
    /**
     * Format time stamp.
     * In this log, events are dispatched many times in a short time, so
     * milliseconds order time stamp is required.
     */
    formatTimeStamp_(dateStr) {
        const date = new Date(dateStr);
        let time = date.getTime();
        time -= date.getTimezoneOffset() * 1000 * 60;
        let timeStr = ('00' + Math.floor(time / 1000 / 60 / 60) % 24).slice(-2) + ':';
        timeStr += ('00' + Math.floor(time / 1000 / 60) % 60).slice(-2) + ':';
        timeStr += ('00' + Math.floor(time / 1000) % 60).slice(-2) + '.';
        timeStr += ('000' + time % 1000).slice(-3);
        return timeStr;
    }
}
// Local to module.
var ClassName;
(function (ClassName) {
    ClassName["FILTER"] = "log-filter";
    ClassName["TEXT"] = "log-text";
    ClassName["TIME"] = "log-time-tag";
    ClassName["TYPE"] = "log-type-tag";
})(ClassName || (ClassName = {}));
var ElementName;
(function (ElementName) {
    ElementName["ANCHOR"] = "a";
    ElementName["INPUT"] = "input";
    ElementName["LABEL"] = "label";
    ElementName["PARAGRAPH"] = "p";
    ElementName["PRE"] = "pre";
    ElementName["SPAN"] = "span";
})(ElementName || (ElementName = {}));
var EventType;
(function (EventType) {
    EventType["CLICK"] = "click";
})(EventType || (EventType = {}));
var IdName;
(function (IdName) {
    IdName["CLEAR"] = "clearLog";
    IdName["FILTER"] = "logFilters";
    IdName["LIST"] = "logList";
    IdName["SAVE"] = "saveLog";
})(IdName || (IdName = {}));
var InputType;
(function (InputType) {
    InputType["CHECKBOX"] = "checkbox";
})(InputType || (InputType = {}));
