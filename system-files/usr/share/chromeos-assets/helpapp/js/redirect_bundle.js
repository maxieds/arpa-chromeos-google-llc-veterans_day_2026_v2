/**
 * Copyright 2022 The Chromium OS Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */
/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
'use strict';var b=new URLSearchParams(window.location.search);function c(a,d={}){a&&(a=new URLSearchParams({...d,id:a}),window.location="/article.html?"+a.toString())}"/main.html"==window.location.pathname?c(b.get("answer")):"/oobe.html"==window.location.pathname&&c(b.get("id"),{striplink:!0});
