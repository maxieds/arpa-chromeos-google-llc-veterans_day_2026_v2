// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Provides an interface for other renderers to communicate with
 * the ChromeVox panel.
 */
import { BridgeHelper } from '/common/bridge_helper.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { BridgeConstants } from './bridge_constants.js';
const PanelTarget = BridgeConstants.Panel.TARGET;
const PanelAction = BridgeConstants.Panel.Action;
const PanelTestTarget = BridgeConstants.PanelTest.TARGET;
const PanelTestAction = BridgeConstants.PanelTest.Action;
export class PanelBridge {
    static addMenuItem(itemData) {
        return BridgeHelper.sendMessage(PanelTarget, PanelAction.ADD_MENU_ITEM, itemData);
    }
    static async onCurrentRangeChanged() {
        return BridgeHelper.sendMessage(PanelTarget, PanelAction.ON_CURRENT_RANGE_CHANGED);
    }
    static execCommand(panelCommand) {
        return BridgeHelper.sendMessage(PanelTarget, PanelAction.EXEC_COMMAND, { type: panelCommand.type, data: panelCommand.data });
    }
    static braillePanLeftForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.BRAILLE_PAN_LEFT);
    }
    static braillePanRightForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.BRAILLE_PAN_RIGHT);
    }
    static disableMessagesForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.DISABLE_ERROR_MSG);
    }
    static disableTutorialRestartNudges() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.DISABLE_TUTORIAL_RESTART_NUDGES);
    }
    static fireMockEventForTest(key) {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.FIRE_MOCK_EVENT, key);
    }
    static fireMockQueryForTest(query) {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.FIRE_MOCK_QUERY, query);
    }
    static getActiveMenuDataForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_ACTIVE_MENU_DATA);
    }
    static getActiveSearchMenuDataForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_ACTIVE_SEARCH_MENU_DATA);
    }
    static getTutorialActiveLessonIndex() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_TUTORIAL_ACTIVE_LESSON_INDEX);
    }
    static getTutorialActiveScreen() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_TUTORIAL_ACTIVE_SCREEN);
    }
    static getTutorialInteractiveMode() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_TUTORIAL_INTERACTIVE_MODE);
    }
    static getTutorialReadyForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_TUTORIAL_READY);
    }
    static getForcedActionPathCreatedCountForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_FORCED_ACTION_PATH_CREATED_COUNT);
    }
    static getForcedActionPathDestroyedCountForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_FORCED_ACTION_PATH_DESTROYED_COUNT);
    }
    static getIsForcedActionPathActiveForTest() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GET_IS_FORCED_ACTION_PATH_ACTIVE);
    }
    static giveTutorialNudge() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.GIVE_TUTORIAL_NUDGE);
    }
    static initializeTutorialNudges(context) {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.INITIALIZE_TUTORIAL_NUDGES, context);
    }
    static restartTutorialNudges() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.RESTART_TUTORIAL_NUDGES);
    }
    static setTutorialCurriculum(curriculum) {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.SET_TUTORIAL_CURRICULUM, curriculum);
    }
    static setTutorialMedium(medium) {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.SET_TUTORIAL_MEDIUM, medium);
    }
    static showTutorialLesson(lessonNum) {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.SHOW_TUTORIAL_LESSON, lessonNum);
    }
    static showTutorialLessonMenu() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.SHOW_TUTORIAL_LESSON_MENU);
    }
    static showTutorialMainMenu() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.SHOW_TUTORIAL_MAIN_MENU);
    }
    static showTutorialNextLesson() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.SHOW_TUTORIAL_NEXT_LESSON);
    }
    static swapForcedActionPathMethodsForTesting() {
        return BridgeHelper.sendMessage(PanelTestTarget, PanelTestAction.SWAP_FORCED_ACTION_PATH_METHODS);
    }
}
TestImportManager.exportForTesting(PanelBridge);
