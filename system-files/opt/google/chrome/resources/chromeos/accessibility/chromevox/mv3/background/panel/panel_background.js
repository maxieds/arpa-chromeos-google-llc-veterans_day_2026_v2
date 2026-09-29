// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Handles logic for the ChromeVox panel that requires state from
 * the background context.
 */
import { AsyncUtil } from '/common/async_util.js';
import { BridgeHelper } from '/common/bridge_helper.js';
import { CursorRange } from '/common/cursors/range.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { BridgeConstants } from '../../common/bridge_constants.js';
import { EarconId } from '../../common/earcon_id.js';
import { PanelBridge } from '../../common/panel_bridge.js';
import { ALL_PANEL_MENU_NODE_DATA } from '../../common/panel_menu_data.js';
import { QueueMode } from '../../common/tts_types.js';
import { ChromeVox } from '../chromevox.js';
import { ChromeVoxRange } from '../chromevox_range.js';
import { Output } from '../output/output.js';
import { OutputCustomEvent } from '../output/output_types.js';
import { ISearch } from './i_search.js';
import { PanelNodeMenuBackground } from './panel_node_menu_background.js';
const EventType = chrome.automation.EventType;
const TARGET = BridgeConstants.PanelBackground.TARGET;
const Action = BridgeConstants.PanelBackground.Action;
export class PanelBackground {
    iSearch_ = null;
    menusLoaded_ = Promise.resolve();
    savedNode_;
    resolvePanelCollapsed_;
    tutorialReadyCallback;
    tutorialReadyForTesting = false;
    static instance;
    static rangeObserver_;
    constructor() { }
    static init() {
        if (PanelBackground.instance) {
            throw 'Trying to create two copies of singleton PanelBackground';
        }
        PanelBackground.instance = new PanelBackground();
        PanelBackground.rangeObserver_ = new PanelRangeObserver();
        ChromeVoxRange.addObserver(PanelBackground.rangeObserver_);
        BridgeHelper.registerHandler(TARGET, Action.CLEAR_SAVED_NODE, () => PanelBackground.instance.clearSavedNode_());
        BridgeHelper.registerHandler(TARGET, Action.CREATE_ALL_NODE_MENU_BACKGROUNDS, (activateMenuTitle) => PanelBackground.instance.createAllNodeMenuBackgrounds_(activateMenuTitle));
        BridgeHelper.registerHandler(TARGET, Action.CREATE_NEW_I_SEARCH, () => PanelBackground.instance.createNewISearch_());
        BridgeHelper.registerHandler(TARGET, Action.DESTROY_I_SEARCH, () => PanelBackground.instance.destroyISearch_());
        BridgeHelper.registerHandler(TARGET, Action.GET_ACTIONS_FOR_CURRENT_NODE, () => PanelBackground.instance.getActionsForCurrentNode_());
        BridgeHelper.registerHandler(TARGET, Action.INCREMENTAL_SEARCH, (searchStr, dir, nextObject) => PanelBackground.instance.incrementalSearch_(searchStr, dir, nextObject));
        BridgeHelper.registerHandler(TARGET, Action.ON_TUTORIAL_READY, () => PanelBackground.instance.onTutorialReady_());
        BridgeHelper.registerHandler(TARGET, Action.PERFORM_CUSTOM_ACTION_ON_CURRENT_NODE, (actionId) => PanelBackground.instance.performCustomActionOnCurrentNode_(actionId));
        BridgeHelper.registerHandler(TARGET, Action.PERFORM_STANDARD_ACTION_ON_CURRENT_NODE, (action) => PanelBackground.instance.performStandardActionOnCurrentNode_(action));
        BridgeHelper.registerHandler(TARGET, Action.SAVE_CURRENT_NODE, () => PanelBackground.instance.saveCurrentNode_());
        BridgeHelper.registerHandler(TARGET, Action.SET_PANEL_COLLAPSE_WATCHER, () => PanelBackground.instance.setPanelCollapseWatcher_());
        BridgeHelper.registerHandler(TARGET, Action.SET_RANGE_TO_I_SEARCH_NODE, () => PanelBackground.instance.setRangeToISearchNode_());
        BridgeHelper.registerHandler(TARGET, Action.WAIT_FOR_PANEL_COLLAPSE, () => PanelBackground.instance.waitForPanelCollapse_());
    }
    /**
     * Waits for menus that have already started loading to finish.
     * If menus have not started loading, resolves immediately.
     */
    static waitForMenusLoaded() {
        return PanelBackground.instance?.menusLoaded_ ?? Promise.resolve();
    }
    clearSavedNode_() {
        this.savedNode_ = null;
    }
    /**
     * @param activateMenuTitleId Optional string specifying the activated menu.
     */
    createAllNodeMenuBackgrounds_(activateMenuTitleId) {
        if (!this.savedNode_) {
            return;
        }
        const promises = [];
        for (const data of ALL_PANEL_MENU_NODE_DATA) {
            const isActivatedMenu = activateMenuTitleId === data.titleId;
            const menuBackground = new PanelNodeMenuBackground(data, this.savedNode_, isActivatedMenu);
            menuBackground.populate();
            promises.push(menuBackground.waitForFinish());
        }
        this.menusLoaded_ = Promise.all(promises);
    }
    /**
     * Creates a new ISearch object, ready to search starting from the current
     * ChromeVox focus.
     */
    createNewISearch_() {
        if (this.iSearch_) {
            this.iSearch_.clear();
        }
        // TODO(accessibility): not sure if this actually works anymore since all
        // the refactoring.
        if (!ChromeVoxRange.current || !ChromeVoxRange.current.start) {
            return;
        }
        this.iSearch_ = new ISearch(ChromeVoxRange.current.start);
        this.iSearch_.handler = this;
    }
    /** Destroy the ISearch object so it can be garbage collected. */
    destroyISearch_() {
        // TODO(b/314203187): Not null asserted, check that this is correct.
        this.iSearch_.handler = null;
        this.iSearch_ = null;
    }
    getActionsForCurrentNode_() {
        const result = {
            standardActions: [],
            customActions: [],
        };
        if (!this.savedNode_) {
            return result;
        }
        if (this.savedNode_.standardActions) {
            result.standardActions = this.savedNode_.standardActions;
        }
        if (this.savedNode_.customActions) {
            result.customActions = this.savedNode_.customActions;
        }
        return result;
    }
    incrementalSearch_(searchStr, dir, nextObject) {
        if (!this.iSearch_) {
            console.error('Trying to search when no ISearch has been created');
            return;
        }
        this.iSearch_.search(searchStr, dir, nextObject);
    }
    onTutorialReady_() {
        this.tutorialReadyForTesting = true;
        if (this.tutorialReadyCallback) {
            this.tutorialReadyCallback();
        }
    }
    performCustomActionOnCurrentNode_(actionId) {
        if (this.savedNode_) {
            this.savedNode_.performCustomAction(actionId);
        }
    }
    performStandardActionOnCurrentNode_(action) {
        if (this.savedNode_) {
            this.savedNode_.performStandardAction(action);
        }
    }
    /** Sets the current ChromeVox focus to the current ISearch node. */
    setRangeToISearchNode_() {
        if (!this.iSearch_) {
            console.error('Setting range to ISearch node when no ISearch in progress');
            return;
        }
        const node = this.iSearch_.cursor.node;
        if (!node) {
            return;
        }
        ChromeVoxRange.navigateTo(CursorRange.fromNode(node));
    }
    /** ISearchHandler implementation */
    onSearchReachedBoundary(boundaryNode) {
        this.iSearchOutput_(boundaryNode);
        ChromeVox.earcons.playEarcon(EarconId.WRAP);
    }
    /** ISearchHandler implementation */
    onSearchResultChanged(node, start, end) {
        this.iSearchOutput_(node, start, end);
    }
    iSearchOutput_(node, start, end) {
        Output.forceModeForNextSpeechUtterance(QueueMode.FLUSH);
        const o = new Output();
        if (start && end) {
            // TODO(b/314203187): Not null asserted, check that this is correct.
            o.withString([
                node.name.substr(0, start),
                node.name.substr(start, end - start),
                node.name.substr(end),
            ].join(', '));
            o.format('$role', node);
        }
        else {
            o.withRichSpeechAndBraille(CursorRange.fromNode(node), undefined, OutputCustomEvent.NAVIGATE);
        }
        o.go();
        ChromeVoxRange.set(CursorRange.fromNode(node));
    }
    /** Adds an event listener to detect panel collapse. */
    async setPanelCollapseWatcher_() {
        const desktop = await AsyncUtil.getDesktop();
        let notifyPanelCollapsed;
        this.resolvePanelCollapsed_ = new Promise(resolve => {
            notifyPanelCollapsed = resolve;
        });
        const onFocus = (event) => {
            if (event.target.docUrl &&
                event.target.docUrl.includes('chromevox/mv3/panel')) {
                return;
            }
            desktop.removeEventListener(EventType.FOCUS, onFocus, true);
            desktop.removeEventListener(EventType.BLUR, onBlur, true);
            // Clears focus on the page by focusing the root explicitly. This makes
            // sure we don't get future focus events as a result of giving this
            // entire page focus (which would interfere with our desired range).
            if (event.target.root) {
                event.target.root.focus();
            }
            notifyPanelCollapsed();
        };
        const onBlur = (event) => {
            if (!event.target.docUrl ||
                !event.target.docUrl.includes('chromevox/mv3/panel')) {
                return;
            }
            desktop.removeEventListener(EventType.BLUR, onBlur, true);
            desktop.removeEventListener(EventType.FOCUS, onFocus, true);
            notifyPanelCollapsed();
        };
        desktop.addEventListener(EventType.BLUR, onBlur, true);
        desktop.addEventListener(EventType.FOCUS, onFocus, true);
    }
    saveCurrentNode_() {
        if (ChromeVoxRange.current) {
            this.savedNode_ = ChromeVoxRange.current.start.node;
        }
    }
    /** Wait for the promise to notify panel collapse to resolved. */
    async waitForPanelCollapse_() {
        return this.resolvePanelCollapsed_;
    }
}
class PanelRangeObserver {
    /** ChromeVoxRangeObserver implementation */
    onCurrentRangeChanged(_range, _fromEditing) {
        PanelBridge.onCurrentRangeChanged();
    }
}
TestImportManager.exportForTesting(PanelBackground);
