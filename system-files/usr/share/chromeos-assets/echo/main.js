// Copyright 2012 The ChromiumOS Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview The ECHO client extension.
 */
var echo = {};

echo.CMD = {};

/**
 * The key to store error message in localStorage.
 */
echo.ERROR_KEY = 'error_message';

echo.MILLISEC_PER_DAY = 1000*86400;

echo.CMD.CHECK_ELIGIBILITY = 'checkEligibility';

echo.CMD.CHECK_MODEL_ELIGIBILITY = 'checkModelEligibility';

echo.CMD.GET_MODEL = 'getModel';


/**
 * Time to wait for XHR getting response.
 */
echo.XHR_TIMEOUT_MS = 20000;

/**
 * Name of origin verification cookie.
 *
 * Its value must be set on the origin specified in the
 * request to be the same as the request nonce received in the
 * request.
 */
echo.ORIGIN_VERIFICATION_COOKIE = 'echo.ORIGIN_VERIFICATION_COOKIE';

/**
 * Whether the extension is being run in debug/diagnostics mode.
 *
 * In this mode the result of the interaction with ECHO is not posted
 * back to the requester. Moreover, the extension surface includes additional
 * log and diagnostic message useful for support.
 */
echo.DEBUG_MODE = false;

/**
 * The date eligibility check happens.
 */
echo.ELIGIBILITY_CHECKED_DATE = 'eligibilityCheckedDate';

/**
 * The time range within which the cached promo code is returned back to get
 * promo code page. This is set to be 30 mins.
 */
echo.PROMO_CODE_ACCESS_PERIOD_IN_MS = 1000*60*30;

/**
 * The time in millisecs when eligibility check happens.
 */
echo.ELIGIBILITY_CHECKED_TIME = 'eligibilityCheckedTime';

/**
 * The key to mark that the complete offer info from ECHO server is stored
 * in Local State.
 */
echo.COMPLETE_OFFER_INFO_FROM_SERVER = 'complete_offer_info_from_server';

/**
 * The key to mark that an eligible request with regcode is received.
 */
echo.NON_OTC_ELIGIBLE = 'non_otc_eligible_request';

/**
 * The key to mark that  metric failure_retrieve_regcode_after_eligible_request
 * is sent to Google Analytics.
 */
echo.FAILURE_RETRIEVE_REGCODE_AFTER_ELIGIBLE_METRIC_SENT =
    'failure_retrieve_regcode_after_eligible_request_metric_sent';

/**
 * API key used for Google API access.
 */
echo.APIARY_KEY = 'AIzaSyBaw6h2A15kTjBhA9aOUreEckVAZjx_1-0';

/**
 * Google API frontend used for requests.
 */
echo.APIARY_FRONTEND =
    'https://chromeos-registration.googleapis.com/chromeosregistration/v1';

/**
 * Google Endpoints frontend used for requests.
 */
echo.ENDPOINTS_FRONTEND =
    'https://chromeos-registration.googleapis.com/_ah/api/echo/1/';

/**
 * HTML help links displayed in error.html
 */
echo.HELP_CENTER_LINK_HTML = '<br><br><a href="https://support.google.com/'
    + 'chromeos/answer/2703646" target="_blank">';
echo.CHROME_OS_SUPPORT_LINK_HTML = '<a href="https://support.google.com/'
    + 'chromeos/answer/1280301?hl=en&ref_topic=2586009" target="_blank">';

/**
 * Logs a line to a special div on the extension surface.
 *
 * Prepends the time to each line.
 *
 * @param {string} text Text to display.
 */
echo.log = function(text) {
  if (!echo.DEBUG_MODE)
    return;
  var logArea = document.getElementById('logarea');
  if (!logArea) {
    var logDiv = document.createElement('div');
    logDiv.setAttribute('id', 'logarea');
    document.body.appendChild(logDiv);
    logArea = logDiv;
  }
  var pNode = document.createElement('p');
  var textNode =
      document.createTextNode('[' + new Date().getTime() + ']' + text);
  pNode.appendChild(textNode);
  logArea.appendChild(pNode);
};

/**
 * Versions of logging helpers for different logging levels.
 *
 * The normal JS console log messages for the inline extension context
 * are hard to get at - opening the normal JS console opens it in the context
 * of the parent page and not that of the inline surface. When running in debug
 * mode we also display these messages on the extension surface to allow
 * easy access to the logs for diagnostics and support.
 */
echo.log.debug = function(text) {
  console.debug(text);
  echo.log(' (DEBUG) ' + text);
};

echo.log.error = function(text) {
  console.error(text);
  echo.log(' (ERROR) ' + text);
};

echo.log.warn = function(text) {
  console.info(text);
  echo.log(' (WARN) ' + text);
};

echo.log.info = function(text) {
  console.info(text);
  echo.log(' (INFO) ' + text);
};

/**
 * Shows user consent dialog. If the offer redemption is not allowed by the
 * device policy, user will be shown an echo-disabled dialog and the processing
 * will continue as if the user has not given the consent (getUserConsent
 * function will return false).
 *
 * @param {string} origin Origin to show in the consent dialog.
 * @param {string} serviceName Friendly name of the service requesting consent.
 * @param {number} tabId ID of the tab that requested the user consent.
 * @param {object} requestData Parameters to use for the eligibility request.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 */
echo.requestConsent = function(origin, serviceName, tabId, requestData,
                               sendResponse) {
  chrome.echoPrivate.getUserConsent({
    origin: origin,
    serviceName: serviceName,
    tabId: tabId
  }, function(result) {
    if (chrome.runtime.lastError) {
      echo.log.error('echoPrivate.getUserConsent failed: ' +
          chrome.runtime.lastError.message);
      echo.consentCallback(null, requestData, sendResponse);
      return;
    }

    echo.consentCallback(result, requestData, sendResponse);
  });
};

/**
 * Create request body for the Google API checkEligibility call.
 *
 * @param {object} requestParams Request parameters as a JSON object.
 *
 * @return {string} Request body.
 */
echo.createRequest = function(requestParams) {
  var templateParams = {jsonrpc: '2.0',
                        id: 'gapiRpc',
                        method: 'chromeosregistration.checkEligibility',
                        params: requestParams,
                        apiVersion: 'v1'};
  return JSON.stringify(templateParams);
};

/**
 * Create request body for the Google API confirmEnrollment call.
 *
 * @param {string} serviceId The serviceId of the request.
 * @param {string} requestNonce The request nonce generated by redemption page.
 * @param {string} responseNonce The response nonce returned in
 *                               checkEligibility call response.
 */
echo.createConfirmEnrollmentRequest = function(serviceId, requestNonce,
    responseNonce) {
  var requestParams = {serviceId: serviceId,
                       requestNonce: requestNonce,
                       responseNonce: responseNonce};
  var templateParams = {jsonrpc: '2.0',
                        id: 'gapiRpc',
                        method: 'chromeosregistration.confirmEnrollment',
                        params: requestParams,
                        apiVersion: 'v1'};
  return JSON.stringify(templateParams);
};

/**
 * Create request for getOfferInfoConfig.
 */
echo.createGetOfferInfoConfigRequestParams = function() {
  var templateParams = {jsonrpc: '2.0',
                        id: 'gapiRpc',
                        method: 'chromeosregistration.getOfferInfoConfig',
                        apiVersion: 'v1'};
  return JSON.stringify(templateParams);
};

/**
 * Get the max device activation date and trigger checkEligibility request.
 *
 * This timestamp will be passed to echo server as part of checkEligibility
 * request.
 *
 * @param{object} sendResponse Consult echo.consentCallback for docs for param
 *                             sendResponse.
 * @param{object} requestParams Parameters for eligibility request.
 */
echo.getMaxDeviceActivationDateAndStartEligibilityCheck =
    function(requestParams,
             sendResponse) {
  chrome.echoPrivate.getOobeTimestamp(
    function(timestamp) {
      if (!timestamp) {
        googleAnalytics.sendMetricNoOobe();
      }

      echo.log.info('got OOBE timestamp: ' + timestamp);
      var activationDate = echo.getMaxDeviceActivationDate(timestamp);
      requestParams.maxDeviceActivationDate =
        echo.convertDateToString(activationDate);
      echo.checkEligibility(requestParams, sendResponse);
    });
};

/**
 * Get more info (i.e. hwid, customization id) and send out eligibility request.
 *
 * @param{object} requestParams Parameters for eligibility request.
 * @param{object} sendResponse Consult echo.consentCallback for docs for param
 *                             sendResponse.
 * @param{object} responseResult The result of checkEligibility response.
 */
echo.getMoreInfoAndCheckEligibility = function(requestParams, sendResponse,
    responseResult) {
  chrome.chromeosInfoPrivate.get(['hwid', 'customizationId'],
    function(offerInfo){
      if (responseResult.needHwid) {
        if (offerInfo.hwid) {
          echo.log.info('got hwid: ' + offerInfo.hwid);
          requestParams.hwid = offerInfo.hwid;
        } else {
          googleAnalytics.sendMetricNoHwid();
          echo.log.info('hwid can\'t be found');
          echo.persistErrorMessageByKeyString(null);
          echo.postEligibilityResponse(sendResponse);
          return;
        }
      }
      if (responseResult.needCustomizationId) {
        if (offerInfo.customizationId) {
          echo.log.info('got customizationId: ' + offerInfo.customizationId);
          requestParams.customizationId = offerInfo.customizationId;
        } else {
          googleAnalytics.sendMetricNoCustomizationId();
          echo.log.info('customizationId can\'t be found');
          echo.persistErrorMessageByKeyString(null);
          echo.postEligibilityResponse(sendResponse);
          return;
        }
      }
      echo.checkEligibility(requestParams, sendResponse);
    });
};

/**
 * Parses the device from the hwid object retrieved from
 * chrome.chromeosInfoPrivate.get(['hwid'],...);
 */
echo.parseDeviceFromHwidObject = function(hwidObject, orElse) {
  if (!hwidObject || !hwidObject.hwid) {
    echo.log.error('HWID is not available.');
    return orElse;
  }
  echo.log.info('Got HWID: ' + hwidObject.hwid);
  let device = hwidObject.hwid.split(' ')[0].toLowerCase();
  const hwidV4Regex = /.+-[a-z]{4}/g;
  if (device.match(hwidV4Regex)) {
    // HWIDv4 includes 4 char code separated by a dash from the device family.
    // e.g.: HELIOS-YVRQ C5B-A3D-E4V-42Q-A4G
    device = device.substring(0, device.length - 5);
  }
  echo.log.info('Got device: ' + device);
  return device;
}

/**
 * Get the xhr instance.
 * This makes the code more testable by allowing XHR creation to be mocked.
 *
 * @param {string} action Which action to call.
 */
echo.getEchoApiXhr = function(action) {
  const xhr = new XMLHttpRequest();
  xhr.xhr_success = false;
  const requestEndpoint =
      echo.APIARY_FRONTEND +
          `/${action}?key=${encodeURIComponent(echo.APIARY_KEY)}`;
  echo.log.debug(`Created XHR with URL: ${requestEndpoint}`);
  xhr.open('POST', requestEndpoint);
  xhr.setRequestHeader('content-type', 'application/json');
  return xhr;
};

/**
 * Creates the JSON body of the request for the given request parameters.
 *
 * @param {object=} requestParams parameters to include in request
 * @returns {string}
 */
echo.getRequestBody = function(requestParams = {}) {
  const requestBody = {};
  if (requestParams) {
    Object.keys(requestParams)
        .filter(p => !p.endsWith('Callback'))
        .filter(key => !!requestParams[key])
        .forEach(
            key => {
              const val = requestParams[key];
              if (key === 'serviceName') {
                requestBody['serviceProviderAlias'] = val;
                return;
              }
              requestBody[key] = val;
            });
  }
  return JSON.stringify(requestBody);
};

/**
 * Get the xhr instance.
 */
echo.getEchoEndpointsXhr = function(action) {
  var xhr = new XMLHttpRequest();
  xhr.xhr_success = false;
  var requestEndpoint = echo.ENDPOINTS_FRONTEND + action;
  xhr.open('POST', requestEndpoint);
  xhr.setRequestHeader('content-type', 'application/json');
  return xhr;
};

/**
 * Makes ECHO RPC call via Google API to check eligibility.
 *
 * Posts result back to the requester.
 *
 * @param {object} requestParams Service parameters.
 * @param {string} requestParams.origin Requesting origin.
 * @param {string} requestParams.serviceId Service identifier.
 * @param {string} requestParams.requestNonce Request nonce.
 * @param {boolean} requestParams.opt_isGroupType Type of code.
 * @param {string} requestParams.code Registration Code.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 */
echo.checkEligibility = function(requestParams, sendResponse) {
  const xhr = echo.getEchoApiXhr('check');
  googleAnalytics.setDimensionApiName('checkEligibility');
  googleAnalytics.sendMetricApiCalls();
  xhr.onload = function() {
    xhr.xhr_success = true;

    echo.log.debug('XHR succeeded. response is ' + xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    if (!response) {
      // Google API front end returned an error.
      echo.postEligibilityResponse(sendResponse, 'RETRY');
      return;
    }
    var providerResponse = {requestNonce: response.requestNonce,
                            eligibilityResponse: response};
    echo.log.info('Raw ECHO server response = ' + JSON.stringify(response));

    echo.persistCheckEligibilityResponse(response, requestParams.isOtc);
    if (response.result == 'ELIGIBLE') {
      googleAnalytics.sendMetricEligible();
      echo.persistErrorMessage(null);
      if (response.promoCode) {
        echo.log.info('Got promo code from server, send confirm request');
        // ECHO Extension acknowledges the receipt of a promo code from
        // the server by calling confirmEnrollment for the offer.
        echo.confirmEnrollment(response.serviceId,
            response.requestNonce,
            response.responseNonce,
            sendResponse,
            providerResponse, 0);
      } else {
        echo.postEligibilityResponse(sendResponse, providerResponse);
      }
    } else if (response.result == 'NEED_MORE_INFO') {
      googleAnalytics.sendMetricNeedMoreInfo();
      echo.getMoreInfoAndCheckEligibility(requestParams, sendResponse,
        response);
    } else {
      googleAnalytics.sendMetricNotEligible(response.errorCode);
      echo.log.warn('Server responded with: ' + response.result);
      echo.persistErrorMessageByKeyString(response.message);
      echo.postEligibilityResponse(sendResponse);
    }
  };
  xhr.error = function() {
    echo.log.warn('Google API request failed.');
    googleAnalytics.sendMetricXhrError();
    echo.checkEligibilityEndpoints(requestParams, sendResponse);
  };
  const body = echo.getRequestBody(requestParams);
  echo.log.debug('Request body: ' + body);
  xhr.send(body);
  window.setTimeout(
    function() {
      if (xhr.xhr_success) {
        // XHR succeeded. Ignore timeout.
        return;
      }
      googleAnalytics.sendMetricXhrTimeout();
      // abort the current xhr.
      xhr.abort();
      echo.checkEligibilityEndpoints(requestParams, sendResponse);
    },
    echo.XHR_TIMEOUT_MS);
};

/**
 * Makes ECHO RPC call via Google Endpoints to check eligibility.
 *
 * Posts result back to the requester.
 *
 * @param {object} requestParams Service parameters.
 * @param {string} requestParams.origin Requesting origin.
 * @param {string} requestParams.serviceId Service identifier.
 * @param {string} requestParams.requestNonce Request nonce.
 * @param {boolean} requestParams.opt_isGroupType Type of code.
 * @param {string} requestParams.code Registration Code.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 */
echo.checkEligibilityEndpoints = function(requestParams, sendResponse) {
  var xhr = echo.getEchoEndpointsXhr('checkEligibility');
  googleAnalytics.setDimensionApiName('checkEligibilityEndpoints');
  googleAnalytics.sendMetricApiCalls();
  xhr.onload = function() {
    xhr.xhr_success = true;

    echo.log.debug('XHR succeeded. response is ' + xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    if (!response.result) {
      // Google API front end returned an error.
      echo.postEligibilityResponse(sendResponse, 'RETRY');
      return;
    }
    var providerResponse = {
      requestNonce: response.result.requestNonce,
      eligibilityResponse: response.result,
    };
    echo.log.info('Raw ECHO server response = ' +
        JSON.stringify(response.result));

    echo.persistCheckEligibilityResponse(response.result, requestParams.isOtc);
    if (response.result.result == 'ELIGIBLE') {
      googleAnalytics.sendMetricEligible();
      echo.persistErrorMessage(null);
      if (response.result.promoCode) {
        echo.log.info('Got promo code from server, send confirm request');
        // ECHO Extension acknowledges the receipt of a promo code from
        // the server by calling confirmEnrollment for the offer.
        echo.confirmEnrollmentEndpoints(
            response.result.serviceId,
            response.result.requestNonce,
            response.result.responseNonce,
            sendResponse,
            providerResponse,
            0);
      } else {
        echo.postEligibilityResponse(sendResponse, providerResponse);
      }
    } else if (response.result.result == 'NEED_MORE_INFO') {
      googleAnalytics.sendMetricNeedMoreInfo();
      echo.getMoreInfoAndCheckEligibility(
          requestParams, sendResponse, response.result);
    } else {
      googleAnalytics.sendMetricNotEligible(response.result.errorCode);
      echo.log.warn('Server responded with: ' + response.result.result);
      echo.persistErrorMessageByKeyString(response.result.message);
      echo.postEligibilityResponse(sendResponse);
    }
  };
  xhr.error = function() {
    echo.log.warn('Google Endpoints request failed.');
    googleAnalytics.sendMetricXhrError();
    echo.postEligibilityResponse(sendResponse, 'RETRY');
  };
  echo.log.debug('Sending XHR request with body: ' + requestParams);
  xhr.send(requestParams);
  window.setTimeout(
      function() {
        if (xhr.xhr_success) {
          // XHR succeeded. Ignore timeout.
          return;
        }
        googleAnalytics.sendMetricXhrTimeout();
        // abort the current xhr.
        xhr.abort();
        echo.postEligibilityResponse(sendResponse, 'RETRY');
      },
      echo.XHR_TIMEOUT_MS);
};

/**
 * Makes ECHO RPC call via Google API to confirm enrollment.
 * After the API is done, post response to provider.
 *
 * @param {string} serviceId The serviceId of the request.
 * @param {string} requestNonce The request nonce generated by redemption page.
 * @param {string} responseNonce The response nonce returned in
 *                               checkEligibility call response.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 * @param {object} providerResponse Response to be sent to the provider.
 *
 */
echo.confirmEnrollment = function(serviceId, requestNonce, responseNonce,
    sendResponse, providerResponse, retryNum) {
  if (retryNum >= 5) {
    echo.log.error('confirmEnrollment call failures exceed max retry');
    echo.postEligibilityResponse(sendResponse, providerResponse);
    return;
  }
  const xhr = echo.getEchoApiXhr('confirm');
  googleAnalytics.setDimensionApiName('confirmEnrollment');
  googleAnalytics.sendMetricApiCalls();
  xhr.onload = function() {
    xhr.xhr_success = true;

    echo.log.debug('XHR succeeded. response is ' + xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    if (!response) {
      // Google API front end returned an error, retry.
      window.setTimeout(
        echo.confirmEnrollment(serviceId, requestNonce, responseNonce,
            sendResponse, providerResponse, retryNum + 1),
        1000);
      return;
    }
    echo.log.info('Raw ECHO server response from confirmEnrollment = ' +
        JSON.stringify(response));
    echo.postEligibilityResponse(sendResponse, providerResponse);
  };
  xhr.error = function() {
    echo.log.warn('Google API confirmEnrollment request failed.');
    googleAnalytics.sendMetricXhrError();
    // retry confirmEnrollment call.
    window.setTimeout(
      echo.confirmEnrollmentEndpoints(serviceId, requestNonce, responseNonce,
          sendResponse, providerResponse, retryNum + 1),
      1000);
  };
  const body = echo.getRequestBody({serviceId, requestNonce, responseNonce});
  echo.log.debug('Request body: ' + body);
  xhr.send(body);
  window.setTimeout(
    function() {
      if (xhr.xhr_success) {
        // XHR succeeded. Ignore timeout.
        return;
      }
      googleAnalytics.sendMetricXhrTimeout();
      // abort the current xhr.
      xhr.abort();
      // retry confirmEnrollment call
      echo.confirmEnrollmentEndpoints(serviceId, requestNonce, responseNonce,
          sendResponse, providerResponse, retryNum + 1);
    },
    echo.XHR_TIMEOUT_MS);
};

/**
 * Makes ECHO RPC call via Google API to confirm enrollment.
 * After the API is done, post response to provider.
 *
 * @param {string} serviceId The serviceId of the request.
 * @param {string} requestNonce The request nonce generated by redemption page.
 * @param {string} responseNonce The response nonce returned in
 *                               checkEligibility call response.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 * @param {object} providerResponse Response to be sent to the provider.
 *
 */
echo.confirmEnrollmentEndpoints =
    function(
        serviceId,
        requestNonce,
        responseNonce,
        sendResponse,
        providerResponse,
        retryNum) {
  if (retryNum >= 5) {
    echo.log.error('confirmEnrollment call failures exceed max retry');
    echo.postEligibilityResponse(sendResponse, providerResponse);
    return;
  }
  var xhr = echo.getEchoEndpointsXhr('confirmEnrollment');
  googleAnalytics.setDimensionApiName('confirmEnrollmentEndpoints');
  googleAnalytics.sendMetricApiCalls();
  xhr.onload = function() {
    xhr.xhr_success = true;

    echo.log.debug('XHR succeeded. response is ' + xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    if (!response.result) {
      // Google Endpoints front end returned an error, retry.
      window.setTimeout(
          echo.confirmEnrollmentEndpoints(
              serviceId,
              requestNonce,
              responseNonce,
              sendResponse,
              providerResponse,
              retryNum + 1),
          1000);
      return;
    }
    echo.log.info('Raw ECHO server response from confirmEnrollment = ' +
        JSON.stringify(response.result));
    echo.postEligibilityResponse(sendResponse, providerResponse);
  };
  xhr.error = function() {
    echo.log.warn('Google Endpoints confirmEnrollment request failed.');
    googleAnalytics.sendMetricXhrError();
    // retry confirmEnrollment call.
    window.setTimeout(
        echo.confirmEnrollment(
            serviceId,
            requestNonce,
            responseNonce,
            sendResponse,
            providerResponse,
            retryNum + 1),
        1000);
  };
  var bodyParameters =
      echo.createConfirmEnrollmentRequest(
          serviceId, requestNonce, responseNonce);
  echo.log.debug('Sending XHR request with body: ' + bodyParameters);
  xhr.send(bodyParameters);
  window.setTimeout(
      function() {
        if (xhr.xhr_success) {
          // XHR succeeded. Ignore timeout.
          return;
        }
        googleAnalytics.sendMetricXhrTimeout();
        // abort the current xhr.
        xhr.abort();
        // retry confirmEnrollment call
        echo.confirmEnrollment(
            serviceId,
            requestNonce,
            responseNonce,
            sendResponse,
            providerResponse,
            retryNum + 1);
      },
      echo.XHR_TIMEOUT_MS);
};

/**
 * Persist eligibility response to Local State.
 *
 * @param{object} response: The response from checkEligibility call.
 * @param{boolean} isOtc: Whether the regcode is otc.
 */
echo.persistCheckEligibilityResponse = function(response, isOtc) {
  // Store the bit for file app banner.
  // TODO(andycai) to be removed. Ping file app banner team to check
  // eligibility check bit in new location.
  chrome.echoPrivate.setOfferInfo(response.serviceId,
      {eligibilityCheckedDate: echo.convertDateToString(new Date())});

  // Store offer info in Local State
  chrome.echoPrivate.getOfferInfo(OFFER_INFO,
    function(offerInfo) {
      if (chrome.runtime.lastError) {
        echo.log.info('Offer info is not available in Local State');
        // offer info is not available in Local State.
        // This is rare case as we will keep retrying to retrieve offer
        // info from ECHO server.
        // Create the object to store the bit info now.
        offerInfo = {};
        // The extension hasn't downloaded complete offer info from
        // ECHO server yet, mark this to download in the future.
        offerInfo[echo.COMPLETE_OFFER_INFO_FROM_SERVER] = false;
      }

      // If services is not defined before
      if (!offerInfo.services) {
        offerInfo.services = {};
      }

      // In case offer info is not available for this serviceId
      if (!offerInfo.services[response.serviceId]) {
        offerInfo.services[response.serviceId] = {};
      }

      // Store the service id of the last request to Local State
      offerInfo[LAST_SERVICE_ID] = response.serviceId;

      // Mark an eligible request with non-otc regcode.
      if (!isOtc && response.result == 'ELIGIBLE') {
        offerInfo[echo.NON_OTC_ELIGIBLE] = true;
      }

      // store the eligibility check date
      echo.setOfferInfoFieldIfNecessary(offerInfo, response.serviceId,
          echo.ELIGIBILITY_CHECKED_DATE,
          echo.convertDateToString(new Date()));

      // store the eligibility checked time in millisecs
      echo.setOfferInfoFieldIfNecessary(offerInfo, response.serviceId,
          echo.ELIGIBILITY_CHECKED_TIME, (new Date()).getTime());

      // store promo code if it's returned from ECHO server
      echo.setOfferInfoFieldIfNecessary(offerInfo, response.serviceId,
          PROMO_CODE, response.promoCode);

      // store expiration date of promo code if it's returned from
      // ECHO server
      echo.setOfferInfoFieldIfNecessary(offerInfo, response.serviceId,
          PROMO_CODE_EXPIRATION_DATE, response.promoCodeExpirationDate);

      // store redirect url if it's returned from ECHO server
      echo.setOfferInfoFieldIfNecessary(offerInfo, response.serviceId,
          REDIRECT_URL, response.redirectUrl);
      chrome.echoPrivate.setOfferInfo(OFFER_INFO, offerInfo);
    });
}

/**
 * Cache the last request serviceId in Local State.
 *
 * @param {string} serviceId The id of the service.
 */
echo.cacheLastServiceId = function(serviceId) {
  // Store the current request serviceId as last service id in Local State
  chrome.echoPrivate.getOfferInfo(OFFER_INFO,
    function(offerInfo) {
      if (chrome.runtime.lastError) {
        echo.log.info('Offer info is not available in Local State');
        // offer info is not available in Local State.
        // This is rare case as we will keep retrying to retrieve offer
        // info from ECHO server.
        // Create the object to store the bit info now.
        offerInfo = {};
        // The extension hasn't downloaded complete offer info from
        // ECHO server yet, mark this to download in the future.
        offerInfo[echo.COMPLETE_OFFER_INFO_FROM_SERVER] = false;
      }

      // Store the service id of the last request to Local State
      offerInfo[LAST_SERVICE_ID] = serviceId;
      chrome.echoPrivate.setOfferInfo(OFFER_INFO, offerInfo);
    });
}

/**
 * Set the field of offerInfo for a serviceId if the fieldValue is not null
 */
echo.setOfferInfoFieldIfNecessary = function(offerInfo, serviceId,
    fieldKey, fieldValue) {
  if (fieldValue) {
    offerInfo.services[serviceId][fieldKey] = fieldValue;
  }
}

/**
 * Persist error message into local storage.
 *
 * @param {string} errorMessage The error message we get from ECHO server.
 */
echo.persistErrorMessage = function(errorMessage) {
  localStorage.setItem(echo.ERROR_KEY, errorMessage);
}

/**
 * Persist error message into local storage given error key string.
 * @param {string} keyString The key string we get from ECHO server.
 */
echo.persistErrorMessageByKeyString = function(keyString) {
  var tag = '</a>';
  var errorMessage = null;

  if (keyString == 'OTC_SERVICE_DOES_NOT_MATCH') {
    errorMessage = chrome.i18n.getMessage('OTC_SERVICE_DOES_NOT_MATCH',
      [echo.CHROME_OS_SUPPORT_LINK_HTML, tag]);
  } else if (keyString == 'DEVICE_NOT_ELIGIBLE') {
    errorMessage = chrome.i18n.getMessage('DEVICE_NOT_ELIGIBLE',
      [echo.HELP_CENTER_LINK_HTML, tag]);
  } else if (!keyString) {
    errorMessage = chrome.i18n.getMessage('GENERIC_ERROR_MESSAGE');
  } else {
    errorMessage = chrome.i18n.getMessage(keyString);
  }

  if (keyString != 'DEVICE_NOT_ELIGIBLE') {
    errorMessage = errorMessage
      + chrome.i18n.getMessage('LEARN_MORE', [echo.HELP_CENTER_LINK_HTML, tag]);
  }

  echo.persistErrorMessage(errorMessage);
}

/**
 * Get embedded device registration code.
 *
 * If detected as not running with the necessary extension API access,
 * a fake code is returned.
 *
 * @param {boolean} isGroupType Type of code.
 * @param {function(string)} callback Callback to invoke once code is fetched.
 */
echo.getDeviceCode = function(isGroupType, callback) {
  // Codes to return when embedded device code is not available.
  var FAKE_COUPON_CODE = 'fakeuniquecode';
  var FAKE_GROUP_CODE = 'fakegroupcode';
  if (!chrome.echoPrivate) {
    echo.log.warn('Not running with embedded code access. Returning a fake.');
    callback(isGroupType ? FAKE_GROUP_CODE : FAKE_COUPON_CODE);
    return;
  }
  var getRegCodeHistoryWrapperCallback = function(code) {
    // compare with result from the last getRegistrationCode call
    // capture and send event for cases where a read failure is followed by read success
    callback(code);
    var getRegCodeSucceeded = !!code;
    chrome.echoPrivate.getOfferInfo(LAST_GET_REG_CODE_RESULT,
      function(result) {
        if (result && result.lastCallSucceeded === false && getRegCodeSucceeded) {
          googleAnalytics.sendMetricTemporaryRegCodeReadError();
        }
        chrome.echoPrivate.setOfferInfo(LAST_GET_REG_CODE_RESULT,
          {lastCallSucceeded: getRegCodeSucceeded});
      });
  }
  chrome.echoPrivate.getRegistrationCode(
    isGroupType ? 'GROUP_CODE' : 'COUPON_CODE',
    getRegCodeHistoryWrapperCallback);
};

/**
 * Get the max device activation date.
 * For more info, see design doc http://goo.gl/V56o8
 *
 * This function applies a fuzz of +6 to +15 to the vpd_first_activate_week
 * parameter. This results in an effective fuzz of +0 to +15 from the true
 * device activation date.
 *
 * Suppose a week starts on Monday, the 1st.
 * Any device activation during that week will report the OOBE timestamp as the
 * 1st (see below for details).
 * This function returns an output from the 7th to the 16th.
 * The effective fuzz from a device activated on Monday (1st) is +6 to +15.
 * The effective fuzz from a device activated on Sunday (7th) is +0 to +9.
 * Thus, the overall effective fuzz is +0 to +15.
 *
 * @param {string} vpd_first_activate_week The date of the first Monday on the
 * week that the device was initially activated.
 * This is retrieved from VPD.
 * See chromium/src/chromeos/ash/components/report/utils/time_utils.cc
 *  (GetFirstActiveWeek)
 * and chromium/src/chrome/browser/ash/crosapi/echo_private_ash.cc
 *  (GetOobeTimestamp).
 * Thus, this timestamp has an effective fuzz of -6 to 0 days.
 *
 * @return {Date} The obscured device activation date.
 */
echo.getMaxDeviceActivationDate = function(vpd_first_activate_week) {
  if (!vpd_first_activate_week) {
    return '';
  }
  const OBSCURING_DAYS = 9;
  const MIN_OBSCURING_DAYS = 6;

  const cur_date = new Date();
  const cur_timestamp_utc = Date.UTC(
      cur_date.getUTCFullYear(), cur_date.getUTCMonth(), cur_date.getUTCDate());

  const timeInfo = vpd_first_activate_week.split('-');
  const year = parseInt(timeInfo[0]);
  const month = parseInt(timeInfo[1]);
  const day = parseInt(timeInfo[2]);
  const oobe_timestamp_utc = new Date(Date.UTC(year, month - 1, day));
  const oobe_timestamp_utc_with_min_offset =
        new Date(oobe_timestamp_utc.getTime() +
                 MIN_OBSCURING_DAYS * echo.MILLISEC_PER_DAY);

  // Get number of days between current date and oobe date.
  let days_between = Math.floor(
      (cur_timestamp_utc - oobe_timestamp_utc_with_min_offset) /
      echo.MILLISEC_PER_DAY);
  if (days_between < 0) {
    return cur_date;
  } else if (days_between > OBSCURING_DAYS) {
    days_between = OBSCURING_DAYS;
  }
  return echo.generateRandomDate(oobe_timestamp_utc_with_min_offset,
                                 days_between);
}

/**
 * Generate a random date in the range
 * [utc_date_timestamp_lowerbound,
 *  utc_date_timestamp_lowerbound + bucket_size_days].
 * Note that this range is inclusive.
 *
 * @param {int} utc_date_timestamp_lowerbound The lowerbound date in utc
 * timestamp of the bucket.
 * @param {int} bucket_size_days The bucket size.
 * @return {Date} A randomly generated date within the given bucket.
 */
echo.generateRandomDate = function(utc_date_timestamp_lowerbound,
                                   bucket_size_days) {
  const random_num_of_days = Math.floor(Math.random() *
                                        (bucket_size_days + 1));
  return new Date(utc_date_timestamp_lowerbound.getTime() +
                  random_num_of_days * echo.MILLISEC_PER_DAY);
}

/**
 * Convert date to utc date string.
 *
 * @param {Date} date.
 * @return {string} A string representation of the given date in format
 * yyyy-mm-dd.
 */
echo.convertDateToString = function(date) {
  return date.getUTCFullYear() +
      "-" + (date.getUTCMonth() + 1) +
      "-" + date.getUTCDate();
}

/**
 * Triggers the eligibility check depending on the result of user opt-in.
 *
 * Depending on the consent parameter, this method will extract the
 * request parameters from the web intents request for making elgibility
 * check call to Google API.
 *
 * If the intent parameters contain a one-time-code (OTC), it will not query
 * the system for the embedded registration code.
 *
 * @param {bool} result Result of the user opt-in.
 * @param {object} requestData Parameters to use for eligibility request.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 */
echo.consentCallback = function(result, requestData, sendResponse) {
  if (result != true) {
    googleAnalytics.sendMetricConsentDenied();
    echo.persistErrorMessage(chrome.i18n.getMessage('CONSENT_DENIED'));
    echo.postEligibilityResponse(sendResponse);
    return;
  }
  var requestParams = {origin: requestData.origin,
                       serviceId: requestData.serviceId,
                       serviceProviderAlias: requestData.serviceName,
                       requestNonce: requestData.requestNonce};
  if (requestData.isGroupType)
    requestParams.opt_isGroupType = requestData.isGroupType;
  if (requestData.otcCode) {
    echo.log.info('OTC code found in request, skipping device code request.');
    requestParams.code = requestData.otcCode;
    requestParams.isOtc = true;
    googleAnalytics.setDimensionCodeType('otc');
    echo.getMaxDeviceActivationDateAndStartEligibilityCheck(requestParams,
                                                            sendResponse);
  } else {
    echo.log.info('Requesting device code (isGroupType = ' +
      requestData.isGroupType + ')');
    googleAnalytics.setDimensionCodeType(
        requestData.isGroupType ? 'groupCode' : 'regCode');
    echo.getDeviceCode(requestData.isGroupType,
      function(code) {
        if (!code) {  // Empty code.
          googleAnalytics.sendMetricNoRegCode();
          echo.sendMetricNoRegcodeAfterEligibleRequest();
          echo.persistErrorMessage(chrome.i18n.getMessage('ERROR_NO_REGCODE',
            [echo.CHROME_OS_SUPPORT_LINK_HTML, '</a>']));
          echo.log.error('Empty code was found on device. Ineligible.');
          echo.postEligibilityResponse(sendResponse);
          return;
        }
        requestParams.code = code;
        // Nest the async call.
        echo.getMaxDeviceActivationDateAndStartEligibilityCheck(requestParams,
                                                                sendResponse);
      });
  }
};

/**
 * Send the metric failure_retrieve_regcode_after_eligible_request to Google
 * Analytics if there were eligible requests with non-otc code before and
 * this metric is not sent before.
 */
echo.sendMetricNoRegcodeAfterEligibleRequest = function() {
  chrome.echoPrivate.getOfferInfo(OFFER_INFO,
    function(offerInfo) {
      if (!chrome.runtime.lastError
          && offerInfo[echo.NON_OTC_ELIGIBLE]
          && !offerInfo[
              echo.FAILURE_RETRIEVE_REGCODE_AFTER_ELIGIBLE_METRIC_SENT]) {
        googleAnalytics.sendMetricNoRegCodeAfterEligibleRequest();
        offerInfo[echo.FAILURE_RETRIEVE_REGCODE_AFTER_ELIGIBLE_METRIC_SENT]
            = true;
        chrome.echoPrivate.setOfferInfo(OFFER_INFO, offerInfo);
      }
    });
}

/**
 * Exits and returns result to the caller.
 *
 * If in debug mode, the result is not actually posted back to
 * the intent raiser. If no response is passed in the arguments,
 * a failure result is assumed.
 *
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 * @param {object} opt_providerResponse Response to be sent to the provider.
 */
echo.postEligibilityResponse = function(sendResponse, opt_providerResponse) {
  if (echo.DEBUG_MODE)
    return;
  if (!opt_providerResponse) {
    sendResponse(null);
    return;
  }
  if (opt_providerResponse == 'RETRY') {
    sendResponse(opt_providerResponse);
    return;
  }
  sendResponse(opt_providerResponse);
};

/**
 * Get offer info from ECHO server.
 * @param {function=} callback Function to call upon success or failure.
 */
echo.remoteGetOfferInfo = function(callback) {
  const xhr = echo.getEchoApiXhr('get');
  googleAnalytics.setDimensionApiName('getOfferInfo');
  googleAnalytics.sendMetricApiCalls();
  var response = {};
  xhr.onload = function() {
    xhr.xhr_success = true;

    echo.log.debug('XHR succeeded. response is ' + xhr.responseText);
    if (!JSON.parse(xhr.responseText)) {
      // Google API front end returned an error.
      response.error = 'xhr failed';
      return;
    }
    response.result =
        JSON.parse(xhr.responseText).serviceInfoForDeviceList;
    echo.processRemoteOfferInfo(response, callback);
  }
  var failed = false;
  xhr.error = function() {
    echo.log.warn('Google API request failed.');
    googleAnalytics.sendMetricXhrError();
    failed = true;
    echo.remoteGetOfferInfoEndpoints(callback);
  };
  xhr.send();
  window.setTimeout(
      function() {
        if (xhr.xhr_success) {
          // XHR succeeded. Ignore timeout.
          return;
        }
        if (!failed) {
          googleAnalytics.sendMetricXhrTimeout();
        }
        // abort the current xhr.
        xhr.abort();
        response.error = 'xhr failed';
        echo.processRemoteOfferInfo(response);
        if (!failed) echo.remoteGetOfferInfoEndpoints(callback);
      },
      echo.XHR_TIMEOUT_MS);
}

/**
 * Get offer info from ECHO server using Google Endpoints.
 * @param {function=} callback Function to call upon success or failure.
 */
echo.remoteGetOfferInfoEndpoints = function(callback) {
  var xhr = echo.getEchoEndpointsXhr('getOfferInfo');
  googleAnalytics.setDimensionApiName('getOfferInfoEndpoints');
  googleAnalytics.sendMetricApiCalls();
  var response = {};
  xhr.onload = function() {
    xhr.xhr_success = true;

    echo.log.debug('XHR succeeded. response is ' + xhr.responseText);
    if (!JSON.parse(xhr.responseText)) {
      // Google API front end returned an error.
      response.error = 'xhr failed';
      echo.processRemoteOfferInfo(response);
      return;
    }
    response.result =
        JSON.parse(xhr.responseText).serviceInfoForDeviceList;
    echo.processRemoteOfferInfo(response);
    if (callback) callback();
  }
  var failed = false;
  xhr.error = function() {
    echo.log.warn('Google API request failed.');
    googleAnalytics.sendMetricXhrError();
    failed = true;
    if (callback) callback();
  };
  var bodyParameters = echo.createGetOfferInfoConfigRequestParams();
  echo.log.debug('Sending XHR request with body: ' + bodyParameters);
  xhr.send(bodyParameters);
  window.setTimeout(
    function() {
      if (xhr.xhr_success) {
        // XHR succeeded. Ignore timeout.
        return;
      }
      if (!failed) {
        googleAnalytics.sendMetricXhrTimeout();
      }
      // abort the current xhr.
      xhr.abort();
      response.error = 'xhr failed';
      if (!failed && callback) callback();
    },
  echo.XHR_TIMEOUT_MS);
}

/**
* Process the remote offer info and stores it in Local State.
* After that, set up notification.
* @param {function=} callback Function to call upon success or failure.
*/
echo.processRemoteOfferInfo = function(remote_response, callback) {
  // XHR call failed, set up alarm to retry.
  if (remote_response.error) {
    if (callback) callback();
    return;
  }

  // Get offer info from Local State first, if offer info
  // doesn't exist in Local State, create object. If partial
  // offer info such as eligibility checked info is available,
  // merge the complete offer info from ECHO server.
  chrome.echoPrivate.getOfferInfo(OFFER_INFO,
      function(object) {
        // If the object doesn't exist, initialize it.
        if (chrome.runtime.lastError) {
          object = {};
        }
        if (!object.services) {
          object.services = {};
        }

        // call hwid API to find the device family, and store
        // the offer info for this device into Local State.
        chrome.chromeosInfoPrivate.get(['hwid'],
            function(hwidObject) {
              const device = echo.parseDeviceFromHwidObject(hwidObject);
              if (!device) {
                return;
              }

              // Get the oobe timestamp to compute warning date and
              // expiration date for offers.
              chrome.echoPrivate.getOobeTimestamp(
                  function(timestamp) {
                    echo.log.info('Got OOBE timestamp ' + timestamp);
                    if (timestamp == null || timestamp == '') {
                      return;
                    }
                    echo.storeOfferInfoForDevice(
                        device,
                        timestamp,
                        object,
                        remote_response.result);
                    if (callback) callback();
                  });
            });
      });
}

/**
 * Stores remote offer info for the device in local cache.
 *
 * @param {string} device_family The device family of the device.
 * @param {string} oobe_timestamp The datestring of the oobe time.
 * @param {object} object The object to be stored in Local State.
 * @param {object} remote_offer_info The offer info from ECHO server.
 */
echo.storeOfferInfoForDevice = function(
    device_family,
    oobe_timestamp,
    object,
    remote_offer_info) {
  var offer_info_found_for_device = false;
  if (remote_offer_info) {
    for (var i = 0; i < remote_offer_info.length; i++) {
      offer_info_for_device = remote_offer_info[i];

      if (device_family !== offer_info_for_device.deviceFamily) {
        continue;
      }

      echo.log.info('Found offer_info '
          + JSON.stringify(offer_info_for_device.serviceInfoList)
          + ' for device ' + device_family);

      offer_info_found_for_device = true;

      // A list of offers are available for the device.
      for (var idx = 0;
          idx < offer_info_for_device.serviceInfoList.length;
          idx++) {
        service_info = offer_info_for_device.serviceInfoList[idx];

        // Initialize for the service id if necessary.
        if (!object.services[service_info.serviceId]) {
          object.services[service_info.serviceId] = {};
        }

        if (service_info.offerEndDate) {
          object.services[service_info.serviceId].offer_end_date
              = service_info.offerEndDate;
        }
      }
      // Exit the loop as offer info for this device is found.
      break;
    }
  }

  // Store the offer info to Local State
  if (offer_info_found_for_device) {
    object[echo.COMPLETE_OFFER_INFO_FROM_SERVER] = true;
    chrome.echoPrivate.setOfferInfo(OFFER_INFO, object);
  }
  return offer_info_found_for_device;
}

/**
 * A configuration for what offers are visible for a given website.
 */
echo.EXTERNAL_CALLER_CONFIG = [
  {
    // Allow all domains listed https://www.google.com/supported_domains
    matches: '^https?:\/\/www\\.google\\.'
        + '(com|ad|ae|com\\.af|com\\.ag|com\\.ai|al|am|com\\.ao|com\\.ar|as|'
        + 'at|com\\.au|az|ba|com\\.bd|be|bf|bg|com\\.bh|bi|bj|com\\.bn|'
        + 'com\\.bo|com\\.br|bs|bt|com\\.bw|by|com\\.bz|ca|cd|cf|cg|ch|'
        + 'ci|com\\.ck|cl|cm|cn|com\\.co|com\\.cr|com\\.cu|cv|com\\.cy|'
        + 'cz|de|dj|dk|dm|com\\.do|dz|com\\.ec|ee|com\\.eg|es|com\\.et|'
        + 'fi|com\\.fj|fm|fr|ga|ge|gg|com\\.gh|com\\.gi|gl|gm|gr|com\\.gt|'
        + 'gy|com\\.hk|hn|hr|ht|hu|com\\.id|ie|com\\.il|im|com\\.in|iq|is|it|'
        + 'je|com\\.jm|jo|com\\.jp|com\\.ke|com\\.kh|ki|kg|com\\.kr|com\\.kw|'
        + 'kz|la|com\\.lb|li|lk|com\\.ls|lt|lu|lv|com\\.ly|com\\.ma|md|me|mg|'
        + 'mk|ml|com\\.mm|mn|ms|com\\.mt|mu|mv|mw|com\\.mx|com\\.my|com\\.mz|'
        + 'com\\.na|com\\.ng|com\\.ni|ne|nl|no|com\\.np|nr|nu|com\\.nz|'
        + 'com\\.om|com\\.pa|com\\.pe|com\\.pg|com\\.ph|com\\.pk|pl|pn|'
        + 'com\\.pr|ps|pt|com\\.py|com\\.qa|ro|ru|rw|com\\.sa|com\\.sb|sc|se|'
        + 'com\\.sg|sh|si|sk|com\\.sl|sn|so|sm|sr|st|com\\.sv|td|tg|com\\.th|'
        + 'com\\.tj|tl|tm|tn|to|com\\.tr|tt|com\\.tw|com\\.tz|com\\.ua|'
        + 'com\\.ug|com\\.uk|com\\.uy|com\\.uz|com\\.vc|com\\.ve|vg|com\\.vi|'
        + 'com\\.vn|vu|ws|rs|com\\.za|com\\.zm|com\\.zw|cat)'
        + '\/.*chromebook\/.*',
    config: {
      serviceIds: ['all'],
      canCheckModel: true
    }
  },
  {
    matches: '^https?:\/\/chromebook[a-zA-Z0-9_-]*-dot-uat-dot-chromebook-prod'
        + '\\.uc\\.r\\.appspot\\.com\/.*chromebook\/.*',
    config: {
      serviceIds: ['all'],
      canCheckModel: true
    }
  },
  {
    matches: '^https?:\/\/chromebook[a-zA-Z0-9_-]*-dot-googwebreview'
        + '\\.appspot\\.com\/.*chromebook\/.*',
    config: {
      serviceIds: ['all'],
      canCheckModel: true
    }
  },
  {
    // Get Help App.
    matches: '^ljoammodoonkhnehlncldjelhidljdpi$',
    config: {
      serviceIds: ['all'],
      canCheckModel: true
    }
  }
];

/**
 * Get service ids that a website is allowed to see.
 *
 * @param {sender} MessageSender object.
 */
echo.getCallerConfig = function(sender) {
  var origin = sender.url || sender.id;
  if (origin) {
    for (var i = 0; i < echo.EXTERNAL_CALLER_CONFIG.length; i++) {
      var config = echo.EXTERNAL_CALLER_CONFIG[i];
      var pattern = new RegExp(config.matches, 'i');
      if (pattern.test(origin)) {
        return config.config;
      }
    }
  }
};

/**
 * Get service ids that a website is allowed to see.
 *
 * @param {sender} MessageSender object.
 */
echo.getVisibleServiceIds = function(sender) {
  var config = echo.getCallerConfig(sender);
  if (config && config.serviceIds) {
    return config.serviceIds;
  }
};

/**
 * Check if caller can check device model.
 */
echo.canCheckModel = function(sender) {
  var config = echo.getCallerConfig(sender);
  return config && config.canCheckModel;
};

/**
 * Provide registered websites and packaged apps a way to identify the offers
 * that a visiting Chromebook model is eligible for.
 *
 * @param {sender} MessageSender object.
 * @param {sendResponse} callback method.
 */
echo.checkModelEligibility = function(sender, sendResponse) {
  var visibleIds = echo.getVisibleServiceIds(sender);
  if (!visibleIds) {
    // sender is not allowed to see any service id.
    sendResponse(undefined);
    return;
  }
  // Refresh locally stored info about services.
  echo.remoteGetOfferInfo(function() {
    chrome.echoPrivate.getOfferInfo(OFFER_INFO,
        function(object) {
          var eligibleServiceIds = [];
          if (object != null && object.services) {
            for (id in object.services) {
              if (visibleIds.indexOf(id) != -1 || visibleIds[0] == 'all')
                eligibleServiceIds.push(id);
            }
          }
          sendResponse({"eligibleServiceIds": eligibleServiceIds});
        });
  });
}

/*
 * Get the device family.
 *
 * @param {function} callback The callback method.
 */
echo.getDeviceFamily = function(callback) {
  chrome.chromeosInfoPrivate.get(['hwid'],
    function(hwidObject) {
      const device =
          echo.parseDeviceFromHwidObject(hwidObject, 'unknown_device');
      callback(device);
    });
};

/**
 * Setup extension message listener for requests from the broker
 * and not-eligible page.
 */
echo.setupInternalMessageListener = function() {
  var messageListener = function(request, sender, sendResponse) {
    echo.getDeviceFamily(function(deviceFamily) {
      if (request.cmd == CMD_GET_OFFER_INFO) {
        // Message from not-eligible page to get offer info.
        chrome.echoPrivate.getOfferInfo(OFFER_INFO,
          function(offerInfo) {
            if (chrome.runtime.lastError) {
              offerInfo = {};
            }
            offerInfo.deviceFamily = deviceFamily;
            sendResponse(offerInfo);
          });
      } else {
        // Message from broker page.
        if (request.isDebugMode)
          echo.DEBUG_MODE = true;

        echo.cacheLastServiceId(request.serviceId);
        googleAnalytics.setDimensionServiceId(request.serviceId);
        googleAnalytics.setDimensionDeviceFamily(deviceFamily);

        if (!request.origin || (request.origin.indexOf("https") != 0 &&
            request.origin.indexOf("chrome-extension") != 0)) {
          echo.log.warn("Request not coming from https connection.");
          googleAnalytics.sendMetricFailOriginCheck();
          echo.persistErrorMessage(chrome.i18n.getMessage(
                                   'ERROR_ORIGIN_FAILURE'));
          echo.postEligibilityResponse(sendResponse);
        } else if (!sender.tab) {
          echo.log.warn("Request not comming from a tab.");
          echo.postEligibilityResponse(sendResponse);
        } else {
          echo.checkPromoCodeInLocalAndRequestConsentIfNecessary(request.origin,
              request.serviceName, sender.tab.id, request, sendResponse);
        }
      }
    });
    return true;
  };
  chrome.runtime.onMessage.addListener(messageListener);
};

/**
 * Handles CheckEligibility request received as external message.
 *
 * @param {sender} MessageSender object.
 * @param {data} checkEligibility request data.
 * @param {sendResponse} callback method.
 */
echo.checkEligibilityMessageFlow = function(sender, data, sendResponse) {
  var serviceId = UNKNOWN_SERVICE_ID;
  if (data.serviceId) {
    serviceId = data.serviceId;
  }

  echo.cacheLastServiceId(serviceId);
  googleAnalytics.setDimensionServiceId(serviceId);
  echo.getDeviceFamily(function(deviceFamily) {
    googleAnalytics.setDimensionDeviceFamily(deviceFamily);
    if (sender.url && sender.url.indexOf("https") != 0) {
      // if request comes from webpage, then it has to be under https
      // connection.
      echo.log.warn("Request not coming from https connection.");
      googleAnalytics.sendMetricFailOriginCheck();
      echo.persistErrorMessage(chrome.i18n.getMessage('ERROR_ORIGIN_FAILURE'));
      echo.postEligibilityResponse(sendResponse);
      return;
    }
    data.origin = sender.url || sender.id;
    if (!data.origin) {
      // ignore request when origin is unknown.
      echo.log.warn("Request comes from unknown origin.");
      googleAnalytics.sendMetricFailOriginCheck();
      echo.persistErrorMessage(chrome.i18n.getMessage('ERROR_ORIGIN_FAILURE'));
      echo.postEligibilityResponse(sendResponse);
    } else if (!sender.tab) {
      // Ignore requests that do not come from a tab - this could be the case
      // for messages sent from a platform app (but requests not coming from
      // https:// origin are rejected before this point).
      echo.log.warn("Request not comming from a tab.");
      echo.postEligibilityResponse(sendResponse);
    } else {
      echo.checkPromoCodeInLocalAndRequestConsentIfNecessary(data.origin,
          data.serviceName, sender.tab.id, data,
          sendResponse);
    }
  });
};

/**
 * Check promo code in Local State first, if promo code is found, return empty
 * Otherwise, start eligibility check by requesting consent.
 *
 * @param {string} origin Origin to show in the consent dialog.
 * @param {string} serviceName Friendly name of the service requesting consent.
 * @param {number} tabId ID of the tab that requested the user consent.
 * @param {object} requestData Parameters to use for the eligibility request.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 */
echo.checkPromoCodeInLocalAndRequestConsentIfNecessary =
    function(origin, serviceName, tabId, data, sendResponse) {
  // There are two types of services, ones that use promo codes, and ones
  // that do not. Promo-code based services cache response info in locally
  // to be used in subsequent calls.
  chrome.echoPrivate.getOfferInfo(OFFER_INFO,
      function(offerInfo) {
    if (!chrome.runtime.lastError
        && offerInfo.services
        && offerInfo.services[data.serviceId]
        && offerInfo.services[data.serviceId][PROMO_CODE]) {
      // Cached promo code is found in Local State, use it.

      // store last service id to Local State
      offerInfo[LAST_SERVICE_ID] = data.serviceId;
      chrome.echoPrivate.setOfferInfo(OFFER_INFO, offerInfo);

      if (offerInfo.services[data.serviceId][echo.ELIGIBILITY_CHECKED_TIME]
          + echo.PROMO_CODE_ACCESS_PERIOD_IN_MS > (new Date()).getTime()) {
        // This request happened within the time range, return promo code back
        echo.returnPromoCodeInfo(data, offerInfo.services[data.serviceId],
                                 sendResponse);
      } else {
        // This request is too old, return nothing back
        echo.postEligibilityResponse(sendResponse);
      }
    } else {
      // No promo code is found in Local State, request consent
      echo.requestConsent(origin, serviceName, tabId, data, sendResponse);
    }
  });
};

/**
 * Send local promo code info back to get promo code page.
 *
 * @param {object} data Parameters to use for the eligibility request.
 * @param {object} serviceInfo The service info stored in Local State.
 * @param {function(object)} sendResponse Method to use for posting the ECHO
 *                                        response.
 */
echo.returnPromoCodeInfo = function(data, serviceInfo, sendResponse) {
  var result = {result: 'ELIGIBLE',
                serviceId: data.serviceId,
                requestNonce: data.requestNonce,
                promoCode: serviceInfo[PROMO_CODE],
                promoCodeExpirationDate:
                    serviceInfo[PROMO_CODE_EXPIRATION_DATE]};
  var providerResponse = {requestNonce: data.requestNonce,
                          eligibilityResponse: result};
  echo.postEligibilityResponse(sendResponse, providerResponse);
}

/**
 * Get the model of the device if caller is whitelisted.
 *
 * @param {sender} MessageSender object.
 * @param {sendResponse} callback method.
 */
echo.getModel = function(sender, sendResponse) {
  if (!echo.canCheckModel(sender)) {
    sendResponse(undefined);
    return;
  }
  chrome.chromeosInfoPrivate.get(['hwid'],
    function(hwidObject){
      const device = echo.parseDeviceFromHwidObject(hwidObject);
      sendResponse(device);
    });
};

/**
 * Setup external message listener.
 *
 * The message listener expects a request object of format {cmd:"", data:{}},
 * where cmd is the name of the request, and data is the request data.
 */
echo.setupExternalMessageListener = function() {
  var messageListener = function(request, sender, sendResponse) {
    if (request.cmd == echo.CMD.CHECK_MODEL_ELIGIBILITY)
      echo.checkModelEligibility(sender, sendResponse);
    else if (request.cmd == echo.CMD.CHECK_ELIGIBILITY)
      echo.checkEligibilityMessageFlow(sender, request.data, sendResponse);
    else if (request.cmd == echo.CMD.GET_MODEL)
      echo.getModel(sender, sendResponse);
    else
      sendResponse(undefined);

    // returning true indicates we wish to send a response asynchronously.
    return true;
  };
  chrome.runtime.onMessageExternal.addListener(messageListener);
};

/**
 * Entry point for the extension.
 */
window.onload = function() {
  echo.setupInternalMessageListener();
  echo.setupExternalMessageListener();
};
