// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Manages opening and closing the live caption bubble, as well
 * as moving ChromeVox focus to the bubble when it appears and restoring focus
 * when it goes away.
 */
import { CursorRange } from '/common/cursors/range.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { SettingsManager } from '../common/settings_manager.js';
import { ChromeVoxRange } from './chromevox_range.js';
import { Output } from './output/output.js';
var EventType = chrome.automation.EventType;
export class CaptionsHandler {
    static instance;
    inCaptions_ = false;
    previousFocus_ = null;
    previousPrefState_;
    waitingForCaptions_ = false;
    captionsLabel_ = null;
    boundOnCaptionsLabelChanged_ = null;
    // Max lines of captions to keep around.
    static MAX_LINES = 100;
    // Captions line buffer.
    captionLines_ = [];
    // Tracks the last data sent to the Braille display.
    lastOutput_ = {
        lineIndex: -1,
        start: -1,
        end: -1,
    };
    static init() {
        CaptionsHandler.instance = new CaptionsHandler();
    }
    static open() {
        CaptionsHandler.instance.saveLiveCaptionValue_();
        if (CaptionsHandler.instance.isLiveCaptionEnabled_()) {
            CaptionsHandler.instance.tryJumpToCaptionBubble_();
        }
        else {
            CaptionsHandler.instance.enableLiveCaption_();
        }
    }
    static close() {
        CaptionsHandler.instance.resetLiveCaption_();
        CaptionsHandler.instance.onExitCaptions_();
    }
    static inCaptions() {
        return CaptionsHandler.instance.inCaptions_;
    }
    // Returns true if the alert was handled and the default handing should be
    // skipped, false otherwise.
    maybeHandleAlert(event) {
        if (!this.waitingForCaptions_) {
            // Filter out captions bubble dialog alert and announcement when this is
            // in the bubble. Otherwise, the alert overwrites the braille output.
            if (this.inCaptions_ && this.captionsLabel_ &&
                (this.captionsLabel_ === this.tryFindCaptions_(event.target) ||
                    (event.target.parent &&
                        this.captionsLabel_ ===
                            this.tryFindCaptions_(event.target.parent)))) {
                return true;
            }
            return false;
        }
        const captionsLabel = this.tryFindCaptions_(event.target);
        if (!captionsLabel) {
            return false;
        }
        this.waitingForCaptions_ = false;
        this.jumpToCaptionBubble_(captionsLabel);
        return true;
    }
    // ChromeVoxRangeObserver implementation.
    onCurrentRangeChanged(range) {
        if (!range) {
            return;
        }
        const currentNode = range.start.node;
        if (currentNode.className !== CAPTION_BUBBLE_LABEL) {
            this.onExitCaptions_();
        }
        else {
            this.startObserveCaptions_(currentNode);
        }
    }
    /** This function assumes the preference for live captions is false. */
    enableLiveCaption_() {
        this.waitingForCaptions_ = true;
        chrome.accessibilityPrivate.enableLiveCaption(true);
    }
    isLiveCaptionEnabled_() {
        return SettingsManager.getBoolean('accessibility.captions.live_caption_enabled', /*isChromeVox=*/ false);
    }
    jumpToCaptionBubble_(captionsLabel) {
        this.previousFocus_ = ChromeVoxRange.current;
        this.onEnterCaptions_();
        ChromeVoxRange.navigateTo(CursorRange.fromNode(captionsLabel), 
        /*focus=*/ true, /*speechProps=*/ undefined, 
        /*skipSettingSelection=*/ undefined, 
        /*skipOutput=*/ true);
    }
    onEnterCaptions_() {
        this.inCaptions_ = true;
        ChromeVoxRange.addObserver(this);
    }
    onExitCaptions_() {
        this.inCaptions_ = false;
        ChromeVoxRange.removeObserver(this);
        this.stopObserveCaptions_();
        this.restoreFocus_();
    }
    resetLiveCaption_() {
        // Don't disable live captions if they were enabled before we began.
        if (this.previousPrefState_) {
            return;
        }
        chrome.accessibilityPrivate.enableLiveCaption(false);
    }
    restoreFocus_() {
        if (!this.previousFocus_) {
            return;
        }
        ChromeVoxRange.navigateTo(this.previousFocus_);
    }
    saveLiveCaptionValue_() {
        this.previousPrefState_ = this.isLiveCaptionEnabled_();
    }
    tryFindCaptions_(node) {
        return node.find({ attributes: { className: CAPTION_BUBBLE_LABEL } });
    }
    /**
     * Attempts to locate the caption bubble in the accessibility tree. If found,
     * moves focus there.
     */
    async tryJumpToCaptionBubble_() {
        const desktop = await new Promise(resolve => chrome.automation.getDesktop(resolve));
        const captionsLabel = this.tryFindCaptions_(desktop);
        if (!captionsLabel) {
            return;
        }
        this.jumpToCaptionBubble_(captionsLabel);
    }
    /** Starts to observe live caption label. */
    startObserveCaptions_(captionsLabel) {
        this.captionsLabel_ = captionsLabel;
        if (!this.boundOnCaptionsLabelChanged_) {
            this.boundOnCaptionsLabelChanged_ = () => this.onCaptionsLabelChanged_();
        }
        this.captionsLabel_.addEventListener(EventType.TEXT_CHANGED, this.boundOnCaptionsLabelChanged_, true);
        this.updateCaptions_();
    }
    /** Stops observing live caption label. */
    stopObserveCaptions_() {
        if (!this.captionsLabel_) {
            return;
        }
        this.captionLines_ = [];
        this.resetLastOutput_();
        this.captionsLabel_.removeEventListener(EventType.TEXT_CHANGED, this.boundOnCaptionsLabelChanged_, true);
        this.captionsLabel_ = null;
    }
    /** Invoked when captions label is changed. */
    onCaptionsLabelChanged_() {
        this.updateCaptions_();
    }
    /**
     * Extracts the caption lines from captions bubble and merges with the line
     * buffer.
     */
    updateCaptions_() {
        if (!this.captionsLabel_) {
            return;
        }
        let currentLines = [];
        for (let i = 0, child; child = this.captionsLabel_.children[i]; ++i) {
            if (child.name) {
                currentLines.push(child.name);
            }
        }
        this.mergeLines_(currentLines);
    }
    /** Merge the current lines in caption bubble with the line buffer. */
    mergeLines_(currentLines) {
        // Finds an insertion point to update the line buffer.
        const fullMatchFirstLine = this.captionLines_.lastIndexOf(currentLines[0]);
        if (fullMatchFirstLine !== -1) {
            // If first line of `currentLines` is found, copy `currentLines` at the
            // index.
            this.captionLines_.splice(fullMatchFirstLine, this.captionLines_.length - fullMatchFirstLine, ...currentLines);
        }
        else if (currentLines.length === 1 || this.captionLines_.length === 1) {
            // If buffer is initiating, just copying over. Reset tracking if
            // `currentLines` is not relevant.
            if (this.lastOutput_.lineIndex !== -1) {
                let lastOutputText = this.captionLines_[this.lastOutput_.lineIndex].substring(this.lastOutput_.start, this.lastOutput_.end);
                if (currentLines[0].indexOf(lastOutputText) === -1) {
                    this.resetLastOutput_();
                }
            }
            this.captionLines_ = [...currentLines];
        }
        else {
            // Otherwise, restart tracking.
            this.captionLines_ = [...currentLines];
            this.resetLastOutput_();
        }
        // Trim when the line buffer is more than MAX_LINES.
        while (this.captionLines_.length > CaptionsHandler.MAX_LINES) {
            this.captionLines_.shift();
            this.lastOutput_.lineIndex--;
        }
        if (this.lastOutput_.lineIndex < 0) {
            this.resetLastOutput_();
        }
        if (this.lastOutput_.lineIndex === -1 && this.captionLines_.length > 0) {
            this.output_(0);
        }
    }
    /** Reset output tracking */
    resetLastOutput_() {
        this.lastOutput_ = {
            lineIndex: -1,
            start: -1,
            end: -1,
        };
    }
    /** Outputs the given line. */
    output_(index, start, end) {
        let text = this.captionLines_[index];
        this.lastOutput_.lineIndex = index;
        this.lastOutput_.start = start ?? 0;
        this.lastOutput_.end = end ?? text.length;
        new Output()
            .withString(text.substring(this.lastOutput_.start, this.lastOutput_.end))
            .go();
    }
    /** Output the previous line if there is one. */
    previous() {
        if (this.lastOutput_.lineIndex == -1) {
            return;
        }
        // If the last output is in middle of the line, restart from the beginning.
        if (this.lastOutput_.start != 0) {
            this.output_(this.lastOutput_.lineIndex, 0);
            return;
        }
        // No more previous lines.
        if (this.lastOutput_.lineIndex == 0) {
            return;
        }
        this.output_(this.lastOutput_.lineIndex - 1);
    }
    /** Output the next line if there is one. */
    next() {
        if (this.lastOutput_.lineIndex == -1) {
            return;
        }
        // If the last output is not at the end, start from where it stops.
        if (this.captionLines_[this.lastOutput_.lineIndex].length >
            this.lastOutput_.end) {
            this.output_(this.lastOutput_.lineIndex, this.lastOutput_.end);
            return;
        }
        // No more next lines.
        if (this.lastOutput_.lineIndex == this.captionLines_.length - 1) {
            return;
        }
        this.output_(this.lastOutput_.lineIndex + 1);
    }
}
const CAPTION_BUBBLE_LABEL = 'CaptionBubbleLabel';
TestImportManager.exportForTesting(CaptionsHandler);
