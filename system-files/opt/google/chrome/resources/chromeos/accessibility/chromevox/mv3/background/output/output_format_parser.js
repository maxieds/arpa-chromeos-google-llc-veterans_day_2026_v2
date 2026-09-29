// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Provides a push parser for Output format rules.
 */
import { OutputFormatTree } from './output_format_tree.js';
export class OutputFormatParser {
    observer_;
    constructor(observer) {
        this.observer_ = observer;
    }
    /** Starts parsing the given output format. */
    parse(format) {
        const formatTrees = OutputFormatTree.parseFormat(format);
        formatTrees.forEach((tree) => {
            // Obtain the operator token.
            let token = tree.value;
            // Set suffix options.
            const options = { annotation: [], isUnique: false };
            options.isUnique = token[token.length - 1] === '=';
            if (options.isUnique) {
                token = token.substring(0, token.length - 1);
            }
            // Process token based on prefix.
            const prefix = token[0];
            token = token.slice(1);
            if (this.observer_.onTokenStart(token)) {
                return;
            }
            // All possible tokens based on prefix.
            let skipToNextToken = false;
            // TODO(b/314203187): Not null asserted, check that this is correct.
            if (prefix === '$') {
                skipToNextToken =
                    this.observer_.onNodeAttributeOrSpecialToken(token, tree, options);
            }
            else if (prefix === '@') {
                skipToNextToken = this.observer_.onMessageToken(token, tree, options);
            }
            else if (prefix === '!') {
                skipToNextToken =
                    this.observer_.onSpeechPropertyToken(token, tree, options);
            }
            if (skipToNextToken) {
                return;
            }
            this.observer_.onTokenEnd();
        });
    }
}
