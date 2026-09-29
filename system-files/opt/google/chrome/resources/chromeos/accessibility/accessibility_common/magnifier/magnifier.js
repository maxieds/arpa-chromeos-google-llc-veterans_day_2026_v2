// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { AutomationPredicate } from '/common/automation_predicate.js';
import { ChromeEventHandler } from '/common/chrome_event_handler.js';
import { EventHandler } from '/common/event_handler.js';
import { FlagName, Flags } from '/common/flags.js';
import { RectUtil } from '/common/rect_util.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
var EventType = chrome.automation.EventType;
var RoleType = chrome.automation.RoleType;
/** Main class for the Chrome OS magnifier. */
export class Magnifier {
    type;
    /**
     * Whether focus following is enabled or not, based on
     * settings.a11y.screen_magnifier_focus_following preference.
     */
    screenMagnifierFocusFollowing_;
    /**
     * Whether ChromeVox focus following is enabled or not.
     * settings.a11y.screen_magnifier_chromevox_focus_following preference.
     */
    screenMagnifierFollowsChromeVox_ = true;
    /**
     * Whether Select to Speak focus following is enabled or not.
     * settings.a11y.screen_magnifier_select_to_speak_focus_following preference.
     */
    screenMagnifierFollowsSts_ = true;
    /**
     * Whether magnifier is currently initializing, and so should ignore
     * focus updates.
     */
    isInitializing_ = true;
    /** Last time mouse has moved (from last onMouseMovedOrDragged). */
    lastMouseMovedTime_;
    lastFocusSelectionOrCaretMove_;
    focusHandler_;
    activeDescendantHandler_;
    selectionHandler_;
    onCaretBoundsChangedHandler;
    onMagnifierBoundsChangedHandler_;
    onChromeVoxFocusChangedHandler_;
    onSelectToSpeakFocusChangedHandler_;
    updateFromPrefsHandler_;
    onMouseMovedHandler_;
    onMouseDraggedHandler_;
    lastChromeVoxBounds_;
    lastSelectToSpeakBounds_;
    onLoadDesktopCallbackForTest_;
    constructor(type) {
        this.type = type;
        this.focusHandler_ = new EventHandler([], EventType.FOCUS, event => this.onFocusOrSelectionChanged_(event));
        this.activeDescendantHandler_ = new EventHandler([], EventType.ACTIVE_DESCENDANT_CHANGED, event => this.onActiveDescendantChanged_(event));
        this.selectionHandler_ = new EventHandler([], EventType.SELECTION, event => this.onFocusOrSelectionChanged_(event));
        this.onCaretBoundsChangedHandler = new EventHandler([], EventType.CARET_BOUNDS_CHANGED, event => this.onCaretBoundsChanged(event));
        this.onMagnifierBoundsChangedHandler_ = new ChromeEventHandler(chrome.accessibilityPrivate.onMagnifierBoundsChanged, bounds => this.onMagnifierBoundsChanged_(bounds));
        this.onChromeVoxFocusChangedHandler_ = new ChromeEventHandler(chrome.accessibilityPrivate.onChromeVoxFocusChanged, bounds => this.onChromeVoxFocusChanged_(bounds));
        this.onSelectToSpeakFocusChangedHandler_ = new ChromeEventHandler(chrome.accessibilityPrivate.onSelectToSpeakFocusChanged, bounds => this.onSelectToSpeakFocusChanged_(bounds));
        this.updateFromPrefsHandler_ = new ChromeEventHandler(chrome.settingsPrivate.onPrefsChanged, prefs => this.updateFromPrefs_(prefs));
        this.onMouseMovedHandler_ = new EventHandler([], chrome.automation.EventType.MOUSE_MOVED, () => this.onMouseMovedOrDragged_());
        this.onMouseDraggedHandler_ = new EventHandler([], chrome.automation.EventType.MOUSE_DRAGGED, () => this.onMouseMovedOrDragged_());
        this.onLoadDesktopCallbackForTest_ = null;
        this.init_();
    }
    /** Destructor to remove listeners. */
    onMagnifierDisabled() {
        this.focusHandler_.stop();
        this.activeDescendantHandler_.stop();
        this.selectionHandler_.stop();
        this.onCaretBoundsChangedHandler.stop();
        this.onMagnifierBoundsChangedHandler_.stop();
        this.onChromeVoxFocusChangedHandler_.stop();
        this.onSelectToSpeakFocusChangedHandler_.stop();
        this.updateFromPrefsHandler_.stop();
        this.onMouseMovedHandler_.stop();
        this.onMouseDraggedHandler_.stop();
        this.lastMouseMovedTime_ = undefined;
        this.lastChromeVoxBounds_ = undefined;
        this.lastSelectToSpeakBounds_ = undefined;
        this.lastFocusSelectionOrCaretMove_ = undefined;
    }
    /** Initializes Magnifier. */
    init_() {
        chrome.settingsPrivate.getAllPrefs(prefs => this.updateFromPrefs_(prefs));
        this.updateFromPrefsHandler_.start();
        chrome.automation.getDesktop(desktop => {
            this.focusHandler_.setNodes(desktop);
            this.focusHandler_.start();
            this.activeDescendantHandler_.setNodes(desktop);
            this.activeDescendantHandler_.start();
            this.selectionHandler_.setNodes(desktop);
            this.selectionHandler_.start();
            this.onCaretBoundsChangedHandler.setNodes(desktop);
            this.onCaretBoundsChangedHandler.start();
            this.onMouseMovedHandler_.setNodes(desktop);
            this.onMouseMovedHandler_.start();
            this.onMouseDraggedHandler_.setNodes(desktop);
            this.onMouseDraggedHandler_.start();
            if (this.onLoadDesktopCallbackForTest_) {
                this.onLoadDesktopCallbackForTest_();
                this.onLoadDesktopCallbackForTest_ = null;
            }
        });
        this.onMagnifierBoundsChangedHandler_.start();
        this.onChromeVoxFocusChangedHandler_.start();
        this.onSelectToSpeakFocusChangedHandler_.start();
        chrome.accessibilityPrivate.enableMouseEvents(true);
        this.isInitializing_ = true;
        setTimeout(() => {
            this.isInitializing_ = false;
        }, Magnifier.IGNORE_FOCUS_UPDATES_INITIALIZATION_MS);
    }
    drawDebugRect_() {
        return Boolean(Flags.isEnabled(FlagName.MAGNIFIER_DEBUG_DRAW_RECT));
    }
    onMagnifierBoundsChanged_(bounds) {
        if (this.drawDebugRect_()) {
            chrome.accessibilityPrivate.setFocusRings([{
                    rects: [bounds],
                    type: chrome.accessibilityPrivate.FocusType.GLOW,
                    color: '#22d',
                }], chrome.accessibilityPrivate.AssistiveTechnologyType.MAGNIFIER);
        }
    }
    onChromeVoxFocusChanged_(bounds) {
        // Don't follow ChromeVox if focus following is off.
        if (!this.shouldFollowChromeVoxFocus()) {
            return;
        }
        // Don't follow ChromeVox focus if the mouse, keyboard focus or caret
        // has moved too recently.
        // TODO(b/259363112): Add a test for this.
        const now = new Date().getTime();
        if ((this.lastMouseMovedTime_ !== undefined &&
            now - this.lastMouseMovedTime_.getTime() <
                Magnifier.IGNORE_AT_UPDATES_AFTER_OTHER_MOVE_MS) ||
            (this.lastFocusSelectionOrCaretMove_ !== undefined &&
                now - this.lastFocusSelectionOrCaretMove_.getTime() <
                    Magnifier.IGNORE_AT_UPDATES_AFTER_OTHER_MOVE_MS)) {
            return;
        }
        // Ignore repeated updates from ChromeVox.
        if (bounds !== this.lastChromeVoxBounds_) {
            this.lastChromeVoxBounds_ = bounds;
            chrome.accessibilityPrivate.moveMagnifierToRect(bounds);
        }
    }
    onSelectToSpeakFocusChanged_(bounds) {
        // Don't follow select to speak if focus following is off.
        if (!this.shouldFollowStsFocus()) {
            return;
        }
        // Don't follow select to speak focus if the mouse, keyboard focus or caret
        // has moved too recently.
        // TODO(b/259363112): Add a test for this.
        const now = new Date().getTime();
        if ((this.lastMouseMovedTime_ !== undefined &&
            now - this.lastMouseMovedTime_.getTime() <
                Magnifier.IGNORE_AT_UPDATES_AFTER_OTHER_MOVE_MS) ||
            (this.lastFocusSelectionOrCaretMove_ !== undefined &&
                now - this.lastFocusSelectionOrCaretMove_.getTime() <
                    Magnifier.IGNORE_AT_UPDATES_AFTER_OTHER_MOVE_MS)) {
            return;
        }
        // Select to Speak refreshes the UI occasionally. We can
        // ignore repeated updates.
        if (bounds !== this.lastSelectToSpeakBounds_) {
            this.lastSelectToSpeakBounds_ = bounds;
            chrome.accessibilityPrivate.moveMagnifierToRect(bounds);
        }
    }
    /**
     * Sets |isInitializing_| inside tests to skip ignoring initial focus updates.
     */
    setIsInitializingForTest(isInitializing) {
        this.isInitializing_ = isInitializing;
    }
    /**
     * Sets |IGNORE_AT_UPDATES_AFTER_OTHER_MOVE_MS| inside tests to ensure all
     * automated input is received.
     */
    setIgnoreAssistiveTechnologyUpdatesAfterOtherMoveDurationForTest(duration) {
        Magnifier.IGNORE_AT_UPDATES_AFTER_OTHER_MOVE_MS = duration;
    }
    updateFromPrefs_(prefs) {
        prefs.forEach(pref => {
            switch (pref.key) {
                case Magnifier.Prefs.SCREEN_MAGNIFIER_CHROMEVOX_FOCUS_FOLLOWING:
                    this.screenMagnifierFollowsChromeVox_ = Boolean(pref.value);
                    break;
                case Magnifier.Prefs.SCREEN_MAGNIFIER_FOCUS_FOLLOWING:
                    this.screenMagnifierFocusFollowing_ = Boolean(pref.value);
                    break;
                case Magnifier.Prefs.SCREEN_MAGNIFIER_SELECT_TO_SPEAK_FOCUS_FOLLOWING:
                    this.screenMagnifierFollowsSts_ = Boolean(pref.value);
                    break;
                default:
                    return;
            }
        });
    }
    /**
     * Returns whether magnifier viewport should follow focus. Exposed for
     * testing.
     */
    shouldFollowFocus() {
        return Boolean(!this.isInitializing_ &&
            (this.type === Magnifier.Type.DOCKED ||
                this.type === Magnifier.Type.FULL_SCREEN &&
                    this.screenMagnifierFocusFollowing_));
    }
    shouldFollowChromeVoxFocus() {
        return !this.isInitializing_ && this.screenMagnifierFollowsChromeVox_;
    }
    shouldFollowStsFocus() {
        return !this.isInitializing_ && this.screenMagnifierFollowsSts_;
    }
    /**
     * Listener for when focus is updated. Moves magnifier to include focused
     * element in viewport.
     *
     * TODO(accessibility): There is a bit of magnifier shakiness on arrow down in
     * omnibox - probably focus following fighting with caret following - maybe
     * add timer for last focus event so that fast-following caret updates don't
     * shake screen.
     * TODO(accessibility): On page load, sometimes viewport moves to center of
     * webpage instead of spotlighting first focusable page element.
     */
    onFocusOrSelectionChanged_(event) {
        const node = event.target;
        if (!node.location || !this.shouldFollowFocus()) {
            return;
        }
        // TODO(b/267329383): Clean this up, since Number(undefined) is NaN, and
        // NaN should be avoided if possible.
        if (Number(new Date()) - Number(this.lastMouseMovedTime_) <
            Magnifier.IGNORE_FOCUS_UPDATES_AFTER_MOUSE_MOVE_MS) {
            return;
        }
        // Skip trying to move magnifier to encompass whole webpage or pdf. It's too
        // big, and magnifier usually ends up in middle at left edge of page.
        const isTooBig = AutomationPredicate.roles([RoleType.WEB_VIEW, RoleType.EMBEDDED_OBJECT]);
        if (node.isRootNode || isTooBig(node)) {
            return;
        }
        this.lastFocusSelectionOrCaretMove_ = new Date();
        chrome.accessibilityPrivate.moveMagnifierToRect(node.location);
    }
    /**
     * Listener for when active descendant is changed. Moves magnifier to include
     * active descendant in viewport.
     */
    onActiveDescendantChanged_(event) {
        const { activeDescendant } = event.target;
        if (!activeDescendant || !this.shouldFollowFocus()) {
            return;
        }
        const { location } = activeDescendant;
        if (!location) {
            return;
        }
        chrome.accessibilityPrivate.moveMagnifierToRect(location);
    }
    /**
     * Listener for when caret bounds have changed. Moves magnifier to include
     * caret in viewport.
     */
    onCaretBoundsChanged(event) {
        const { target } = event;
        if (!target || !target.caretBounds) {
            return;
        }
        // TODO(b/267329383): Clean this up, since Number(undefined) is NaN, and
        // NaN should be avoided if possible.
        if (Number(new Date()) - Number(this.lastMouseMovedTime_) <
            Magnifier.IGNORE_FOCUS_UPDATES_AFTER_MOUSE_MOVE_MS) {
            return;
        }
        // Note: onCaretBoundsChanged can get called when TextInputType is changed,
        // during which the caret bounds are set to an empty rect (0x0), and we
        // don't need to adjust the viewport position based on this bogus caret
        // position. This is only a transition period; the caret position will be
        // fixed upon focusing directly afterward.
        if (target.caretBounds.width === 0 && target.caretBounds.height === 0) {
            return;
        }
        this.lastFocusSelectionOrCaretMove_ = new Date();
        const caretBoundsCenter = RectUtil.center(target.caretBounds);
        chrome.accessibilityPrivate.magnifierCenterOnPoint(caretBoundsCenter);
    }
    /** Listener for when mouse moves or drags. */
    onMouseMovedOrDragged_() {
        this.lastMouseMovedTime_ = new Date();
    }
    /**
     * Used by C++ tests to ensure Magnifier load is competed.
     * @param callback Callback for when desktop is loaded from automation.
     */
    setOnLoadDesktopCallbackForTest(callback) {
        if (!this.focusHandler_.listening()) {
            this.onLoadDesktopCallbackForTest_ = callback;
            return;
        }
        // Desktop already loaded.
        callback();
    }
}
(function (Magnifier) {
    /** Magnifier types. */
    let Type;
    (function (Type) {
        Type["FULL_SCREEN"] = "fullScreen";
        Type["DOCKED"] = "docked";
    })(Type = Magnifier.Type || (Magnifier.Type = {}));
    /** Preferences that are configurable for Magnifier. */
    let Prefs;
    (function (Prefs) {
        Prefs["SCREEN_MAGNIFIER_FOCUS_FOLLOWING"] = "settings.a11y.screen_magnifier_focus_following";
        Prefs["SCREEN_MAGNIFIER_CHROMEVOX_FOCUS_FOLLOWING"] = "settings.a11y.screen_magnifier_chromevox_focus_following";
        Prefs["SCREEN_MAGNIFIER_SELECT_TO_SPEAK_FOCUS_FOLLOWING"] = "settings.a11y.screen_magnifier_select_to_speak_focus_following";
    })(Prefs = Magnifier.Prefs || (Magnifier.Prefs = {}));
    /**
     * Duration of time directly after startup of magnifier to ignore focus
     * updates, to prevent the magnified region from jumping.
     */
    Magnifier.IGNORE_FOCUS_UPDATES_INITIALIZATION_MS = 500;
    /**
     * Duration of time directly after a mouse move or drag to ignore focus
     * updates, to prevent the magnified region from jumping.
     */
    Magnifier.IGNORE_FOCUS_UPDATES_AFTER_MOUSE_MOVE_MS = 250;
    /**
     * Duration of time directly after a mouse move or drag to ignore focus
     * updates from assistive technologies like Select to Speak and ChromeVox, to
     * prevent the magnified region from jumping.
     */
    Magnifier.IGNORE_AT_UPDATES_AFTER_OTHER_MOVE_MS = 1500;
})(Magnifier || (Magnifier = {}));
TestImportManager.exportForTesting(Magnifier);
