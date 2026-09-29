// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Defines a Tts interface.
 * All TTS engines in ChromeVox conform to the this interface.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
/**
 * An interface for clients who want to get notified when an utterance
 * starts or ends from any source.
 */
export class TtsCapturingEventListener {
}
/** @interface */
export class TtsInterface {
}
TestImportManager.exportForTesting(TtsInterface);
