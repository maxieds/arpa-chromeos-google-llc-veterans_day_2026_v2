// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview A TTS engine that writes to globalThis.console.
 */
import { SpeechLog } from '../common/log_types.js';
import { TtsCategory } from '../common/tts_types.js';
import { LogStore } from './logging/log_store.js';
import { ChromeVoxPrefs } from './prefs.js';
export class ConsoleTts {
    /**
     * True if the console TTS is enabled by the user.
     */
    enabled_;
    constructor() {
        this.enabled_ = ChromeVoxPrefs.instance?.getPrefs()['enableSpeechLogging'];
    }
    speak(textString, queueMode, properties) {
        if (this.enabled_ && globalThis.console) {
            const category = properties?.category ?? TtsCategory.NAV;
            const speechLog = new SpeechLog(textString, queueMode, category);
            LogStore.instance.writeLog(speechLog);
            console.log(speechLog.toString());
        }
        return this;
    }
    isSpeaking() {
        return false;
    }
    stop() {
        if (this.enabled_) {
            console.log('Stop');
        }
    }
    // @ts-ignore Unread value.
    addCapturingEventListener(_listener) { }
    // @ts-ignore Unread value.
    removeCapturingEventListener(_listener) { }
    // @ts-ignore Unread value.
    increaseOrDecreaseProperty(_propertyName, _increase) { }
    // @ts-ignore Unread value.
    setProperty(_propertyName, _value) { }
    // @ts-ignore Unread value.
    propertyToPercentage(_property) {
        return null;
    }
    /**
     * Sets the enabled bit.
     * @param enabled The new enabled bit.
     */
    setEnabled(enabled) {
        this.enabled_ = enabled;
    }
    // @ts-ignore Unread value.
    getDefaultProperty(_property) {
        return 0;
    }
    // @ts-ignore Unread value.
    toggleSpeechOnOrOff() {
        return true;
    }
}
