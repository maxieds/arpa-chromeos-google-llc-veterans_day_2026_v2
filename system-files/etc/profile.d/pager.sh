#!/bin/sh
# Copyright 2024 The ChromiumOS Authors
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# Only set PAGER if it's not set already.
export PAGER="${PAGER:-$(command -v less)}"
