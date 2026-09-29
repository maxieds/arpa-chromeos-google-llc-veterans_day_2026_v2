#!/bin/sh
# Copyright 2022 The ChromiumOS Authors
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

config_file="/run/camera/camera_config.json"
default_config_file="/etc/camera/camera_config_default.json"

model=$(cros_config / name)
file="/etc/camera/camera_config_"${model}".json"
if [ -f "${file}" ]; then
  ln -sf "${file}" "${config_file}"
else
  ln -sf "${default_config_file}" "${config_file}"
fi
