// Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var echo = {};

// "Learn More" help page link. This links to the offline help app article.
echo.INFO_LINK = 'chrome-extension://' +
                 'honijodknafkokifofgiaalefdiedpko/main.html?answer=2677280';

/**
 * Creates the user opt-in infobar.
 *
 * The dialog requests the user if they would like to allow validating their
 * the registration code by sending it to the ECHO server.
 *
 * @param {string} requestingOrigin Origin/Domain of the service provider.
 * @param {string} serviceName Friendly name for the provider service.
 * @param {function(bool)} consentCallback Callback to use for the consent
 *                                         result.
 */
echo.createConsentInfoBar = function(requestingOrigin, serviceName,
                                     consentCallback) {
  // Create the consent prompt text.
  var promptNode = document.createElement('p');
  // This is a trick to decorate the service name within the prompt string
  // via CSS (<span>). This keeps the prompt string whole and easy to localize.
  // First, use innerHTML to inject an empty span element with a correct CSS
  // selector. Note that we control this markup.
  promptNode.innerHTML = chrome.i18n.getMessage(
      'PROMPT_STRING',
      ["<span class='untrustedurl'></span>"]);
  // Now, access the span node by its CSS selector and update the service name
  // and origin.
  promptNode.querySelector('.untrustedurl').title = requestingOrigin;
  promptNode.querySelector('.untrustedurl').textContent = serviceName;

  var infoNode = document.createElement('a');
  infoNode.setAttribute('href', echo.INFO_LINK);
  infoNode.setAttribute('target', '_blank');
  var infoText = document.createTextNode(
                   chrome.i18n.getMessage('INFO_STRING'));
  infoNode.appendChild(infoText);
  promptNode.appendChild(infoNode);

  // Create the buttons.
  var allowButton = document.createElement('input');
  allowButton.setAttribute('type', 'button');
  allowButton.setAttribute('class', 'right');
  allowButton.setAttribute('value',
                           chrome.i18n.getMessage('ALLOW_BUTTON_STRING'));
  var denyButton = document.createElement('input');
  denyButton.setAttribute('type', 'button');
  denyButton.setAttribute('class', 'right');
  denyButton.setAttribute('value',
                          chrome.i18n.getMessage('DENY_BUTTON_STRING'));
  allowButton.addEventListener('click', function() {
    allowButton.disabled = denyButton.disabled = true;
    console.info('User accepted.');
    consentCallback(true);
  });
  denyButton.addEventListener('click', function() {
    allowButton.disabled = denyButton.disabled = true;
    console.warn('User declined ECHO consent!');
    consentCallback(false);
  });

  // Compose the entire consent dialog.
  var consentButtonNode = document.getElementById('consentbuttons');
  consentButtonNode.appendChild(denyButton);
  consentButtonNode.appendChild(allowButton);
  var consentTextNode = document.getElementById('consenttext');
  consentTextNode.appendChild(promptNode);
};

echo.createEchoDisabledInfobar = function(callback) {
  var promptNode = document.createElement('p');
  promptNode.innerHTML = chrome.i18n.getMessage(
      'DISMISS_INFO_STRING',
      ["<span class='untrustedurl'></span>"]);
  var infoNode = document.createElement('a');
  infoNode.setAttribute('href', echo.INFO_LINK);
  infoNode.setAttribute('target', '_blank');
  var infoText = document.createTextNode(
                   chrome.i18n.getMessage('INFO_STRING'));
  infoNode.appendChild(infoText);
  promptNode.appendChild(infoNode);
  var dismissButton = document.createElement('input');
  dismissButton.setAttribute('type', 'button');
  dismissButton.setAttribute('class', 'right');
  dismissButton.setAttribute('value',
                             chrome.i18n.getMessage('DISMISS_BUTTON_STRING'));
  dismissButton.addEventListener('click', callback);

  var buttonNode = document.getElementById('consentbuttons');
  buttonNode.appendChild(dismissButton);
  var textNode = document.getElementById('consenttext');
  textNode.appendChild(promptNode);
};

window.onload = function() {
  var port = chrome.runtime.connect({name: 'infobar_port'});

  // Called when we have the user's consent response.
  var onInfobarConsentResponse = function(result) {
    port.postMessage({type: 'consent_result', result: result});
    window.close(); // Close infobar.
  };

  var onInfobarDismissed = function() {
    port.postMessage({type: 'infobar_dismissed'});
    window.close();
  }

  // Called when the parent extension sends us the consent text parameters.
  var onInfobarRequest = function(msg) {
    if (msg.type == 'consent_parameters')
      echo.createConsentInfoBar(msg.origin, msg.serviceName,
                                onInfobarConsentResponse);
    else if (msg.type == 'show_echo_disabled_infobar')
      echo.createEchoDisabledInfobar(onInfobarDismissed);
  };
  port.onMessage.addListener(onInfobarRequest);

  // Let parent extension know that we have succesfully loaded and
  // are awaiting consent text parameters.
  port.postMessage({type: 'infobar_loaded'});
};
