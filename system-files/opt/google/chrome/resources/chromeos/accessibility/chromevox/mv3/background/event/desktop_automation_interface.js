// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Interface to prevent circular dependencies.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { BaseAutomationHandler } from './base_automation_handler.js';
export class DesktopAutomationInterface extends BaseAutomationHandler {
}
(function (DesktopAutomationInterface) {
})(DesktopAutomationInterface || (DesktopAutomationInterface = {}));
TestImportManager.exportForTesting(DesktopAutomationInterface);
