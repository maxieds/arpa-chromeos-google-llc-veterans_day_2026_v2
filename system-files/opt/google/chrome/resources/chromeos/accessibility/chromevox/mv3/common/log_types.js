// Copyright 2019 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Class definitions of log that are stored in LogStore
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { QueueMode } from './tts_types.js';
/**
 * Supported log types.
 * Note that filter type checkboxes are shown in this order at the log page.
 */
export var LogType;
(function (LogType) {
    LogType["SPEECH"] = "speech";
    LogType["SPEECH_RULE"] = "speechRule";
    LogType["BRAILLE"] = "braille";
    LogType["BRAILLE_RULE"] = "brailleRule";
    LogType["EARCON"] = "earcon";
    LogType["EVENT"] = "event";
    LogType["TEXT"] = "text";
    LogType["TREE"] = "tree";
})(LogType || (LogType = {}));
// TODO(anastasi): Convert this to an interface after typescript migration.
export class SerializableLog {
}
export class BaseLog {
    logType;
    date;
    constructor(logType) {
        this.logType = logType;
        this.date = new Date();
    }
    serialize() {
        return {
            logType: this.logType,
            date: this.date.toString(), // Explicit toString(); converts either way.
            value: this.toString(),
        };
    }
    toString() {
        return '';
    }
}
export class EventLog extends BaseLog {
    docUrl_;
    rootName_;
    targetName_;
    type_;
    constructor(event) {
        super(LogType.EVENT);
        this.type_ = event.type;
        this.targetName_ = event.target.name;
        // TODO(b/314203187): Not null asserted, check that this is correct.
        this.rootName_ = event.target.root.name;
        this.docUrl_ = event.target.docUrl;
    }
    toString() {
        return `EventType = ${this.type_}, TargetName = ${this.targetName_}, ` +
            `RootName = ${this.rootName_}, DocumentURL = ${this.docUrl_}`;
    }
}
export class SpeechLog extends BaseLog {
    category_;
    queueMode_;
    textString_;
    constructor(textString, queueMode, category) {
        super(LogType.SPEECH);
        this.textString_ = textString;
        this.queueMode_ = queueMode;
        this.category_ = category;
    }
    toString() {
        let logStr = 'Speak';
        if (this.queueMode_ === QueueMode.FLUSH) {
            logStr += ' (F)';
        }
        else if (this.queueMode_ === QueueMode.CATEGORY_FLUSH) {
            logStr += ' (C)';
        }
        else if (this.queueMode_ === QueueMode.INTERJECT) {
            logStr += ' (I)';
        }
        else {
            logStr += ' (Q)';
        }
        if (this.category_) {
            logStr += ' category=' + this.category_;
        }
        logStr += ' "' + this.textString_ + '"';
        return logStr;
    }
}
export class TextLog extends BaseLog {
    logStr_;
    constructor(logStr, logType) {
        super(logType);
        this.logStr_ = logStr;
    }
    toString() {
        return this.logStr_;
    }
}
export class TreeLog extends BaseLog {
    tree_;
    constructor(tree) {
        super(LogType.TREE);
        this.tree_ = tree;
    }
    toString() {
        return this.tree_.treeToString();
    }
}
TestImportManager.exportForTesting(['LogType', LogType]);
