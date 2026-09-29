// Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//
// Setup Google Analytics

/**
 * Constants for Google Analytics events.
 */
// Event Category
_EVENT_CATEGORY_ELIGIBLE = 'eligible';
_EVENT_CATEGORY_NOT_ELIGIBLE = 'not_eligible';
_EVENT_CATEGORY_CLIENT_ERROR = 'client_side_error';
_EVENT_CATEGORY_API_CALL = 'api_call';
_EVENT_CATEGORY_NOTIFICATION = 'notification';
_EVENT_CATEGORY_PROMO_CODE = 'promo_code';
_EVENT_CATEGORY_NEED_MORE_INFO = 'need_more_info';
_EVENT_CATEGORY_INCOGNITO_CONTEXT = 'incognito_context';

// Event Action
_EVENT_ACTION_ELIGIBLE = 'eligible';
_EVENT_ACTION_NOT_ELIGIBLE_PAGE = 'not_eligible_page';
_EVENT_ACTION_NO_HWID = 'failure_retrieve_hwid';
_EVENT_ACTION_NO_CUSTOMIZATION_ID = 'failure_retrieve_customization_id';
_EVENT_ACTION_NO_OOBE = 'failure_retrieve_oobe';
_EVENT_ACTION_NO_REGCODE = 'failure_retrieve_regcode';
_EVENT_ACTION_NO_REGCODE_AFTER_ELIGIBLE_REQUEST =
    'failure_retrieve_regcode_after_eligible_request';
_EVENT_ACTION_TEMPORARY_REGCODE_READ_ERROR = 'temporary_regcode_read_error'
_EVENT_ACTION_FAIL_ORIGIN_CHECK = 'failure_origin_check';
_EVENT_ACTION_CONSENT_DENIED = 'consent_denied';
_EVENT_ACTION_XHR_ERROR = 'xhr_error';
_EVENT_ACTION_XHR_TIMEOUT = 'xhr_timeout';
_EVENT_ACTION_API_CALLS = 'api_calls';
_EVENT_ACTION_NOTIFICATION_SENT = 'notification_sent';
_EVENT_ACTION_NOTIFICATION_CLICKED = 'notification_clicked';
_EVENT_ACTION_PROMO_CODE_BUTTON_CLICKED = 'redeem_promo_code_button_clicked';
_EVENT_ACTION_NEED_MORE_INFO = 'need_more_info';
_EVENT_ACTION_INCOGNITO_CONTEXT = 'incognito_context';

// Define a globl variable for Google Analytics tracker.
var analyticsService = analytics.getService('ECHO_Extension');
// Get a Tracker using our Google Analytics app Tracking ID.
var tracker = analyticsService.getTracker('UA-50252104-2');

var googleAnalytics = {};

/**
 * Method to initialize Google Analytics.
 *
 * @param {boolean} enabled Whether Google Analytics is enabled.
 */
googleAnalytics.initAnalytics = function(enabled) {
  // Set the dimension for Chrome OS version
  tracker.set('dimension4', googleAnalytics.getChromeOSVersion(
    window.navigator.appVersion));

  // Enable/disable Google Analytics.
  analyticsService.getConfig().addCallback(function(config) {
    config.setTrackingPermitted(enabled);
  });
}

/**
 * Get the Chrome OS version.
 *
 * @param {string} appVersion The userAgent app version.
 */
googleAnalytics.getChromeOSVersion = function(appVersion) {
  var matches = appVersion.match(/CrOS\s+\S+\s+([\d.]+)/);
  return  matches ? matches[1] : 'n/a';
}

/**
 * Initiazlie Google Analytics.
 */
try {
  chrome.metricsPrivate.getIsCrashReportingEnabled(
    googleAnalytics.initAnalytics);
} catch (err) {
  // Disable Google Analytics by default.
  googleAnalytics.initAnalytics(false);
}

/**
 * set the dimension serviceId for Google Analytics
 *
 * @param {string} serviceId The service id of the request.
 */
googleAnalytics.setDimensionServiceId = function(serviceId) {
  tracker.set('dimension1', serviceId);
}

/**
 * set the dimension api_name for Google Analytics
 *
 * @param {string} apiName The name of the API call to ECHO server.
 */
googleAnalytics.setDimensionApiName = function(apiName) {
  tracker.set('dimension2', apiName);
}

/**
 * Set the dimension device_family for Google Analytics.
 */
googleAnalytics.setDimensionDeviceFamily = function(deviceFamily) {
  tracker.set('dimension5', deviceFamily);
}

/**
 * Set the dimension code_type for Google Analytics.
 */
googleAnalytics.setDimensionCodeType = function(codeType) {
  tracker.set('dimension6', codeType);
}

/**
 * Send eligible metric to eligible event.
 */
googleAnalytics.sendMetricEligible = function() {
  tracker.set('metric1', 1);
  tracker.sendEvent(_EVENT_CATEGORY_ELIGIBLE, _EVENT_ACTION_ELIGIBLE);
}

/**
 * Send not-eligible metric and server error code dimension to
 * not eligible event.
 *
 * @param {string} errorCode The error code returned from
 *                              checkEligibility call.
 */
googleAnalytics.sendMetricNotEligible = function(errorCode) {
  tracker.set('dimension3', errorCode);
  tracker.set('metric2', 1);
  tracker.sendEvent(_EVENT_CATEGORY_NOT_ELIGIBLE, errorCode);
}

/**
 * Send failure_retrieve_hwid metric to event.
 */
googleAnalytics.sendMetricNoHwid = function() {
  tracker.set('metric3', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR, _EVENT_ACTION_NO_HWID);
}

/**
 * Send failure_retrieve_customization_id metric to event.
 */
googleAnalytics.sendMetricNoCustomizationId = function() {
  tracker.set('metric4', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR,
    _EVENT_ACTION_NO_CUSTOMIZATION_ID);
}

/**
 * Send failure_retrieve_oobe metric to event.
 */
googleAnalytics.sendMetricNoOobe = function() {
  tracker.set('metric5', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR, _EVENT_ACTION_NO_OOBE);
}

/**
 * Send failure_retrieve_regcode metric to event.
 */
googleAnalytics.sendMetricNoRegCode = function() {
  tracker.set('metric6', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR, _EVENT_ACTION_NO_REGCODE);
}

/**
 * Send failure_retrieve_regcode_after_eligible_request metric to event.
 */
googleAnalytics.sendMetricNoRegCodeAfterEligibleRequest = function() {
  tracker.set('metric15', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR,
    _EVENT_ACTION_NO_REGCODE_AFTER_ELIGIBLE_REQUEST);
}

/**
 * Send temporary_reg_code_read_error metric to event
 */
googleAnalytics.sendMetricTemporaryRegCodeReadError = function() {
  tracker.set('metric19', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR,
    _EVENT_ACTION_TEMPORARY_REGCODE_READ_ERROR);
}

/**
 * Send failure_origin_check metric to event.
 */
googleAnalytics.sendMetricFailOriginCheck = function() {
  tracker.set('metric7', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR,
    _EVENT_ACTION_FAIL_ORIGIN_CHECK);
}

/**
 * Send consent_denied metric to event.
 */
googleAnalytics.sendMetricConsentDenied = function() {
  tracker.set('metric8', 1);
  tracker.sendEvent(_EVENT_CATEGORY_CLIENT_ERROR,
    _EVENT_ACTION_CONSENT_DENIED);
}

/**
 * Send xhr_error metric to event.
 */
googleAnalytics.sendMetricXhrError = function() {
  tracker.set('metric9', 1);
  tracker.sendEvent(_EVENT_CATEGORY_API_CALL, _EVENT_ACTION_XHR_ERROR);
}

/**
 * Send xhr_timeout metric to event.
 */
googleAnalytics.sendMetricXhrTimeout = function() {
  tracker.set('metric10', 1);
  tracker.sendEvent(_EVENT_CATEGORY_API_CALL,
    _EVENT_ACTION_XHR_TIMEOUT);
}

/**
 * Send api_calls metric to event.
 */
googleAnalytics.sendMetricApiCalls = function() {
  tracker.set('metric16', 1);
  tracker.sendEvent(_EVENT_CATEGORY_API_CALL,
      _EVENT_ACTION_API_CALLS);
}

/**
 * Send not_eligible_page metric to event.
 */
googleAnalytics.sendMetricNotEligiblePage = function() {
  tracker.set('metric17', 1);
  tracker.sendEvent(_EVENT_CATEGORY_NOT_ELIGIBLE,
      _EVENT_ACTION_NOT_ELIGIBLE_PAGE);
}

/**
 * Send notification_sent metric to event.
 */
googleAnalytics.sendMetricNotificationSent = function() {
  tracker.set('metric11', 1);
  tracker.sendEvent(_EVENT_CATEGORY_NOTIFICATION,
    _EVENT_ACTION_NOTIFICATION_SENT);
}

/**
 * Send notification_clicked metric to event.
 */
googleAnalytics.sendMetricNotificationClicked = function() {
  tracker.set('metric12', 1);
  tracker.sendEvent(_EVENT_CATEGORY_NOTIFICATION,
    _EVENT_ACTION_NOTIFICATION_CLICKED);
}

/**
 * Send redeem_promo_code_button_clicked metric to event.
 */
googleAnalytics.sendMetricRedeemPromoCodeButtonClicked = function() {
  tracker.set('metric13', 1);
  tracker.sendEvent(_EVENT_CATEGORY_PROMO_CODE,
    _EVENT_ACTION_PROMO_CODE_BUTTON_CLICKED);
}

/**
 * Send need_more_info metric to event.
 */
googleAnalytics.sendMetricNeedMoreInfo = function() {
  tracker.set('metric14', 1);
  tracker.sendEvent(_EVENT_CATEGORY_NEED_MORE_INFO,
    _EVENT_ACTION_NEED_MORE_INFO);
}

/**
 * Send incognito_context metric to event.
 */
googleAnalytics.sendMetricIncognitoContext = function() {
  tracker.set('metric18', 1);
  tracker.sendEvent(_EVENT_CATEGORY_INCOGNITO_CONTEXT,
    _EVENT_ACTION_INCOGNITO_CONTEXT);
}
