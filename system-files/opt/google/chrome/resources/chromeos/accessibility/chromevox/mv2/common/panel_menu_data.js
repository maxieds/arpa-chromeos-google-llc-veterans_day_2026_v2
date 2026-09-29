// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Data types for transferring information about panel menus from
 * the background context to the panel context.
 */
import { AutomationPredicate } from '/common/automation_predicate.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
export var PanelNodeMenuId;
(function (PanelNodeMenuId) {
    PanelNodeMenuId[PanelNodeMenuId["HEADING"] = 1] = "HEADING";
    PanelNodeMenuId[PanelNodeMenuId["LANDMARK"] = 2] = "LANDMARK";
    PanelNodeMenuId[PanelNodeMenuId["LINK"] = 3] = "LINK";
    PanelNodeMenuId[PanelNodeMenuId["FORM_CONTROL"] = 4] = "FORM_CONTROL";
    PanelNodeMenuId[PanelNodeMenuId["TABLE"] = 5] = "TABLE";
})(PanelNodeMenuId || (PanelNodeMenuId = {}));
export const ALL_PANEL_MENU_NODE_DATA = [
    {
        menuId: PanelNodeMenuId.HEADING,
        titleId: 'role_heading',
        predicate: AutomationPredicate.heading,
    },
    {
        menuId: PanelNodeMenuId.LANDMARK,
        titleId: 'role_landmark',
        predicate: AutomationPredicate.landmark,
    },
    {
        menuId: PanelNodeMenuId.LINK,
        titleId: 'role_link',
        predicate: AutomationPredicate.link,
    },
    {
        menuId: PanelNodeMenuId.FORM_CONTROL,
        titleId: 'panel_menu_form_controls',
        predicate: AutomationPredicate.formField,
    },
    {
        menuId: PanelNodeMenuId.TABLE,
        titleId: 'role_table',
        predicate: AutomationPredicate.table,
    },
];
TestImportManager.exportForTesting(['PanelNodeMenuId', PanelNodeMenuId], ['ALL_PANEL_MENU_NODE_DATA', ALL_PANEL_MENU_NODE_DATA]);
