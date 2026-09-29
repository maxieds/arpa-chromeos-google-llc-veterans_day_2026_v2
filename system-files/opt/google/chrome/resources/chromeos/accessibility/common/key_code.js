// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview A centralized listing for keycodes used by accessibility
 * component extensions. Largely taken from
 * ui/events/keycodes/keyboard_codes_posix.h, but with specific edits for Chrome
 * OS and accessibility.
 */
import { TestImportManager } from './testing/test_import_manager.js';
export var KeyCode;
(function (KeyCode) {
    KeyCode[KeyCode["UNKNOWN"] = 0] = "UNKNOWN";
    KeyCode[KeyCode["POWER_BUTTON"] = 0] = "POWER_BUTTON";
    KeyCode[KeyCode["CANCEL"] = 3] = "CANCEL";
    KeyCode[KeyCode["BACK"] = 8] = "BACK";
    KeyCode[KeyCode["TAB"] = 9] = "TAB";
    KeyCode[KeyCode["BACKTAB"] = 10] = "BACKTAB";
    KeyCode[KeyCode["CLEAR"] = 12] = "CLEAR";
    KeyCode[KeyCode["RETURN"] = 13] = "RETURN";
    KeyCode[KeyCode["SHIFT"] = 16] = "SHIFT";
    KeyCode[KeyCode["CONTROL"] = 17] = "CONTROL";
    KeyCode[KeyCode["MENU"] = 18] = "MENU";
    KeyCode[KeyCode["ALT"] = 18] = "ALT";
    KeyCode[KeyCode["PAUSE"] = 19] = "PAUSE";
    KeyCode[KeyCode["CAPITAL"] = 20] = "CAPITAL";
    KeyCode[KeyCode["KANA"] = 21] = "KANA";
    KeyCode[KeyCode["HANGUL"] = 21] = "HANGUL";
    KeyCode[KeyCode["PASTE"] = 22] = "PASTE";
    KeyCode[KeyCode["JUNJA"] = 23] = "JUNJA";
    KeyCode[KeyCode["FINAL"] = 24] = "FINAL";
    KeyCode[KeyCode["HANJA"] = 25] = "HANJA";
    KeyCode[KeyCode["KANJI"] = 25] = "KANJI";
    KeyCode[KeyCode["ESCAPE"] = 27] = "ESCAPE";
    KeyCode[KeyCode["CONVERT"] = 28] = "CONVERT";
    KeyCode[KeyCode["NONCONVERT"] = 29] = "NONCONVERT";
    KeyCode[KeyCode["ACCEPT"] = 30] = "ACCEPT";
    KeyCode[KeyCode["MODECHANGE"] = 31] = "MODECHANGE";
    KeyCode[KeyCode["SPACE"] = 32] = "SPACE";
    KeyCode[KeyCode["PRIOR"] = 33] = "PRIOR";
    KeyCode[KeyCode["NEXT"] = 34] = "NEXT";
    KeyCode[KeyCode["END"] = 35] = "END";
    KeyCode[KeyCode["HOME"] = 36] = "HOME";
    KeyCode[KeyCode["LEFT"] = 37] = "LEFT";
    KeyCode[KeyCode["UP"] = 38] = "UP";
    KeyCode[KeyCode["RIGHT"] = 39] = "RIGHT";
    KeyCode[KeyCode["DOWN"] = 40] = "DOWN";
    KeyCode[KeyCode["SELECT"] = 41] = "SELECT";
    KeyCode[KeyCode["PRINT"] = 42] = "PRINT";
    KeyCode[KeyCode["EXECUTE"] = 43] = "EXECUTE";
    KeyCode[KeyCode["SNAPSHOT"] = 44] = "SNAPSHOT";
    KeyCode[KeyCode["INSERT"] = 45] = "INSERT";
    KeyCode[KeyCode["DELETE"] = 46] = "DELETE";
    KeyCode[KeyCode["HELP"] = 47] = "HELP";
    KeyCode[KeyCode["ZERO"] = 48] = "ZERO";
    KeyCode[KeyCode["ONE"] = 49] = "ONE";
    KeyCode[KeyCode["TWO"] = 50] = "TWO";
    KeyCode[KeyCode["THREE"] = 51] = "THREE";
    KeyCode[KeyCode["FOUR"] = 52] = "FOUR";
    KeyCode[KeyCode["FIVE"] = 53] = "FIVE";
    KeyCode[KeyCode["SIX"] = 54] = "SIX";
    KeyCode[KeyCode["SEVEN"] = 55] = "SEVEN";
    KeyCode[KeyCode["EIGHT"] = 56] = "EIGHT";
    KeyCode[KeyCode["NINE"] = 57] = "NINE";
    KeyCode[KeyCode["A"] = 65] = "A";
    KeyCode[KeyCode["B"] = 66] = "B";
    KeyCode[KeyCode["C"] = 67] = "C";
    KeyCode[KeyCode["D"] = 68] = "D";
    KeyCode[KeyCode["E"] = 69] = "E";
    KeyCode[KeyCode["F"] = 70] = "F";
    KeyCode[KeyCode["G"] = 71] = "G";
    KeyCode[KeyCode["H"] = 72] = "H";
    KeyCode[KeyCode["I"] = 73] = "I";
    KeyCode[KeyCode["J"] = 74] = "J";
    KeyCode[KeyCode["K"] = 75] = "K";
    KeyCode[KeyCode["L"] = 76] = "L";
    KeyCode[KeyCode["M"] = 77] = "M";
    KeyCode[KeyCode["N"] = 78] = "N";
    KeyCode[KeyCode["O"] = 79] = "O";
    KeyCode[KeyCode["P"] = 80] = "P";
    KeyCode[KeyCode["Q"] = 81] = "Q";
    KeyCode[KeyCode["R"] = 82] = "R";
    KeyCode[KeyCode["S"] = 83] = "S";
    KeyCode[KeyCode["T"] = 84] = "T";
    KeyCode[KeyCode["U"] = 85] = "U";
    KeyCode[KeyCode["V"] = 86] = "V";
    KeyCode[KeyCode["W"] = 87] = "W";
    KeyCode[KeyCode["X"] = 88] = "X";
    KeyCode[KeyCode["Y"] = 89] = "Y";
    KeyCode[KeyCode["Z"] = 90] = "Z";
    KeyCode[KeyCode["SEARCH"] = 91] = "SEARCH";
    KeyCode[KeyCode["RWIN"] = 92] = "RWIN";
    KeyCode[KeyCode["APPS"] = 93] = "APPS";
    KeyCode[KeyCode["SLEEP"] = 95] = "SLEEP";
    KeyCode[KeyCode["NUMPAD0"] = 96] = "NUMPAD0";
    KeyCode[KeyCode["NUMPAD1"] = 97] = "NUMPAD1";
    KeyCode[KeyCode["NUMPAD2"] = 98] = "NUMPAD2";
    KeyCode[KeyCode["NUMPAD3"] = 99] = "NUMPAD3";
    KeyCode[KeyCode["NUMPAD4"] = 100] = "NUMPAD4";
    KeyCode[KeyCode["NUMPAD5"] = 101] = "NUMPAD5";
    KeyCode[KeyCode["NUMPAD6"] = 102] = "NUMPAD6";
    KeyCode[KeyCode["NUMPAD7"] = 103] = "NUMPAD7";
    KeyCode[KeyCode["NUMPAD8"] = 104] = "NUMPAD8";
    KeyCode[KeyCode["NUMPAD9"] = 105] = "NUMPAD9";
    KeyCode[KeyCode["MULTIPLY"] = 106] = "MULTIPLY";
    KeyCode[KeyCode["ADD"] = 107] = "ADD";
    KeyCode[KeyCode["SEPARATOR"] = 108] = "SEPARATOR";
    KeyCode[KeyCode["SUBTRACT"] = 109] = "SUBTRACT";
    KeyCode[KeyCode["DECIMAL"] = 110] = "DECIMAL";
    KeyCode[KeyCode["DIVIDE"] = 111] = "DIVIDE";
    KeyCode[KeyCode["F1"] = 112] = "F1";
    KeyCode[KeyCode["F2"] = 113] = "F2";
    KeyCode[KeyCode["F3"] = 114] = "F3";
    KeyCode[KeyCode["F4"] = 115] = "F4";
    KeyCode[KeyCode["F5"] = 116] = "F5";
    KeyCode[KeyCode["F6"] = 117] = "F6";
    KeyCode[KeyCode["F7"] = 118] = "F7";
    KeyCode[KeyCode["F8"] = 119] = "F8";
    KeyCode[KeyCode["F9"] = 120] = "F9";
    KeyCode[KeyCode["F10"] = 121] = "F10";
    KeyCode[KeyCode["F11"] = 122] = "F11";
    KeyCode[KeyCode["F12"] = 123] = "F12";
    KeyCode[KeyCode["F13"] = 124] = "F13";
    KeyCode[KeyCode["F14"] = 125] = "F14";
    KeyCode[KeyCode["F15"] = 126] = "F15";
    KeyCode[KeyCode["F16"] = 127] = "F16";
    KeyCode[KeyCode["F17"] = 128] = "F17";
    KeyCode[KeyCode["F18"] = 129] = "F18";
    KeyCode[KeyCode["F19"] = 130] = "F19";
    KeyCode[KeyCode["F20"] = 131] = "F20";
    KeyCode[KeyCode["F21"] = 132] = "F21";
    KeyCode[KeyCode["F22"] = 133] = "F22";
    KeyCode[KeyCode["F23"] = 134] = "F23";
    KeyCode[KeyCode["F24"] = 135] = "F24";
    KeyCode[KeyCode["NUMLOCK"] = 144] = "NUMLOCK";
    KeyCode[KeyCode["SCROLL"] = 145] = "SCROLL";
    KeyCode[KeyCode["WLAN"] = 151] = "WLAN";
    KeyCode[KeyCode["POWER"] = 152] = "POWER";
    KeyCode[KeyCode["ASSISTANT"] = 153] = "ASSISTANT";
    KeyCode[KeyCode["SETTINGS"] = 154] = "SETTINGS";
    KeyCode[KeyCode["PRIVACY_SCREEN_TOGGLE"] = 155] = "PRIVACY_SCREEN_TOGGLE";
    KeyCode[KeyCode["LSHIFT"] = 160] = "LSHIFT";
    KeyCode[KeyCode["RSHIFT"] = 161] = "RSHIFT";
    KeyCode[KeyCode["LCONTROL"] = 162] = "LCONTROL";
    KeyCode[KeyCode["RCONTROL"] = 163] = "RCONTROL";
    KeyCode[KeyCode["LMENU"] = 164] = "LMENU";
    KeyCode[KeyCode["RMENU"] = 165] = "RMENU";
    KeyCode[KeyCode["BROWSER_BACK"] = 166] = "BROWSER_BACK";
    KeyCode[KeyCode["BROWSER_FORWARD"] = 167] = "BROWSER_FORWARD";
    KeyCode[KeyCode["BROWSER_REFRESH"] = 168] = "BROWSER_REFRESH";
    KeyCode[KeyCode["BROWSER_STOP"] = 169] = "BROWSER_STOP";
    KeyCode[KeyCode["BROWSER_SEARCH"] = 170] = "BROWSER_SEARCH";
    KeyCode[KeyCode["BROWSER_FAVORITES"] = 171] = "BROWSER_FAVORITES";
    KeyCode[KeyCode["BROWSER_HOME"] = 172] = "BROWSER_HOME";
    KeyCode[KeyCode["VOLUME_MUTE"] = 173] = "VOLUME_MUTE";
    KeyCode[KeyCode["VOLUME_DOWN"] = 174] = "VOLUME_DOWN";
    KeyCode[KeyCode["VOLUME_UP"] = 175] = "VOLUME_UP";
    KeyCode[KeyCode["MEDIA_NEXT_TRACK"] = 176] = "MEDIA_NEXT_TRACK";
    KeyCode[KeyCode["MEDIA_PREV_TRACK"] = 177] = "MEDIA_PREV_TRACK";
    KeyCode[KeyCode["MEDIA_STOP"] = 178] = "MEDIA_STOP";
    KeyCode[KeyCode["MEDIA_PLAY_PAUSE"] = 179] = "MEDIA_PLAY_PAUSE";
    KeyCode[KeyCode["MEDIA_LAUNCH_MAIL"] = 180] = "MEDIA_LAUNCH_MAIL";
    KeyCode[KeyCode["MEDIA_LAUNCH_MEDIA_SELECT"] = 181] = "MEDIA_LAUNCH_MEDIA_SELECT";
    KeyCode[KeyCode["MEDIA_LAUNCH_APP1"] = 182] = "MEDIA_LAUNCH_APP1";
    KeyCode[KeyCode["MEDIA_LAUNCH_APP2"] = 183] = "MEDIA_LAUNCH_APP2";
    KeyCode[KeyCode["OEM_1"] = 186] = "OEM_1";
    KeyCode[KeyCode["OEM_PLUS"] = 187] = "OEM_PLUS";
    KeyCode[KeyCode["OEM_COMMA"] = 188] = "OEM_COMMA";
    KeyCode[KeyCode["OEM_MINUS"] = 189] = "OEM_MINUS";
    KeyCode[KeyCode["OEM_PERIOD"] = 190] = "OEM_PERIOD";
    KeyCode[KeyCode["OEM_2"] = 191] = "OEM_2";
    KeyCode[KeyCode["OEM_3"] = 192] = "OEM_3";
    KeyCode[KeyCode["BRIGHTNESS_DOWN"] = 216] = "BRIGHTNESS_DOWN";
    KeyCode[KeyCode["BRIGHTNESS_UP"] = 217] = "BRIGHTNESS_UP";
    KeyCode[KeyCode["KBD_BRIGHTNESS_DOWN"] = 218] = "KBD_BRIGHTNESS_DOWN";
    KeyCode[KeyCode["OEM_4"] = 219] = "OEM_4";
    KeyCode[KeyCode["OEM_5"] = 220] = "OEM_5";
    KeyCode[KeyCode["OEM_6"] = 221] = "OEM_6";
    KeyCode[KeyCode["OEM_7"] = 222] = "OEM_7";
    KeyCode[KeyCode["OEM_8"] = 223] = "OEM_8";
    KeyCode[KeyCode["ALTGR"] = 225] = "ALTGR";
    KeyCode[KeyCode["OEM_102"] = 226] = "OEM_102";
    KeyCode[KeyCode["OEM_103"] = 227] = "OEM_103";
    KeyCode[KeyCode["OEM_104"] = 228] = "OEM_104";
    KeyCode[KeyCode["PROCESSKEY"] = 229] = "PROCESSKEY";
    KeyCode[KeyCode["COMPOSE"] = 230] = "COMPOSE";
    KeyCode[KeyCode["PACKET"] = 231] = "PACKET";
    KeyCode[KeyCode["KBD_BRIGHTNESS_UP"] = 232] = "KBD_BRIGHTNESS_UP";
    KeyCode[KeyCode["MEDIA_PLAY"] = 233] = "MEDIA_PLAY";
    KeyCode[KeyCode["MEDIA_PAUSE"] = 234] = "MEDIA_PAUSE";
    KeyCode[KeyCode["OEM_ATTN"] = 240] = "OEM_ATTN";
    KeyCode[KeyCode["OEM_FINISH"] = 241] = "OEM_FINISH";
    KeyCode[KeyCode["OEM_COPY"] = 242] = "OEM_COPY";
    KeyCode[KeyCode["DBE_SBCSCHAR"] = 243] = "DBE_SBCSCHAR";
    KeyCode[KeyCode["DBE_DBCSCHAR"] = 244] = "DBE_DBCSCHAR";
    KeyCode[KeyCode["OEM_BACKTAB"] = 245] = "OEM_BACKTAB";
    KeyCode[KeyCode["ATTN"] = 246] = "ATTN";
    KeyCode[KeyCode["CRSEL"] = 247] = "CRSEL";
    KeyCode[KeyCode["EXSEL"] = 248] = "EXSEL";
    KeyCode[KeyCode["EREOF"] = 249] = "EREOF";
    KeyCode[KeyCode["PLAY"] = 250] = "PLAY";
    KeyCode[KeyCode["ZOOM"] = 251] = "ZOOM";
    KeyCode[KeyCode["NONAME"] = 252] = "NONAME";
    KeyCode[KeyCode["PA1"] = 253] = "PA1";
    KeyCode[KeyCode["OEM_CLEAR"] = 254] = "OEM_CLEAR";
})(KeyCode || (KeyCode = {}));
const KEY_NAMES = {
    [KeyCode.POWER_BUTTON]: 'Power button',
    [KeyCode.BACK]: 'Backspace',
    [KeyCode.TAB]: 'Tab',
    [KeyCode.RETURN]: 'Enter',
    [KeyCode.SHIFT]: 'Shift',
    [KeyCode.CONTROL]: 'Control',
    [KeyCode.ALT]: 'Alt',
    [KeyCode.ESCAPE]: 'Escape',
    [KeyCode.SPACE]: 'Space',
    [KeyCode.END]: 'end',
    [KeyCode.HOME]: 'home',
    [KeyCode.LEFT]: 'Left arrow',
    [KeyCode.UP]: 'Up arrow',
    [KeyCode.RIGHT]: 'Right arrow',
    [KeyCode.DOWN]: 'Down arrow',
    [KeyCode.INSERT]: 'Insert',
    [KeyCode.DELETE]: 'Delete',
    [KeyCode.ZERO]: '0',
    [KeyCode.ONE]: '1',
    [KeyCode.TWO]: '2',
    [KeyCode.THREE]: '3',
    [KeyCode.FOUR]: '4',
    [KeyCode.FIVE]: '5',
    [KeyCode.SIX]: '6',
    [KeyCode.SEVEN]: '7',
    [KeyCode.EIGHT]: '8',
    [KeyCode.NINE]: '9',
    [KeyCode.A]: 'A',
    [KeyCode.B]: 'B',
    [KeyCode.C]: 'C',
    [KeyCode.D]: 'D',
    [KeyCode.E]: 'E',
    [KeyCode.F]: 'F',
    [KeyCode.G]: 'G',
    [KeyCode.H]: 'H',
    [KeyCode.I]: 'I',
    [KeyCode.J]: 'J',
    [KeyCode.K]: 'K',
    [KeyCode.L]: 'L',
    [KeyCode.M]: 'M',
    [KeyCode.N]: 'N',
    [KeyCode.O]: 'O',
    [KeyCode.P]: 'P',
    [KeyCode.Q]: 'Q',
    [KeyCode.R]: 'R',
    [KeyCode.S]: 'S',
    [KeyCode.T]: 'T',
    [KeyCode.U]: 'U',
    [KeyCode.V]: 'V',
    [KeyCode.W]: 'W',
    [KeyCode.X]: 'X',
    [KeyCode.Y]: 'Y',
    [KeyCode.Z]: 'Z',
    [KeyCode.SEARCH]: 'Search',
    [KeyCode.APPS]: 'Search',
    [KeyCode.NUMPAD0]: '0',
    [KeyCode.NUMPAD1]: '1',
    [KeyCode.NUMPAD2]: '2',
    [KeyCode.NUMPAD3]: '3',
    [KeyCode.NUMPAD4]: '4',
    [KeyCode.NUMPAD5]: '5',
    [KeyCode.NUMPAD6]: '6',
    [KeyCode.NUMPAD7]: '7',
    [KeyCode.NUMPAD8]: '8',
    [KeyCode.NUMPAD9]: '9',
    [KeyCode.F4]: 'Toggle full screen',
    [KeyCode.F11]: 'F11',
    [KeyCode.F12]: 'F12',
    [KeyCode.OEM_1]: 'Semicolon',
    [KeyCode.OEM_PLUS]: 'Equal sign',
    [KeyCode.OEM_COMMA]: 'Comma',
    [KeyCode.OEM_MINUS]: 'Dash',
    [KeyCode.OEM_PERIOD]: 'Period',
    [KeyCode.OEM_2]: 'Forward slash',
    [KeyCode.OEM_3]: 'Grave accent',
    [KeyCode.OEM_4]: 'Open bracket',
    [KeyCode.OEM_5]: 'Back slash',
    [KeyCode.OEM_6]: 'Close bracket',
    [KeyCode.OEM_7]: 'Single quote',
};
(function (KeyCode) {
    function name(code) {
        return KEY_NAMES[code] ?? '';
    }
    KeyCode.name = name;
})(KeyCode || (KeyCode = {}));
TestImportManager.exportForTesting(['KeyCode', KeyCode]);
