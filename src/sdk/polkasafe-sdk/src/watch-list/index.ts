/* eslint-disable sonarjs/no-duplicate-string */
import { request } from '../utils/request';
import { handleHeaders } from '../utils/handleHeaders';

type IWatchList = {
	address: string;
	signature: string;
};

type IAddWatchList = {
	address: string;
	signature: string;
	addressToAdd: string;
	network: string;
	name: string;
};

type IRemoveWatchList = {
	address: string;
	signature: string;
	addressToDelete: string;
	network: string;
};

export function watchList({ address, signature }: IWatchList) {
	if (!address) {
		throw new Error('address is required');
	}
	if (!signature) {
		throw new Error('signature is required');
	}

	const method = 'GET';

	const option = { method };

	return request('/watch-list', { ...handleHeaders({ address, signature }) }, option);
}

export function addWatchList({ address, signature, addressToAdd, network, name }: IAddWatchList) {
	console.log('address', address, signature, addressToAdd, network, name);
	if (!address) {
		throw new Error('address is required');
	}
	if (!signature) {
		throw new Error('signature is required');
	}

	if (!addressToAdd || !network || !name) {
		throw new Error('addressToAdd, network and name are required');
	}

	const body = JSON.stringify({
		address: addressToAdd,
		network,
		name
	});

	const method = 'POST';

	const option = { method, body };

	return request('/watch-list', { ...handleHeaders({ address, signature }) }, option);
}

export function removeWatchList({ address, signature, addressToDelete, network }: IRemoveWatchList) {
	if (!address) {
		throw new Error('address is required');
	}
	if (!signature) {
		throw new Error('signature is required');
	}

	if (!addressToDelete || !network) {
		throw new Error('addressToDelete is required');
	}

	const body = JSON.stringify({
		watchlistId: `${addressToDelete}_${network}`
	});

	const method = 'DELETE';

	const option = { method, body };

	return request('/watch-list', { ...handleHeaders({ address, signature }) }, option);
}
