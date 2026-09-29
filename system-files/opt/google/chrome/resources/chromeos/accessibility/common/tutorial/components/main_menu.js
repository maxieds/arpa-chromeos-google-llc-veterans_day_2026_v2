// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Defines a custom Polymer component for the main menu in the
 * tutorial.
 */

import 'chrome://resources/ash/common/cr_elements/cr_button/cr_button.js';
import 'chrome://resources/ash/common/cr_elements/cr_link_row/cr_link_row.js';
import 'chrome://resources/ash/common/cr_elements/cr_shared_style.css.js';
import 'chrome://resources/ash/common/cr_elements/cr_shared_vars.css.js';

import {html, mixinBehaviors, PolymerElement} from 'chrome://resources/polymer/v3_0/polymer/polymer_bundled.min.js';

import {Curriculum, InteractionMedium, MainMenuButtonData, Screen} from './constants.js';
import {Localization, LocalizationInterface} from './localization.js';

/**
 * @constructor
 * @extends {PolymerElement}
 * @implements {LocalizationInterface}
 */
const MainMenuBase = mixinBehaviors([Localization], PolymerElement);

/** @polymer */
export class MainMenu extends MainMenuBase {
  static get is() {
    return 'main-menu';
  }

  static get template() {
    return html`<!--_html_template_start_-->
<!--
Copyright 2021 The Chromium Authors
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
-->
<style include="cr-shared-style">

#mainMenu,
#mainMenuButtons {
  margin: auto;
  text-align: start;
  width: 800px;
}

#mainMenuButtons {
  background: #FFF;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15);
  font-size: 22px;
}

h1 {
  font-family: 'Google Sans', 'Roboto';
  font-size: 32px;
  font-weight: medium;
  line-height: 40px;
  margin-bottom: 32px;
}

cr-link-row {
  font-family: 'Roboto';
  font-weight: medium;
}

</style>

<div id="mainMenu"
    hidden$="[[ shouldHideMainMenu(activeScreen) ]]">
  <h1 id="mainMenuHeader" tabindex="-1" aria-describedby="mainMenuHeaderHint">
    [[ getMsg(header_) ]]
  </h1>
  <div id="mainMenuHeaderHint" hidden>[[ getMsg(headerDescription_) ]]</div>
  <div id="mainMenuButtons">
    <template id="mainMenuButtonTemplate" is="dom-repeat"
        items="[[ buttonData_ ]]" as="data">
      <cr-link-row class="hr" on-click="onButtonClicked_"
          label="[[ getMsg(data.title) ]]"
          hidden$="[[ shouldHideButton_(data.medium, medium) ]]">
      </cr-link-row>
    </template>
  </div>
</div>
<!--_html_template_end_-->`;
  }

  static get properties() {
    return {
      /** @private {string} */
      header_: {type: String},
      /** @private {string} */
      headerDescription_: {type: String},
      /** @private  {Array<!MainMenuButtonData>} */
      buttonData_: {type: Array},

      // Observed properties.
      /** @type {Screen} */
      activeScreen: {type: String, observer: 'maybeFocusHeader_'},
    };
  }

  /**
   * @param {string} eventName
   * @param {*} detail
   */
  fire(eventName, detail) {
    this.dispatchEvent(
      new CustomEvent(eventName, {bubbles: true, composed: true, detail}));
  }

  /** @private */
  maybeFocusHeader_() {
    if (this.activeScreen === Screen.MAIN_MENU) {
      this.$.mainMenuHeader.focus();
    }
  }

  /**
   * @param {Screen} activeScreen
   * @return {boolean}
   * @private
   */
  shouldHideMainMenu(activeScreen) {
    return activeScreen !== Screen.MAIN_MENU;
  }

  /**
   * @param {InteractionMedium} buttonMedium
   * @param {InteractionMedium} activeMedium
   * @return {boolean}
   * @private
   */
  shouldHideButton_(buttonMedium, activeMedium) {
    return buttonMedium !== activeMedium;
  }

  /**
   * @param {!MouseEvent} evt
   * @private
   */
  onButtonClicked_(evt) {
    // Fires an event with button data attached to |evt.detail|.
    this.fire('button-clicked', evt.model.data);
  }
}
customElements.define(MainMenu.is, MainMenu);
