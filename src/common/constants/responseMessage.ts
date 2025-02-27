// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// changed responseMessage case to camelCase

export const ResponseMessages = {
	MISSING_USER_SIGNATORY: 'User address should be in the list of signatories.',
	MISSING_HEADERS: 'Missing headers.',
	INVALID_HEADERS: 'Invalid headers.',
	MISSING_PARAMS: 'Missing parameters.',
	INVALID_PARAMS: 'Invalid parameters passed to the function call.',
	INVALID_SIGNATURE: 'Invalid signature.',
	INVALID_USER: 'Invalid user.',
	INVALID_NETWORK: 'Invalid network.',
	INVALID_REQUEST: 'Invalid request.',
	UNAUTHORIZED: 'Unauthorized.',
	INTERNAL: 'Internal error occurred.',
	MIN_SINGATORIES: 'Minimum number of signatories is 2.',
	INVALID_ORGANIZATION: 'invalid organization',
	INVALID_THRESHOLD: 'Threshold should be a number less than or equal to the number of signatories.',
	MULTISIG_EXISTS: 'Multisig already exists. Please try linking it.',
	MULTISIG_CREATE_ERROR: 'Error while creating multisig.',
	ONCHAIN_MULTISIG_FETCH_ERROR: 'Error while fetching multisig from chain.',
	MULTISIG_NOT_FOUND: 'Multisig not found.',
	MULTISIG_NOT_FOUND_ON_CHAIN: 'Multisig not found on chain.',
	DUPLICATE_SIGNATORIES: 'Duplicate signatories.',
	INVALID_LIMIT: 'Min. and max. limit that can be fetched per page is 1 and 100 respectively.',
	INVALID_PAGE: 'Min. value for page is 1.',
	TRANSFERS_FETCH_ERROR: 'Error while fetching transfers.',
	QUEUE_FETCH_ERROR: 'Error while fetching queue.',
	ASSETS_FETCH_ERROR: 'Error while fetching assets.',
	SUCCESS: 'Success',
	INVALID_2FA_CODE: 'Invalid 2FA code.',
	INVALID_2FA_TOKEN: 'Invalid 2FA token.',
	TWO_FACTOR_AUTH_NOT_INIT: '2FA not initialized.',
	ADDRESS_NOT_REGISTERED: 'Address not registered.',
	TFA_TOKEN_EXPIRED: '2FA token expired.',
	ADDRESS_NOT_IN_DB: 'no user with this address',
	ADDRESS_ALREADY_EXISTS: 'address already exists',
	INVALID_INVOICE_ID: 'Invalid invoice id;',
	INVALID_ADDRESS: 'Invalid address',
	INVALID_ORGANISATION_ID: 'Invalid organisation id',
	ORGANISATION_ALREADY_EXISTS: 'Organisation already exists',
	INVALID_TRANSACTION_ID: 'Invalid transaction id'
};
