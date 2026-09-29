// Copyright (c) 2013 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * A webpage wanting to get the error message from the last
 * checkEligibility call must iframe the not-eligible.html extension
 * resource.
 *
 * This page displays error messages of last checkEligibility call. If
 * the last request is for a promo code based service, display the promo
 * code if it's found in Local State.
 */
onload = function() {
  var ERROR_KEY = 'error_message';
  var errorMessage = localStorage.getItem(ERROR_KEY);
  if (errorMessage == 'null' || !errorMessage) {
    errorMessage = chrome.i18n.getMessage('NONREGULAR_MODE_MESSAGE');
  }

  var errorArea = document.getElementById('errorarea');
  if (!errorArea) {
    var errorDiv = document.createElement('div');
    errorDiv.setAttribute('id', 'errorarea');
    document.body.appendChild(errorDiv);
    errorArea = errorDiv;
  }
  errorArea.innerHTML = '<h1>'
                       + chrome.i18n.getMessage('SORRY_ABOUT_THAT')
                       + '<br><br></h1>';
  // Check promo code in Local State for last checked service id
  chrome.runtime.sendMessage({cmd: CMD_GET_OFFER_INFO},
      function(offerInfo) {
        if (offerInfo[LAST_SERVICE_ID]
            && offerInfo.services[offerInfo[LAST_SERVICE_ID]]
            && offerInfo.services[offerInfo[LAST_SERVICE_ID]][PROMO_CODE]) {
          var serviceInfo = offerInfo.services[offerInfo[LAST_SERVICE_ID]];
          var promoCode = serviceInfo[PROMO_CODE];
          var promoCodeExpirationDate =
              serviceInfo[PROMO_CODE_EXPIRATION_DATE];
          var redirectUrl = serviceInfo[REDIRECT_URL];
          createPromoCodeMessage(
              chrome.i18n.getMessage('PROMO_CODE', [promoCode]));
          if (promoCodeExpirationDate) {
            createPromoCodeMessage(
                chrome.i18n.getMessage('PROMO_CODE_EXPIRATION_DATE',
                                       [promoCodeExpirationDate]));
          }
          if (redirectUrl) {
            createRedeemButton(
                chrome.i18n.getMessage('REDEEM_OFFER'),
                redirectUrl, promoCode);
          }
        } else {
          errorArea.innerHTML = errorArea.innerHTML
              + errorMessage;
        }

        var serviceId = UNKNOWN_SERVICE_ID;
        if (!chrome.runtime.lastError
            && offerInfo[LAST_SERVICE_ID]) {
          serviceId = offerInfo[LAST_SERVICE_ID];
        }
        googleAnalytics.setDimensionDeviceFamily(offerInfo.deviceFamily);
        googleAnalytics.setDimensionServiceId(serviceId);
        googleAnalytics.sendMetricNotEligiblePage();
      });
}

/**
 * create a paragraph to display promo code message on the page.
 */
createPromoCodeMessage = function(promoCodeMsg) {
  // Create a paragraph to display promo code message.
  var promoCodeMsgP = document.createElement('p');
  promoCodeMsgP.innerHTML = promoCodeMsg;

  // Get the div to display all promo code messages and buttons.
  var promoCodeDiv = document.getElementById('promo-code');
  if (!promoCodeDiv) {
    // promoCodeDiv was not created before. Create the
    // promoCodeDiv and append to the error area of the page.
    promoCodeDiv = document.createElement('div');
    promoCodeDiv.setAttribute('id', 'promo-code');
    promoCodeDiv.setAttribute('class', 'devices-goodies');

    var errorArea = document.getElementById('errorarea');
    errorArea.appendChild(promoCodeDiv);
  }

  // append the promo code msg paragraph to promoCodeDiv.
  promoCodeDiv.appendChild(promoCodeMsgP);
}

/**
 * Create a redeem offer button to redirect user to service
 * provider's page to redeem promo code.
 */
createRedeemButton = function(text, redirectUrl, promoCode) {
  // Creates redeem button
  var button = document.createElement('a');
  button.setAttribute('id', 'redeem-button');
  button.setAttribute('role', 'button');
  button.setAttribute('tabindx', '0');
  button.setAttribute('class', 'button');
  button.innerHTML = text;
  button.addEventListener('click', function() {
        handleRedeemButton(redirectUrl, promoCode);
      });

  // append button to paragraph
  var buttonP = document.createElement('p');
  buttonP.appendChild(button);

  // append cta paragraph to promoCode div
  var promoCodeDiv = document.getElementById('promo-code');
  promoCodeDiv.appendChild(buttonP);
}

/**
 * Handler for the redeem offer button.
 */
handleRedeemButton = function(redirectUrl, promoCode) {
  googleAnalytics.sendMetricRedeemPromoCodeButtonClicked();
  window.open(redirectUrl + promoCode, "_top");
}
