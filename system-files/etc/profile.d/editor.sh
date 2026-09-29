#!/bin/sh
# Copyright 2024 The ChromiumOS Authors
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

if [ "${EDITOR:+set}" != "set" ]; then
  EDITOR=$(
    # Ordered list of editors to check, based on user-experience.
    for editor in vim vi nano; do
      command -v "${editor}" && break
    done
  )
  export EDITOR
fi
