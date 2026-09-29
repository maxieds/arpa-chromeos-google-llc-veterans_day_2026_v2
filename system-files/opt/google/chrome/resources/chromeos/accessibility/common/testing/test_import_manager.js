// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * Class to manage imports for tests within the js2gtest framework. The
 * framework does not allow for static import statements, and Service Workers
 * (required for manifest v3) do not allow dynamic import statements. Therefore
 * this custom solution is needed.
 */
export class TestImportManager {
    static exports_ = [];
    /**
     * Functions and classes are passed directly as arguments.
     * Other values are passed as a tuple, i.e. [name, value].
     */
    static exportForTesting(...exports) {
        TestImportManager.exports_ = TestImportManager.exports_.concat(exports);
    }
    static getImports() {
        const exports = {};
        for (const exportValue of TestImportManager.exports_) {
            if (typeof exportValue === 'function') {
                exports[exportValue.name] = exportValue;
            }
            else if (exportValue instanceof Array) {
                exports[exportValue[0]] = exportValue[1];
            }
            else {
                console.warn('invalid test import:', exportValue);
            }
        }
        return exports;
    }
}
globalThis.TestImportManager = TestImportManager;
