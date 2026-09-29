// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/** Minimum time duration for a gesture to be recognized. */
const DEFAULT_MINIMUM_DURATION_MS = 150;
/** Minimum repeat rate of a gesture. */
const DEFAULT_REPEAT_DELAY_MS = 1000;
export class GestureTimer {
    repeatDelayMs_ = DEFAULT_REPEAT_DELAY_MS;
    minDurationMs_ = DEFAULT_MINIMUM_DURATION_MS;
    gestureStart_ = new Map();
    gestureLastRecognized_ = new Map();
    useGestureDuration_ = true;
    /**
     * Mark that the gesture has been detected at the given time stamp. If the
     * gesture has already been marked as started then this timestamp is ignored.
     */
    mark(gesture, timestamp) {
        if (!this.gestureStart_.has(gesture)) {
            this.gestureStart_.set(gesture, timestamp);
        }
    }
    /** Get the timestamp of the last time this gesture was recognized. */
    getLastRecognized(gesture) {
        return this.gestureLastRecognized_.get(gesture);
    }
    /** Set the timestamp of the last time this gesture was recognized. */
    setLastRecognized(gesture, timestamp) {
        this.gestureLastRecognized_.set(gesture, timestamp);
    }
    /** Reset the timer for the given gesture. */
    resetTimer(gesture) {
        this.gestureStart_.delete(gesture);
    }
    /** Reset the timer for all gestures. */
    resetAll() {
        this.gestureStart_.clear();
        this.gestureLastRecognized_.clear();
    }
    /**
     * Return true if the minimum repeat delay has elapsed since the given gesture
     * was last recognized.
     */
    isRepeatDelayValid(gesture, timestamp) {
        const lastRecognized = this.gestureLastRecognized_.get(gesture);
        if (!lastRecognized) {
            return true;
        }
        return timestamp.getTime() - lastRecognized.getTime() >=
            this.repeatDelayMs_;
    }
    /**
     * Return true if this gesture has been held for a valid duration in relation
     * to the given timestamp.
     */
    isDurationValid(gesture, timestamp) {
        if (!this.useGestureDuration_) {
            return true;
        }
        const startTime = this.gestureStart_.get(gesture);
        // If there is no start timestamp, then the duration is not valid.
        if (!startTime) {
            return false;
        }
        return timestamp.getTime() - startTime.getTime() > this.minDurationMs_;
    }
    // For testing purposes, we want to allow gestures to be recognized instantly
    // without requiring a valid duration.
    setGestureDurationForTesting(useDuration) {
        this.useGestureDuration_ = useDuration;
    }
}
