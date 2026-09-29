// Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//
// Constants shared by multiple files

/**
 * The key to store offer info in Local State.
 */
OFFER_INFO = 'offer_info';

/**
 * The key to store the service id of last checkEligibility call in Local State.
 */
LAST_SERVICE_ID = 'last_service_id';

/**
 * The key to store the promo code in Local State.
 */
PROMO_CODE = 'promo_code';

/**
 * The key to store the promo code expiration date in Local State.
 */
PROMO_CODE_EXPIRATION_DATE = 'promo_code_expiration_date';

/**
 * The key to store redirect url for promo code in Local State.
 */
REDIRECT_URL = 'redirect_url';

/**
 * The key to store most recent get reg code success indicator
 */
LAST_GET_REG_CODE_RESULT = 'offer_info_last_get_reg_code_result'

/**
 * The default service id if the service id can't be found in request.
 */
UNKNOWN_SERVICE_ID = 'unknown_service_id';

/**
 * The command getOfferInfo.
 */
CMD_GET_OFFER_INFO = 'getOfferInfo';
