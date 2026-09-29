// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Data relating to the earcons used in ChromeVox.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
/** Earcon names. */
export var EarconId;
(function (EarconId) {
    EarconId["ALERT_MODAL"] = "alert_modal";
    EarconId["ALERT_NONMODAL"] = "alert_nonmodal";
    EarconId["BUTTON"] = "button";
    EarconId["CHECK_OFF"] = "check_off";
    EarconId["CHECK_ON"] = "check_on";
    EarconId["CHROMEVOX_LOADING"] = "chromevox_loading";
    EarconId["CHROMEVOX_LOADED"] = "chromevox_loaded";
    EarconId["EDITABLE_TEXT"] = "editable_text";
    EarconId["INVALID_KEYPRESS"] = "invalid_keypress";
    EarconId["LINK"] = "link";
    EarconId["LISTBOX"] = "listbox";
    EarconId["LIST_ITEM"] = "list_item";
    EarconId["LONG_DESC"] = "long_desc";
    EarconId["MATH"] = "math";
    EarconId["NO_POINTER_ANCHOR"] = "no_pointer_anchor";
    EarconId["OBJECT_CLOSE"] = "object_close";
    EarconId["OBJECT_ENTER"] = "object_enter";
    EarconId["OBJECT_EXIT"] = "object_exit";
    EarconId["OBJECT_OPEN"] = "object_open";
    EarconId["OBJECT_SELECT"] = "object_select";
    EarconId["PAGE_FINISH_LOADING"] = "page_finish_loading";
    EarconId["PAGE_START_LOADING"] = "page_start_loading";
    EarconId["POP_UP_BUTTON"] = "pop_up_button";
    EarconId["RECOVER_FOCUS"] = "recover_focus";
    EarconId["SELECTION"] = "selection";
    EarconId["SELECTION_REVERSE"] = "selection_reverse";
    EarconId["SKIP"] = "skip";
    EarconId["SLIDER"] = "slider";
    EarconId["SMART_STICKY_MODE_OFF"] = "smart_sticky_mode_off";
    EarconId["SMART_STICKY_MODE_ON"] = "smart_sticky_mode_on";
    EarconId["WRAP"] = "wrap";
    EarconId["WRAP_EDGE"] = "wrap_edge";
})(EarconId || (EarconId = {}));
(function (EarconId) {
    function fromName(name) {
        return EarconId[name];
    }
    EarconId.fromName = fromName;
})(EarconId || (EarconId = {}));
/**
 * Maps a earcon id to a message id description.
 * Only add mappings for earcons used in ChromeVox Next. This map gets
 * used to generate tutorial content.
 */
export const EarconDescription = {
    [EarconId.ALERT_MODAL]: 'alert_modal_earcon_description',
    [EarconId.ALERT_NONMODAL]: 'alert_nonmodal_earcon_description',
    [EarconId.BUTTON]: 'button_earcon_description',
    [EarconId.CHECK_OFF]: 'check_off_earcon_description',
    [EarconId.CHECK_ON]: 'check_on_earcon_description',
    [EarconId.CHROMEVOX_LOADING]: 'chromevox_loading_earcon_description',
    [EarconId.EDITABLE_TEXT]: 'editable_text_earcon_description',
    [EarconId.INVALID_KEYPRESS]: 'invalid_keypress_earcon_description',
    [EarconId.LINK]: 'link_earcon_description',
    [EarconId.LISTBOX]: 'listbox_earcon_description',
    [EarconId.NO_POINTER_ANCHOR]: 'no_pointer_anchor_earcon_description',
    [EarconId.PAGE_START_LOADING]: 'page_start_loading_earcon_description',
    [EarconId.POP_UP_BUTTON]: 'pop_up_button_earcon_description',
    [EarconId.SLIDER]: 'slider_earcon_description',
    [EarconId.SMART_STICKY_MODE_OFF]: 'smart_sticky_mode_off_earcon_description',
    [EarconId.SMART_STICKY_MODE_ON]: 'smart_sticky_mode_on_earcon_description',
    [EarconId.WRAP]: 'wrap_earcon_description',
};
TestImportManager.exportForTesting(['EarconId', EarconId]);
