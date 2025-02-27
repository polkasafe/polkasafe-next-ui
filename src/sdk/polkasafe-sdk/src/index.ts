import {
	IConnectAddressTokenProps,
	IConnectProps,
	IGetMultisigAssets,
	IGetMultisigDataProps,
	IGetMultisigTransactionProps,
	IGetOrganisationProps,
	IGetOrganisationTransactionProps
} from '@common/types/sdk';
import { ETransactionType } from '@common/enum/sdk';
import { ENetwork, ETriggers } from '@common/enum/substrate';
import { IGenericObject } from '@common/types/substrate';
import CURRENCY_API_KEY from './constants/currencyApiKey';
import { currencySymbols } from './constants/currencyConstants';
import { connectAddress } from './connect-address';
import { getAssetsForAddress } from './get-assets-for-address';
import { getAddressToken } from './get-connect-address-token';
import { getMultisigDataByMultisigAddress } from './get-multisig-data-by-address';
import { getMultisigQueue } from './get-multisig-queue';
import { getTransactionsForMultisig } from './get-transactions-for-multisig';
import { getOrganisationAsset } from './get-organisation-assets';
import { getTransactionsForMultisigs } from './get-transactions-for-multisigs';
import { handleHeaders } from './utils/handleHeaders';
import { request } from './utils/request';
import { networkConstants } from './utils/constants/network_constants';
import { SUBSCAN_API_HEADERS } from './utils/constants/subscan_consts';

export const getConnectAddressToken = ({ address }: IConnectAddressTokenProps) => getAddressToken(address);

export const connect = async ({ address }: IConnectProps) => connectAddress(address);

export const getMultisigData = async ({ address, network }: IGetMultisigDataProps) =>
	getMultisigDataByMultisigAddress({ address, network });

export const getTransactions = async ({ address, network, page, limit }: IGetMultisigTransactionProps) =>
	getTransactionsForMultisig({ address, network, page, limit });

export const getQueueTransactions = async ({ multisigs, page, limit }: IGetOrganisationTransactionProps) =>
	getTransactionsForMultisigs({ multisigs, page, limit, type: ETransactionType.QUEUE_TRANSACTION });

export const getHistoryTransactions = async ({ multisigs, page, limit }: IGetOrganisationTransactionProps) =>
	getTransactionsForMultisigs({ multisigs, page, limit, type: ETransactionType.HISTORY_TRANSACTION });

export const getOrganisationQueueTransactions = async ({
	address,
	network,
	page,
	limit
}: IGetMultisigTransactionProps) => getMultisigQueue({ address, network, page, limit });

export const getAssets = async ({ multisigIds }: IGetMultisigAssets) => getAssetsForAddress({ multisigIds });

export const getMultisigsByOrganisation = async ({ address, signature, organisationId }: IGetOrganisationProps) => {
	if (!address || !signature || !organisationId) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		organisationId
	});

	const headers = handleHeaders({ address, signature });

	return request('/getMultisigsByOrg', headers, { method: 'POST', body });
};

export const getMultisigByOrganisation = async ({ organisations }: { organisations: Array<string> }) => {
	const body = JSON.stringify({
		organisations
	});

	return request('/getMultisigByOrganisation', {}, { method: 'POST', body });
};
export const getOrganisationsByUser = async ({ address }: { address: string }) => {
	const body = JSON.stringify({
		address
	});

	return request('/getOrganisationsByUser', {}, { method: 'POST', body });
};

export const getOrganisationAssets = async ({ organisationId, address, signature }: IGetOrganisationProps) =>
	getOrganisationAsset({ organisationId, address, signature });

export const getCurrencyPrices = async () => {
	const response = await fetch(
		`https://api.currencyapi.com/v3/latest?apikey=${CURRENCY_API_KEY}&currencies=${[...Object.values(currencySymbols)]}`
	);
	return response.json();
};

export const fetchTokenToUSDPrice = async (token: number, network: ENetwork) => {
	try {
		const response = await fetch(`https://${network}.api.subscan.io/api/open/price_converter`, {
			body: JSON.stringify({
				from: (networkConstants as any)[network as any].tokenSymbol,
				quote: 'USD',
				value: token
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const responseJSON = await response.json();

		if (responseJSON.message === 'Success' && responseJSON.data) {
			return responseJSON.data.output || '0';
		}
	} catch (e) {
		console.log(e);
		return '0';
	}
	return '0';
};

export const createMultisig = async ({
	name,
	signatories,
	network,
	threshold
}: {
	name: string;
	signatories: Array<string>;
	network: string;
	threshold: number;
}) => {
	const body = JSON.stringify({
		name,
		signatories,
		network,
		threshold
	});

	return request('/createMultisig', {}, { method: 'POST', body });
};

export const sendNotification = async ({
	address,
	signature,
	trigger,
	args
}: {
	address: string;
	signature: string;
	trigger: ETriggers;
	args: IGenericObject;
}) => {
	const body = JSON.stringify({
		trigger,
		args
	});
	const headers = handleHeaders({ address, signature });
	return request('/sendNotification', headers, { method: 'POST', body });
};
