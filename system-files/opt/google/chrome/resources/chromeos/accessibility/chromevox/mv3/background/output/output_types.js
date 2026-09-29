// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Definitions of all types related to output.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { ChromeVox } from '../chromevox.js';
const AriaCurrentState = chrome.automation.AriaCurrentState;
const Restriction = chrome.automation.Restriction;
/** The ordering of contextual output. */
export var OutputContextOrder;
(function (OutputContextOrder) {
    // The (ancestor) context comes before the node output.
    OutputContextOrder["FIRST"] = "first";
    // The (ancestor) context comes before the node output when moving forward,
    // after when moving backward.
    OutputContextOrder["DIRECTED"] = "directed";
    // The (ancestor) context comes after the node output.
    OutputContextOrder["LAST"] = "last";
    // Ancestor context is placed both before and after node output.
    OutputContextOrder["FIRST_AND_LAST"] = "firstAndLast";
})(OutputContextOrder || (OutputContextOrder = {}));
/** Used to annotate utterances with speech properties. */
export class OutputSpeechProperties {
    properties_ = {};
    get properties() {
        return this.properties_;
    }
    toJSON() {
        // Make a copy of our properties since the caller really shouldn't be
        // modifying our local state.
        const clone = {};
        for (const key in this.properties_) {
            clone[key] = this.properties_[key];
        }
        return clone;
    }
}
/** Custom actions performed while rendering an output string. */
export class OutputAction {
}
/** Action to play an earcon. */
export class OutputEarconAction extends OutputAction {
    earcon;
    location;
    constructor(earcon, location) {
        super();
        this.earcon = earcon;
        this.location = location;
    }
    run() {
        ChromeVox.earcons.playEarcon(this.earcon, this.location);
    }
    toJSON() {
        return { earcon: this.earcon };
    }
}
/**
 * Annotation for text with a selection inside it.
 */
export class OutputSelectionSpan {
    startIndex;
    endIndex;
    constructor(startIndex, endIndex) {
        // TODO(dtseng): Direction lost below; should preserve for braille panning.
        this.startIndex = startIndex < endIndex ? startIndex : endIndex;
        this.endIndex = endIndex > startIndex ? endIndex : startIndex;
    }
}
/**
 * Wrapper for automation nodes as annotations.  Since the
 * {@code chrome.automation.AutomationNode} constructor isn't exposed in the
 * API, this class is used to allow instanceof checks on these annotations.
 */
export class OutputNodeSpan {
    node;
    offset;
    /** @param offset Offsets into the node's text. Defaults to 0. */
    constructor(node, offset) {
        this.node = node;
        this.offset = offset ? offset : 0;
    }
}
/** Possible events handled by ChromeVox internally. */
export var OutputCustomEvent;
(function (OutputCustomEvent) {
    OutputCustomEvent["NAVIGATE"] = "navigate";
})(OutputCustomEvent || (OutputCustomEvent = {}));
/** Rules for mapping properties to a msg id. */
export const OutputPropertyMap = {
    CHECKED: {
        'true': 'checked_true',
        'false': 'checked_false',
        'mixed': 'checked_mixed',
    },
    PRESSED: {
        'true': 'aria_pressed_true',
        'false': 'aria_pressed_false',
        'mixed': 'aria_pressed_mixed',
    },
    RESTRICTION: {
        [Restriction.DISABLED]: 'aria_disabled_true',
        [Restriction.READ_ONLY]: 'aria_readonly_true',
    },
    STATE: {
        [AriaCurrentState.TRUE]: 'aria_current_true',
        [AriaCurrentState.PAGE]: 'aria_current_page',
        [AriaCurrentState.STEP]: 'aria_current_step',
        [AriaCurrentState.LOCATION]: 'aria_current_location',
        [AriaCurrentState.DATE]: 'aria_current_date',
        [AriaCurrentState.TIME]: 'aria_current_time',
    },
};
/** Metadata about supported automation states. */
export const OUTPUT_STATE_INFO = {
    collapsed: { on: { msgId: 'aria_expanded_false' } },
    default: { on: { msgId: 'default_state' } },
    expanded: { on: { msgId: 'aria_expanded_true' } },
    multiselectable: { on: { msgId: 'aria_multiselectable_true' } },
    required: { on: { msgId: 'aria_required_true' } },
    visited: { on: { msgId: 'visited_state' } },
};
/** Maps input types to message IDs. */
export const INPUT_TYPE_MESSAGE_IDS = {
    'email': 'input_type_email',
    'number': 'input_type_number',
    'password': 'input_type_password',
    'search': 'input_type_search',
    'tel': 'input_type_number',
    'text': 'input_type_text',
    'url': 'input_type_url',
};
export var OutputFormatType;
(function (OutputFormatType) {
    OutputFormatType["BRAILLE"] = "braille";
    OutputFormatType["SPEAK"] = "speak";
})(OutputFormatType || (OutputFormatType = {}));
export var OutputNavigationType;
(function (OutputNavigationType) {
    OutputNavigationType["END_OF"] = "endOf";
    OutputNavigationType["ENTER"] = "enter";
    OutputNavigationType["LEAVE"] = "leave";
    OutputNavigationType["START_OF"] = "startOf";
})(OutputNavigationType || (OutputNavigationType = {}));
/** Delimiter to use between output values. */
export const SPACE = ' ';
TestImportManager.exportForTesting(OutputAction, OutputEarconAction, OutputNodeSpan, OutputSelectionSpan, ['OutputCustomEvent', OutputCustomEvent], ['OutputContextOrder', OutputContextOrder]);
