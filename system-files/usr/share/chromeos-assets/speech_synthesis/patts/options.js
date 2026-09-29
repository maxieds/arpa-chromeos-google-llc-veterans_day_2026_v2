// Copyright 2019 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Stores all relevant data for a voice.
 * @typedef {{
*  compressed_size: number,
*  displayName: string,
*  file_id: string,
*  id: string,
*  language: string,
*  remote: boolean,
*  sha256_checksum: string,
*  speakers: !Array<!SpeakerData>,
*  unloaded: boolean,
*  url: string,
* }}
*
* Example VoiceData:
* {
*  compressed_size: 12853955,
*  displayName: 'English (United States),
*  file_id: 'en-us-x-multi-r48',
*  id: 'en-us-x-multi',
*  language: 'en-US',
*  remote: false,
*  sha256_checksum: 'abcdefg',
*  speakers: [
*    {
*      gender: 'female',
*      name: 'Chrome OS US English 1',
*      speaker: 'sfg'
*    },
*  ],
*  unloaded: true,
*  url: 'https://dl.google.com/.../en-us-x-multi-r48.zvoice',
* }
*/
let VoiceData;

class OptionsPage {
  constructor() {
    chrome.runtime.onMessage.addListener(this.onMessage_.bind(this));
    document.getElementById('searchInput')
        .addEventListener('input', this.searchChanged_.bind(this));
    document.getElementById('clearButton')
        .addEventListener('click', this.clearSearch_.bind(this));

    /**
     * Whether High-Quality voices are enabled.
     * @private {boolean}
     */
    this.highQualityVoicesEnabled_ = false;
    chrome.accessibilityPrivate.isFeatureEnabled(chrome.accessibilityPrivate.AccessibilityFeature.GOOGLE_TTS_HIGH_QUALITY_VOICES, (enabled) => {
      this.highQualityVoicesEnabled_ = enabled;
      this.sendToBackground_({type: 'getVoices'});
    });
  }

  /**
   * @param {!Object} message
   * @private
   */
  onMessage_(message) {
    let command = message;
    if (command.type == 'updateVoices') {
      this.updateVoices_(command.data);
    }
  }

  /**
   * @param {!Object} message
   * @private
   */
  sendToBackground_(message) {
    chrome.runtime.sendMessage(message);
  }

  /**
   * @param {!VoiceData} voice
   * @return {boolean}
   * @private
   */
  isSeanetVoice_(voice) {
    return voice.id && voice.id.includes('-seanet');
  }

  /**
   * @param {string} locale
   * @return {!Object|undefined}
   * @private
   */
  getSeanetVoice_(locale) {
    return this.voices_.find(
        voice => voice.language === locale && this.isSeanetVoice_(voice));
  }

  /**
   * @param {!VoiceData} voice
   * @return {string}
   * @private
   */
  getButtonText_(voice) {
    if (!this.highQualityVoicesEnabled_) {
      return voice.remote ? (voice.unloaded ? 'Install' : 'Uninstall') : 'Built in';
    }

    // The logic below assumes that high quality voices are enabled.
    const seanetVoice = this.getSeanetVoice_(voice.language);
    if (seanetVoice && !voice.remote) {
      // This case handles languages that have built-in valerian voices but
      // downloadable seanet voices.
      return seanetVoice.unloaded ? 'Add natural voices' :
                                    'Remove natural voices';
    }

    // This case handles languages where both valerian and seanet voices are
    // installed/uninstalled together.
    return voice.unloaded ? 'Install' : 'Uninstall';
  }

  /**
   * @param {!Array} voices
   * @private
   */
  updateVoices_(voices) {
    this.voices_ = voices;
    this.voices_.sort((v1, v2) => {
      return v1.displayName.localeCompare(v2.displayName);
    });

    let voiceContainer = document.getElementById('voiceContainer');
    voiceContainer.textContent = '';

    this.voiceList_ = document.createElement('ul');
    voiceContainer.appendChild(this.voiceList_);
    let langSet = new Set();
    this.voices_.forEach((voice) => {
      // Skipping SEANet voices, as we would like to maintain the invariant that
      // the list of voices in the loop are Valerian voices (e.g. so we can
      // check if Valerian vs SEANet voices are installed on disk). Also,
      // skipping voices with locales that have already been seen, so that we
      // only create one row per locale.
      if (this.isSeanetVoice_(voice) || langSet.has(voice.language)) {
        return;
      }
      langSet.add(voice.language);
      voice.voiceItem = document.createElement('li');
      this.voiceList_.appendChild(voice.voiceItem);
      voice.voiceItem.className = 'option';
      voice.voiceItem.id = 'li-' + voice.language;

      let aboutVoice = document.createElement('div');
      voice.voiceItem.appendChild(aboutVoice);
      aboutVoice.className = 'about';

      let voiceText = document.createElement('div');
      aboutVoice.appendChild(voiceText);
      voiceText.id = voice.language;
      voiceText.textContent = voice.displayName;
      voiceText.className = 'name';

      // Override the DOM ordering only for accessibility by using aria-owns.
      aboutVoice.setAttribute('aria-owns', voiceText.id);

      let actionButton = document.createElement('button');
      voice.voiceItem.appendChild(actionButton);
      // TODO: get i18n working.
      actionButton.textContent = this.getButtonText_(voice);
      actionButton.setAttribute('aria-describedby', voiceText.id);
      if (!this.highQualityVoicesEnabled_) {
        // If high-quality voices aren't enabled, then non-remote voices should
        // have no available actions.
        actionButton.disabled = !voice.remote;
      }

      actionButton.addEventListener('click', (evt) => {
        actionButton.disabled = true;
        let unloaded = voice.unloaded;
        const seanetVoice = this.getSeanetVoice_(voice.language);
        if (seanetVoice && !voice.remote) {
          // This case handles languages that have built-in valerian voices but
          // downloadable seanet voices.
          unloaded = seanetVoice.unloaded;
        }

        this.sendToBackground_(
            {type: unloaded ? 'addVoice' : 'removeVoice', data: voice});
      });
    });
    // Apply the search.
    this.searchChanged_();
  }

  /**
   * Called when the button to clear the search box is clicked.
   * @private
   */
  clearSearch_() {
    let searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    this.searchChanged_();
    searchInput.focus();
  }

  /**
   * Called when the search box contents change.
   * @private
   */
  searchChanged_() {
    if (!this.voiceList_) return;
    let errorMessage = document.getElementById('errorMessage');
    let clearButton = document.getElementById('clearButton');
    let searchInput = document.getElementById('searchInput').value.trim();
    let searchInputLower = searchInput.toLowerCase();
    let topResult = '';
    let resultCount = 0;
    this.voices_.forEach((voice) => {
      voice.speakers.forEach((speaker) => {
        let element = document.getElementById('li-' + voice.language);
        if (searchInput === '' ||
            speaker.name.toLowerCase().search(searchInputLower) >= 0 ||
            voice.displayName.toLowerCase().search(searchInputLower) >= 0) {
          if (topResult === '') topResult = voice.displayName;
          element.style['display'] = '';
          resultCount += 1;
        } else {
          element.style['display'] = 'none';
        }
      });
    });
    clearButton.style['display'] = searchInput === '' ? 'none' : '';
    if (resultCount === 0) {
      errorMessage.innerText = 'No search results found';
      errorMessage.style['display'] = '';
    } else {
      errorMessage.innerText = '';
      errorMessage.style['display'] = 'none';
    }
    // Update the live region with a delay to report the results.
    // Clear a previous timeout so we don't do too many duplicate announcements.
    clearTimeout(this.searchSummaryUpdate_);
    this.searchSummaryUpdate_ = setTimeout(() => {
      let searchSummary = document.getElementById('searchSummary');
      if (resultCount === 0) {
        searchSummary.innerText = 'No results for ' + searchInput;
      } else if (searchInput === '') {
        searchSummary.innerText = '';
      } else {
        searchSummary.innerText = 'Top result ' + topResult + '. ' +
            resultCount +
            (resultCount === 1 ? ' result for ' : ' results for ') +
            searchInput;
      }
    }, 200);
  }
}

window.page = new OptionsPage();
