// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const CURRENCY_API_KEY =
	process.env.REACT_APP_ENV === 'dev'
		? 'cur_live_fWyNcPwdq3W6Cc7Xx7lR8SkoT9diSRPJFfKofWAi'
		: process.env.POLKASAFE_CURRENCY_API_KEY;

export default CURRENCY_API_KEY;
