// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview Holds information about a braille table.
 */
import { TestImportManager } from '/common/testing/test_import_manager.js';
import { Msgs } from '../msgs.js';
export var BrailleTable;
(function (BrailleTable) {
    BrailleTable.TABLE_PATH = 'chromevox/third_party/liblouis/tables.json';
    /**
     * Retrieves a list of all available braille tables.
     * @param callback Called asynchronously with an array of tables.
     */
    async function getAll(callback) {
        const needsDisambiguation = new Map();
        function preprocess(tables) {
            tables.forEach((table) => {
                // Append the common definitions to all table filenames.
                table.fileNames += (',' + COMMON_DEFS_FILENAME);
                // Save all tables which have a mirroring duplicate for locale + grade.
                const key = table.locale + table.grade;
                if (!needsDisambiguation.has(key)) {
                    needsDisambiguation.set(key, []);
                }
                const entry = needsDisambiguation.get(key);
                entry.push(table);
            });
            for (const entry of needsDisambiguation.values()) {
                if (entry.length > 1) {
                    entry.forEach((table) => table.alwaysUseEnDisplayName = true);
                }
            }
            return tables;
        }
        const url = chrome.extension.getURL(BrailleTable.TABLE_PATH);
        if (!url) {
            throw 'Invalid path: ' + BrailleTable.TABLE_PATH;
        }
        const response = await fetch(url);
        if (response.ok) {
            const tables = await response.json();
            callback(preprocess(tables));
        }
    }
    BrailleTable.getAll = getAll;
    /**
     * Finds a table in a list of tables by id.
     * @param tables tables to search in.
     * @param id id of table to find.
     * @return The found table, or null if not found.
     */
    function forId(tables, id) {
        return tables.filter(table => table.id === id)[0] || null;
    }
    BrailleTable.forId = forId;
    /**
     * Returns an uncontracted braille table corresponding to another, possibly
     * contracted, table.  If {@code table} is the lowest-grade table for its
     * locale and dot count, {@code table} itself is returned.
     * @param tables tables to search in.
     * @param table Table to match.
     * @return {!BrailleTable.Table} Corresponding uncontracted table,
     *     or {@code table} if it is uncontracted.
     */
    function getUncontracted(tables, table) {
        function mostUncontractedOf(current, candidate) {
            // An 8 dot table for the same language is preferred over a 6 dot table
            // even if the locales differ by region.
            if (current.dots === '6' && candidate.dots === '8' &&
                current.locale.lastIndexOf(candidate.locale, 0) === 0) {
                return candidate;
            }
            if (current.locale === candidate.locale &&
                current.dots === candidate.dots && (current.grade !== undefined) &&
                (candidate.grade !== undefined) && candidate.grade < current.grade) {
                return candidate;
            }
            return current;
        }
        return tables.reduce(mostUncontractedOf, table);
    }
    BrailleTable.getUncontracted = getUncontracted;
    /**
     * @param table Table to get name for.
     * @return Localized display name.
     */
    function getDisplayName(table) {
        const uiLanguage = chrome.i18n.getUILanguage().toLowerCase();
        const localeName = chrome.accessibilityPrivate.getDisplayNameForLocale(table.locale /* locale to be displayed */, uiLanguage /* locale to localize into */);
        const enDisplayName = table.enDisplayName;
        if (!localeName && !enDisplayName) {
            return;
        }
        let baseName;
        if (enDisplayName &&
            (table.alwaysUseEnDisplayName || uiLanguage.startsWith('en') ||
                !localeName)) {
            baseName = enDisplayName;
        }
        else {
            baseName = localeName;
        }
        if (!table.grade && !table.variant) {
            return baseName;
        }
        else if (table.grade && !table.variant) {
            return Msgs.getMsg('braille_table_name_with_grade', [baseName, table.grade]);
        }
        else if (!table.grade && table.variant) {
            return Msgs.getMsg('braille_table_name_with_variant', [baseName, table.variant]);
        }
        else {
            // TODO(b/314203187): Not null asserted, check that this is correct.
            return Msgs.getMsg('braille_table_name_with_variant_and_grade', [baseName, table.variant, table.grade]);
        }
    }
    BrailleTable.getDisplayName = getDisplayName;
})(BrailleTable || (BrailleTable = {}));
// Local to module.
const COMMON_DEFS_FILENAME = 'cvox-common.cti';
TestImportManager.exportForTesting(['BrailleTable', BrailleTable]);
