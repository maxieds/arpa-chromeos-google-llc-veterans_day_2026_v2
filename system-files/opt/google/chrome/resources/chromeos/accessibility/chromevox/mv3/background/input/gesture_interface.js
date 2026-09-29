// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/** Interface to facilitate access and setting of gesture granularity. */
export class GestureInterface {
    static getGranularity() {
        if (GestureInterface.granularityGetter) {
            return GestureInterface.granularityGetter();
        }
        else {
            throw new Error('GestureInterface not initialized before access.');
        }
    }
    static setGranularity(granularity) {
        if (GestureInterface.granularitySetter) {
            GestureInterface.granularitySetter(granularity);
        }
        else {
            throw new Error('GestureInterface not initialized before setting a value.');
        }
    }
    static granularityGetter = null;
    static granularitySetter = null;
}
