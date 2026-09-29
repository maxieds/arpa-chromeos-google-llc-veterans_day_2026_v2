// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview This class provides a stable interface for initializing,
 * querying, and modifying a ChromeVox key map.
 *
 * An instance contains an object-based bi-directional mapping from key binding
 * to a function name of a user command (herein simply called a command).
 * A caller is responsible for providing a JSON keymap (a simple Object key
 * value structure), which has (key, command) key value pairs.
 *
 * To retrieve static data about user commands, see CommandStore.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { CommandStore } from './command_store.js';
export class KeyMap {
    /** An array of bindings - Commands and KeySequences. */
    bindings_;
    /**
     * Maps a command to a key. This optimizes the process of searching for a
     * key sequence when you already know the command.
     */
    commandToKey_ = {};
    static instance;
    constructor(keyBindings) {
        this.bindings_ = keyBindings;
        this.buildCommandToKey_();
    }
    /**
     * The number of mappings in the keymap.
     * @return The number of mappings.
     */
    length() {
        return this.bindings_.length;
    }
    /**
     * Returns a copy of all KeySequences in this map.
     * @return Array of all keys.
     */
    keys() {
        return this.bindings_.map(binding => binding.sequence);
    }
    /** Returns a shallow copy of the Command, KeySequence bindings. */
    bindings() {
        return this.bindings_.slice();
    }
    /** Checks if this key map has a given binding. */
    hasBinding(command, sequence) {
        if (this.commandToKey_ != null) {
            return this.commandToKey_[command] === sequence;
        }
        return this.bindings_.some(b => b.command === command && b.sequence.equals(sequence));
    }
    /** Checks if this key map has a given command. */
    hasCommand(command) {
        if (this.commandToKey_ != null) {
            return this.commandToKey_[command] !== undefined;
        }
        return this.bindings_.some(b => b.command === command);
    }
    /** Checks if this key map has a given key. */
    hasKey(key) {
        return this.bindings_.some(b => b.sequence.equals(key));
    }
    /** Gets a command given a key. */
    commandForKey(key) {
        return this.bindings_.find(b => b.sequence.equals(key))?.command;
    }
    /** Gets a key given a command. */
    keyForCommand(command) {
        if (this.commandToKey_ != null) {
            // TODO(b/314203187): Not null asserted, check that this is correct.
            return [this.commandToKey_[command]];
        }
        return this.bindings_.filter(b => b.command === command)
            .map(b => b.sequence);
    }
    /** Convenience method for getting the ChromeVox key map. */
    static get() {
        if (KeyMap.instance) {
            return KeyMap.instance;
        }
        const keyBindings = CommandStore.getKeyBindings();
        KeyMap.instance = new KeyMap(keyBindings);
        return KeyMap.instance;
    }
    /** Builds the map of commands to keys. */
    buildCommandToKey_() {
        // TODO (dtseng): What about more than one sequence mapped to the same
        // command?
        for (const binding of this.bindings_) {
            if (this.commandToKey_[binding.command] !== undefined) {
                // There's at least two key sequences mapped to the same
                // command. continue.
                continue;
            }
            this.commandToKey_[binding.command] = binding.sequence;
        }
    }
}
TestImportManager.exportForTesting(KeyMap);
