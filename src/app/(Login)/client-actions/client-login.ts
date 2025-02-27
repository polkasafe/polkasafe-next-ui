// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IGenericResponse } from '@common/types/substrate';
import { loginToPolkasafe } from '@sdk/polkasafe-sdk/src/login-to-polkasafe';

export const clientLogin = async (address: string, signature: string) => {
	const currentOrganisation = localStorage.getItem('currentOrganisation');
	const { data, error } = (await loginToPolkasafe({
		address,
		signature,
		currentOrganisation
	})) as IGenericResponse<any>;
	console.log('clientLogin', data, error);
	return { data, error };
};
