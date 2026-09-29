// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { LocalStorage } from '/common/local_storage.js';
import { TestImportManager } from '/common/testing/test_import_manager.js';
/**
 * Base class for implementing earcons.
 * When adding earcons, please add them to chromevox/mv3/common/earcon_id.js.
 */
export class AbstractEarcons {
    /**
     * Whether or not earcons are available.
     * @return True if earcons are available.
     */
    earconsAvailable() {
        return true;
    }
    /**
     * Whether or not earcons are enabled.
     * @return True if earcons are enabled.
     */
    get enabled() {
        return LocalStorage.getBoolean('earcons');
    }
    /**
     * Set whether or not earcons are enabled.
     * @param value True turns on earcons, false turns off earcons.
     */
    set enabled(value) {
        LocalStorage.set('earcons', value);
    }
}
TestImportManager.exportForTesting(AbstractEarcons);
