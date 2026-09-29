// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Augments chrome.automation.RoleType with abstract types for
 * ChromeVox.
 */
export var AbstractRole;
(function (AbstractRole) {
    AbstractRole["CONTAINER"] = "abstractContainer";
    AbstractRole["FORM_FIELD_CONTAINER"] = "abstractFormFieldContainer";
    AbstractRole["ITEM"] = "abstractItem";
    AbstractRole["LIST"] = "abstractList";
    AbstractRole["NAME_FROM_CONTENTS"] = "abstractNameFromContents";
    AbstractRole["RANGE"] = "abstractRange";
    AbstractRole["SPAN"] = "abstractSpan";
})(AbstractRole || (AbstractRole = {}));
export var CustomRole;
(function (CustomRole) {
    CustomRole["DEFAULT"] = "default";
    CustomRole["NO_ROLE"] = "noRole";
})(CustomRole || (CustomRole = {}));
