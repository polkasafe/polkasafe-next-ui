// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';

// of the Apache-2.0 license. See the LICENSE file for details.
export const useLoading = (currentLoading?: boolean) => {
	const [loading, setLoading] = useState(currentLoading);
	const [message, setMessage] = useState('');
	const [error, setError] = useState();
	const [success, setSuccess] = useState();

	return {
		loading,
		setLoading,
		message,
		setMessage,
		error,
		setError,
		success,
		setSuccess
	};
};
