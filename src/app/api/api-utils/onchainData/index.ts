// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import axios from 'axios';
import { ITransaction } from '@common/types/substrate';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import { ResponseMessages } from '@common/constants/responseMessage';

interface IResponse {
	error?: string | null;
	data: ITransaction | null;
}

const getQueueDetails = async (extrinsicBlockWithIndex: string, network: string) => {
	const queueDataResponse = await axios.post(
		`https://api-${network}.rootscan.io/v1/extrinsic`,
		{
			extrinsicId: extrinsicBlockWithIndex
		},
		{ headers: SUBSCAN_API_HEADERS }
	);

	const { data: queueData } = queueDataResponse.data;
	console.log('queueData', queueData);

	return queueData;
};

export async function onChainQueueDetails(extrinsicBlockWithIndex: string, network: string): Promise<IResponse> {
	const returnValue: IResponse = {
		data: null,
		error: ''
	};

	try {
		const allTransactions = await getQueueDetails(extrinsicBlockWithIndex, network);
		returnValue.data = allTransactions;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || ResponseMessages.TRANSFERS_FETCH_ERROR;
	}

	return returnValue;
}
