// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview The modes that the Chromevox panel can be in.
 */
export var PanelMode;
(function (PanelMode) {
    PanelMode["COLLAPSED"] = "collapsed";
    PanelMode["FOCUSED"] = "focused";
    PanelMode["FULLSCREEN_MENUS"] = "menus";
    PanelMode["FULLSCREEN_TUTORIAL"] = "tutorial";
    PanelMode["SEARCH"] = "search";
})(PanelMode || (PanelMode = {}));
export const PanelModeInfo = {
    [PanelMode.COLLAPSED]: { title: 'panel_title', location: '#' },
    [PanelMode.FOCUSED]: { title: 'panel_title', location: '#focus' },
    [PanelMode.FULLSCREEN_MENUS]: { title: 'panel_menus_title', location: '#fullscreen' },
    [PanelMode.FULLSCREEN_TUTORIAL]: { title: 'panel_tutorial_title', location: '#fullscreen' },
    [PanelMode.SEARCH]: { title: 'panel_title', location: '#focus' },
};
