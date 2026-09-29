// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Braille command definitions.
 * These types are adapted from Chrome's private braille API.
 * They can be found in the Chrome source repo at:
 * src/chrome/common/extensions/api/braille_display_private.webidl
 * We define them here since they don't actually exist as bindings under
 * chrome.brailleDisplayPrivate.*.
 */
import { KeyCode } from '/common/key_code.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
// TODO(b/326623426): Move DomKeyCode to common/.
var DomKeyCode;
(function (DomKeyCode) {
    DomKeyCode["ARROW_DOWN"] = "ArrowDown";
    DomKeyCode["ARROW_LEFT"] = "ArrowLeft";
    DomKeyCode["ARROW_RIGHT"] = "ArrowRight";
    DomKeyCode["ARROW_UP"] = "ArrowUp";
    DomKeyCode["AUDIO_VOLUME_DOWN"] = "AudioVolumeDown";
    DomKeyCode["AUDIO_VOLUME_UP"] = "AudioVolumeUp";
    DomKeyCode["BACKSPACE"] = "Backspace";
    DomKeyCode["DELETE"] = "Delete";
    DomKeyCode["END"] = "End";
    DomKeyCode["ENTER"] = "Enter";
    DomKeyCode["ESCAPE"] = "Escape";
    DomKeyCode["HOME"] = "Home";
    DomKeyCode["INSERT"] = "Insert";
    DomKeyCode["PAGE_DOWN"] = "PageDown";
    DomKeyCode["PAGE_UP"] = "PageUp";
    DomKeyCode["TAB"] = "Tab";
})(DomKeyCode || (DomKeyCode = {}));
/** The set of commands sent from a braille display. */
export var BrailleKeyCommand = chrome.brailleDisplayPrivate.KeyCommand;
export var BrailleKeyEvent;
(function (BrailleKeyEvent) {
    /**
     * Returns the numeric key code for a DOM level 4 key code string.
     * NOTE: Only the key codes produced by the brailleDisplayPrivate API are
     * supported.
     * @param code DOM level 4 key code.
     * @return The numeric key code, or {@code undefined} if unknown.
     */
    function keyCodeToLegacyCode(code) {
        return BrailleKeyEvent.legacyKeyCodeMap[code];
    }
    BrailleKeyEvent.keyCodeToLegacyCode = keyCodeToLegacyCode;
    /**
     * Returns a char value appropriate for a synthezised key event for a given
     * key code.
     * @param keyCode The DOM level 4 key code.
     * @return Integer character code.
     */
    function keyCodeToCharValue(keyCode) {
        const SPECIAL_CODES = {
            [DomKeyCode.BACKSPACE]: 0x08,
            [DomKeyCode.TAB]: 0x09,
            [DomKeyCode.ENTER]: 0x0A,
        };
        // Note, the Chrome virtual keyboard falls back on the first character of
        // the key code if the key is not one of the above.  Do the same here.
        return SPECIAL_CODES[keyCode] || keyCode.charCodeAt(0);
    }
    BrailleKeyEvent.keyCodeToCharValue = keyCodeToCharValue;
    /*
     * Note: Some of the below mappings contain raw braille dot
     * patterns. These are written out in binary form to make clear
     * exactly what dots in the braille cell make up the pattern. The
     * braille cell is arranged in a 2 by 4 dot grid with each dot
     * assigned a number from 1-8.
     * 1 4
     * 2 5
     * 3 6
     * 7 8
     *
     * In binary form, the dot number minus 1 maps to the bit position
     * (from right to left).
     * For example, dots 1-6-7 would be
     * 0b1100001
     */
    /** Maps a braille pattern to a standard key code. */
    BrailleKeyEvent.brailleDotsToStandardKeyCode = {
        0b1: 'A',
        0b11: 'B',
        0b1001: 'C',
        0b11001: 'D',
        0b10001: 'E',
        0b1011: 'F',
        0b11011: 'G',
        0b10011: 'H',
        0b1010: 'I',
        0b11010: 'J',
        0b101: 'K',
        0b111: 'L',
        0b1101: 'M',
        0b11101: 'N',
        0b10101: 'O',
        0b1111: 'P',
        0b11111: 'Q',
        0b10111: 'R',
        0b1110: 'S',
        0b11110: 'T',
        0b100101: 'U',
        0b100111: 'V',
        0b111010: 'W',
        0b101101: 'X',
        0b111101: 'Y',
        0b110101: 'Z',
        0b110100: '0',
        0b10: '1',
        0b110: '2',
        0b10010: '3',
        0b110010: '4',
        0b100010: '5',
        0b10110: '6',
        0b110110: '7',
        0b100110: '8',
        0b10100: '9',
    };
    /** Maps a braille chord pattern to a standard key code. */
    BrailleKeyEvent.brailleChordsToStandardKeyCode = {
        0b1000000: DomKeyCode.BACKSPACE,
        0b10100: DomKeyCode.TAB,
        0b110101: DomKeyCode.ESCAPE,
        0b101000: DomKeyCode.ENTER,
    };
    /** Maps a braille dot chord pattern to standard key modifiers. */
    BrailleKeyEvent.brailleDotsToModifiers = {
        0b010010: { ctrlKey: true },
        0b100100: { altKey: true },
        0b1000100: { shiftKey: true },
        0b1010010: { ctrlKey: true, shiftKey: true },
        0b1100100: { altKey: true, shiftKey: true },
    };
    /** Map from DOM level 4 key codes to legacy numeric key codes. */
    BrailleKeyEvent.legacyKeyCodeMap = {
        [DomKeyCode.BACKSPACE]: KeyCode.BACK,
        [DomKeyCode.TAB]: KeyCode.TAB,
        [DomKeyCode.ENTER]: KeyCode.RETURN,
        [DomKeyCode.ESCAPE]: KeyCode.ESCAPE,
        [DomKeyCode.HOME]: KeyCode.HOME,
        [DomKeyCode.ARROW_LEFT]: KeyCode.LEFT,
        [DomKeyCode.ARROW_UP]: KeyCode.UP,
        [DomKeyCode.ARROW_RIGHT]: KeyCode.RIGHT,
        [DomKeyCode.ARROW_DOWN]: KeyCode.DOWN,
        [DomKeyCode.PAGE_UP]: KeyCode.PRIOR,
        [DomKeyCode.PAGE_DOWN]: KeyCode.NEXT,
        [DomKeyCode.END]: KeyCode.END,
        [DomKeyCode.INSERT]: KeyCode.INSERT,
        [DomKeyCode.DELETE]: KeyCode.DELETE,
        [DomKeyCode.AUDIO_VOLUME_DOWN]: KeyCode.VOLUME_DOWN,
        [DomKeyCode.AUDIO_VOLUME_UP]: KeyCode.VOLUME_UP,
    };
})(BrailleKeyEvent || (BrailleKeyEvent = {}));
// Add 0-9.
for (let i = '0'.charCodeAt(0); i < '9'.charCodeAt(0); ++i) {
    BrailleKeyEvent.legacyKeyCodeMap[String.fromCharCode(i)] =
        /** @type {Key.Code} */ (i);
}
// Add A-Z.
for (let i = 'A'.charCodeAt(0); i < 'Z'.charCodeAt(0); ++i) {
    BrailleKeyEvent.legacyKeyCodeMap[String.fromCharCode(i)] =
        /** @type {Key.Code} */ (i);
}
// Add the F1 to F12 keys.
for (let i = 0; i < 12; ++i) {
    BrailleKeyEvent.legacyKeyCodeMap['F' + (i + 1)] =
        /** @type {Key.Code} */ (112 + i);
}
/**
 * The state of a braille display as represented in the
 * chrome.brailleDisplayPrivate API.
 * TODO: Convert this to an interface once the typescript migration is complete.
 */
export class BrailleDisplayState {
}
TestImportManager.exportForTesting(['BrailleKeyCommand', BrailleKeyCommand], ['BrailleKeyEvent', BrailleKeyEvent]);
