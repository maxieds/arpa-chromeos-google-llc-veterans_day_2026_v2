// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview A simple container object for the brailling of a
 * navigation from one object to another.
 *
 */
/**
 * A class capturing the braille for navigation from one object to
 * another.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { Spannable } from '../spannable.js';
export class NavBraille {
    /** Text, annotated with DOM nodes. */
    text;
    /** Selection start index. */
    startIndex;
    /** Selection end index. */
    endIndex;
    constructor(kwargs) {
        this.text = (kwargs.text instanceof Spannable) ? kwargs.text :
            new Spannable(kwargs.text);
        this.startIndex =
            (kwargs.startIndex !== undefined) ? kwargs.startIndex : -1;
        this.endIndex =
            (kwargs.endIndex !== undefined) ? kwargs.endIndex : this.startIndex;
    }
    /**
     * Convenience for creating simple braille output.
     * @param text Text to represent in braille.
     * @return Braille output without a cursor.
     */
    static fromText(text) {
        return new NavBraille({ text });
    }
    /**
     * Creates a NavBraille from its serialized json form as created
     * by toJson().
     * @param json the serialized json object.
     */
    static fromJson(json) {
        if (typeof json.startIndex !== 'number' ||
            typeof json.endIndex !== 'number') {
            throw 'Invalid start or end index in serialized NavBraille: ' + json;
        }
        return new NavBraille({
            text: Spannable.fromJson(json.spannable),
            startIndex: json.startIndex,
            endIndex: json.endIndex,
        });
    }
    /** @return true if this braille description is empty. */
    isEmpty() {
        return this.text.length === 0;
    }
    /** @return A string representation of this object. */
    toString() {
        return 'NavBraille(text="' + this.text.toString() + '" ' +
            ' startIndex="' + this.startIndex + '" ' +
            ' endIndex="' + this.endIndex + '")';
    }
    /**
     * Returns a plain old data object with the same data.
     * Suitable for JSON encoding.
     */
    toJson() {
        return {
            spannable: this.text.toJson(),
            startIndex: this.startIndex,
            endIndex: this.endIndex,
        };
    }
}
TestImportManager.exportForTesting(NavBraille);
