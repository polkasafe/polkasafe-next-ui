// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function apiErrorWithStatusCode(message: string, code: number) {
	const error: Error = new Error(message);
	error.name = code.toString();
	return error;
}
