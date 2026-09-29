// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Contains types related to speech generation.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
/**
 * Categories for a speech utterance. This can be used with the
 * CATEGORY_FLUSH queue mode, which flushes all utterances from a given
 * category but not other utterances.
 *
 * NAV: speech related to explicit navigation, or focus changing.
 * LIVE: speech coming from changes to live regions.
 */
export var TtsCategory;
(function (TtsCategory) {
    TtsCategory["LIVE"] = "live";
    TtsCategory["NAV"] = "nav";
})(TtsCategory || (TtsCategory = {}));
/**
 * Queue modes for calls to {@code TtsInterface.speak}. The modes are listed in
 * descending order of priority.
 */
export var QueueMode;
(function (QueueMode) {
    /**
     * Prepend the current utterance (if any) to the queue, stop speech, and
     * speak this utterance.
     */
    QueueMode[QueueMode["INTERJECT"] = 0] = "INTERJECT";
    /** Stop speech, clear everything, then speak this utterance. */
    QueueMode[QueueMode["FLUSH"] = 1] = "FLUSH";
    /**
     * Clear any utterances of the same category (as set by
     * properties['category']) from the queue, then enqueue this utterance.
     */
    QueueMode[QueueMode["CATEGORY_FLUSH"] = 2] = "CATEGORY_FLUSH";
    /** Append this utterance to the end of the queue. */
    QueueMode[QueueMode["QUEUE"] = 3] = "QUEUE";
})(QueueMode || (QueueMode = {}));
/**
 * Numeric properties of TtsSpeechProperties that will be set.
 */
export var TtsAudioProperty;
(function (TtsAudioProperty) {
    TtsAudioProperty["PITCH"] = "pitch";
    TtsAudioProperty["RATE"] = "rate";
    TtsAudioProperty["VOLUME"] = "volume";
})(TtsAudioProperty || (TtsAudioProperty = {}));
/** Structure to store properties around TTS speech production. */
export class TtsSpeechProperties {
    [TtsAudioProperty.PITCH];
    [TtsAudioProperty.RATE];
    [TtsAudioProperty.VOLUME];
    category;
    color;
    delay;
    doNotInterrupt;
    fontWeight;
    lang;
    math;
    pause;
    phoneticCharacters;
    punctuationEcho;
    token;
    voiceName;
    relativePitch;
    relativeRate;
    relativeVolume;
    startCallback;
    endCallback;
    onEvent;
    constructor(initialValues) {
        this.init_(initialValues);
    }
    toJSON() {
        return Object.assign({}, this);
    }
    init_(initialValues) {
        if (!initialValues) {
            return;
        }
        Object.assign(this, initialValues);
    }
}
export var Personality;
(function (Personality) {
    // TTS personality for annotations - text spoken by ChromeVox that
    // elaborates on a user interface element but isn't displayed on-screen.
    Personality.ANNOTATION = new TtsSpeechProperties({
        'relativePitch': -0.25,
        // TODO:(rshearer) Added this color change for I/O presentation.
        'color': 'yellow',
        'punctuationEcho': 'none',
    });
    // TTS personality for announcements - text spoken by ChromeVox that
    // isn't tied to any user interface elements.
    Personality.ANNOUNCEMENT = new TtsSpeechProperties({
        'punctuationEcho': 'none',
    });
    // TTS personality for an aside - text in parentheses.
    Personality.ASIDE = new TtsSpeechProperties({
        'relativePitch': -0.1,
        'color': '#669',
    });
    // TTS personality for capital letters.
    Personality.CAPITAL = new TtsSpeechProperties({
        'relativePitch': 0.2,
    });
    // TTS personality for deleted text.
    Personality.DELETED = new TtsSpeechProperties({
        'punctuationEcho': 'none',
        'relativePitch': -0.6,
    });
    // TTS personality for dictation hints.
    Personality.DICTATION_HINT = new TtsSpeechProperties({
        'punctuationEcho': 'none',
        'relativePitch': 0.3,
    });
    // TTS personality for emphasis or italicized text.
    Personality.EMPHASIS = new TtsSpeechProperties({
        'relativeVolume': 0.1,
        'relativeRate': -0.1,
        'color': '#6bb',
        'fontWeight': 'bold',
    });
    // TTS personality for quoted text.
    Personality.QUOTE = new TtsSpeechProperties({
        'relativePitch': 0.1,
        'color': '#b6b',
        'fontWeight': 'bold',
    });
    // TTS personality for strong or bold text.
    Personality.STRONG = new TtsSpeechProperties({
        'relativePitch': 0.1,
        'color': '#b66',
        'fontWeight': 'bold',
    });
    // TTS personality for alerts from the system, such as battery level
    // warnings.
    Personality.SYSTEM_ALERT = new TtsSpeechProperties({
        'punctuationEcho': 'none',
        'doNotInterrupt': true,
    });
})(Personality || (Personality = {}));
/** Various TTS-related settings keys. */
export var TtsSettings;
(function (TtsSettings) {
    // Color is for the lens display.
    TtsSettings["COLOR"] = "color";
    TtsSettings["FONT_WEIGHT"] = "fontWeight";
    TtsSettings["LANG"] = "lang";
    TtsSettings["PAUSE"] = "pause";
    TtsSettings["PHONETIC_CHARACTERS"] = "phoneticCharacters";
    TtsSettings["PITCH"] = "pitch";
    TtsSettings["PUNCTUATION_ECHO"] = "punctuationEcho";
    TtsSettings["RATE"] = "rate";
    TtsSettings["RELATIVE_PITCH"] = "relativePitch";
    TtsSettings["RELATIVE_RATE"] = "relativeRate";
    TtsSettings["RELATIVE_VOLUME"] = "relativeVolume";
    TtsSettings["VOLUME"] = "volume";
})(TtsSettings || (TtsSettings = {}));
/** List of punctuation echoes that the user can cycle through. */
export const PunctuationEchoes = [
    // Punctuation echoed for the 'none' option.
    {
        name: 'none',
        msg: 'no_punctuation',
        regexp: /[-$#"()*;:<>\n\\\/+='~`@_－＄＃＂（）＊；：＜＞＼／＋＝＇～｀＠＿]/g,
        clear: true,
    },
    // Punctuation echoed for the 'some' option.
    {
        name: 'some',
        msg: 'some_punctuation',
        regexp: /[$#"*<>\\\/\{\}+=~`%\u2022\u25e6\u25a0＄＃＂＊＜＞＼／｛｝＋＝～｀％]/g,
        clear: false,
    },
    // Punctuation echoed for the 'all' option.
    {
        name: 'all',
        msg: 'all_punctuation',
        regexp: /[-$#"()*;:<>\n\\\/\{\}\[\]+='~`!@_.,?%\u2022\u25e6\u25a0－＄＃＂（）＊；：＜＞＼／｛｝［］＋＝＇～｀！＠＿．，？％]/g,
        clear: false,
    },
];
/**
 * Character dictionary. These symbols are replaced with their human readable
 * equivalents. This replacement only occurs for single character utterances.
 */
export const CharacterDictionary = {
    ' ': 'space',
    '\u00a0': 'space',
    '`': 'backtick',
    '｀': 'backtick',
    '~': 'tilde',
    '～': 'tilde',
    '!': 'exclamation',
    '！': 'exclamation',
    '@': 'at',
    '＠': 'at',
    '#': 'pound',
    '＃': 'pound',
    '$': 'dollar',
    '＄': 'dollar',
    '%': 'percent',
    '％': 'percent',
    '^': 'caret',
    '＾': 'caret',
    '&': 'ampersand',
    '＆': 'ampersand',
    '*': 'asterisk',
    '＊': 'asterisk',
    '(': 'open_paren',
    '（': 'open_paren',
    ')': 'close_paren',
    '）': 'close_paren',
    '-': 'dash',
    '－': 'dash',
    '_': 'underscore',
    '＿': 'underscore',
    '=': 'equals',
    '＝': 'equals',
    '+': 'plus',
    '＋': 'plus',
    '[': 'left_bracket',
    '［': 'left_bracket',
    ']': 'right_bracket',
    '］': 'right_bracket',
    '{': 'left_brace',
    '｛': 'left_brace',
    '}': 'right_brace',
    '｝': 'right_brace',
    '|': 'pipe',
    '｜': 'pipe',
    ';': 'semicolon',
    '；': 'semicolon',
    ':': 'colon',
    '：': 'colon',
    ',': 'comma',
    '，': 'comma',
    '.': 'dot',
    '．': 'dot',
    '<': 'less_than',
    '＜': 'less_than',
    '>': 'greater_than',
    '＞': 'greater_than',
    '/': 'slash',
    '／': 'slash',
    '?': 'question_mark',
    '？': 'question_mark',
    '"': 'quote',
    '＂': 'quote',
    '\'': 'apostrophe',
    '＇': 'apostrophe',
    '\t': 'tab',
    '\r': 'return',
    '\n': 'new_line',
    '\\': 'backslash',
    '＼': 'backslash',
    '\u2022': 'bullet',
    '\u25e6': 'white_bullet',
    '\u25a0': 'square_bullet',
};
/**
 * Substitution dictionary. These symbols or patterns are ALWAYS substituted
 * whenever they occur, so this should be reserved only for unicode characters
 * and characters that never have any different meaning in context.
 *
 * For example, do not include '$' here because $2 should be read as
 * "two dollars".
 */
export const SubstitutionDictionary = {
    '://': 'colon slash slash',
    '\u00bc': 'one fourth',
    '\u00bd': 'one half',
    '\u2190': 'left arrow',
    '\u2191': 'up arrow',
    '\u2192': 'right arrow',
    '\u2193': 'down arrow',
    '\u21d0': 'left double arrow',
    '\u21d1': 'up double arrow',
    '\u21d2': 'right double  arrow',
    '\u21d3': 'down double arrow',
    '\u21e6': 'left arrow',
    '\u21e7': 'up arrow',
    '\u21e8': 'right arrow',
    '\u21e9': 'down arrow',
    '\u2303': 'control',
    '\u2318': 'command',
    '\u2325': 'option',
    '\u25b2': 'up triangle',
    '\u25b3': 'up triangle',
    '\u25b4': 'up triangle',
    '\u25b5': 'up triangle',
    '\u25b6': 'right triangle',
    '\u25b7': 'right triangle',
    '\u25b8': 'right triangle',
    '\u25b9': 'right triangle',
    '\u25ba': 'right pointer',
    '\u25bb': 'right pointer',
    '\u25bc': 'down triangle',
    '\u25bd': 'down triangle',
    '\u25be': 'down triangle',
    '\u25bf': 'down triangle',
    '\u25c0': 'left triangle',
    '\u25c1': 'left triangle',
    '\u25c2': 'left triangle',
    '\u25c3': 'left triangle',
    '\u25c4': 'left pointer',
    '\u25c5': 'left pointer',
    '\uf8ff': 'apple',
    '£': 'pound sterling',
};
TestImportManager.exportForTesting(['QueueMode', QueueMode], ['TtsSettings', TtsSettings], TtsSpeechProperties, ['TtsCategory', TtsCategory]);
