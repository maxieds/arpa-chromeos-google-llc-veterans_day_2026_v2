// Copyright 2017 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TestImportManager } from '../testing/test_import_manager.js';
var RoleType = chrome.automation.RoleType;
export class RecoveryStrategy {
    node_;
    constructor(node) {
        this.node_ = node;
    }
    get node() {
        if (this.requiresRecovery()) {
            this.node_ = this.recover() || this.node_;
        }
        return this.node_;
    }
    requiresRecovery() {
        return !this.node_ || !this.node_.role;
    }
    equalsWithoutRecovery(rhs) {
        return this.node_ === rhs.node_;
    }
}
/**
 * A recovery strategy that uses the node's ancestors.
 */
export class AncestryRecoveryStrategy extends RecoveryStrategy {
    ancestry_ = [];
    constructor(node) {
        super(node);
        let nodeWalker = node;
        while (nodeWalker) {
            this.ancestry_.push(nodeWalker);
            nodeWalker = nodeWalker.parent;
            if (nodeWalker && nodeWalker.role === RoleType.WINDOW) {
                break;
            }
        }
    }
    recover() {
        return this.ancestry_[this.getFirstValidNodeIndex_()];
    }
    getFirstValidNodeIndex_() {
        for (let i = 0; i < this.ancestry_.length; i++) {
            const firstValidNode = this.ancestry_[i];
            if (firstValidNode != null && firstValidNode.role !== undefined &&
                firstValidNode.root !== undefined) {
                return i;
            }
        }
        return 0;
    }
}
/**
 * A recovery strategy that uses the node's tree path.
 */
export class TreePathRecoveryStrategy extends AncestryRecoveryStrategy {
    recoveryChildIndex_ = [];
    constructor(node) {
        super(node);
        let nodeWalker = node;
        while (nodeWalker) {
            // TODO(b/314203187): Not null asserted, check these to make sure this
            // is correct.
            this.recoveryChildIndex_.push(nodeWalker.indexInParent);
            nodeWalker = nodeWalker.parent;
            if (nodeWalker && nodeWalker.role === RoleType.WINDOW) {
                break;
            }
        }
    }
    recover() {
        const index = this.getFirstValidNodeIndex_();
        if (index === 0) {
            return this.ancestry_[index];
        }
        // Otherwise, attempt to recover.
        let node = this.ancestry_[index];
        for (let j = index - 1; j >= 0; j--) {
            const childIndex = this.recoveryChildIndex_[j];
            const children = node.children;
            if (!children[childIndex]) {
                return node;
            }
            node = children[childIndex];
        }
        return node;
    }
}
TestImportManager.exportForTesting(RecoveryStrategy);
TestImportManager.exportForTesting(AncestryRecoveryStrategy);
TestImportManager.exportForTesting(TreePathRecoveryStrategy);
