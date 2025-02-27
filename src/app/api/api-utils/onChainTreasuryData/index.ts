// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IMultisig } from '@common/types/substrate';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import axios from 'axios';
import { ETxnType, ITreasury, ITreasuryTxns } from '@common/enum/substrate';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import dayjs from 'dayjs';

export const onChainTreasuryData = async ({
	multisigs,
	organisationId
}: {
	multisigs: Array<IMultisig>;
	organisationId: string;
}) => {
	let orgTreasury: ITreasury = {};
	for (const multisig of multisigs) {
		const multisigHistoryRes = await axios.post(
			`https://${multisig?.network}.api.subscan.io/api/v2/scan/transfers`,
			{
				address: multisig?.address,
				page: 0,
				row: 100
			},
			{ headers: SUBSCAN_API_HEADERS }
		);

		const { data } = await multisigHistoryRes.data;

		console.log('data', data);

		let totalIncomingUSD = 0;
		let totalOutgoingUSD = 0;
		const incomingTxns: ITreasuryTxns[] = [];
		const outgoingTxns: ITreasuryTxns[] = [];
		if (data && data.transfers && data.count > 0) {
			data.transfers?.forEach((txn: any) => {
				const usd = txn.usd_amount;
				const token = txn.amount;
				const type =
					txn.from === getEncodedAddress(multisig.address, multisig.network) ? ETxnType.OUTGOING : ETxnType.INCOMING;
				const timestamp = dayjs.unix(txn.block_timestamp).format('YYYY-MM-DD');
				const txHash = txn.hash;
				if (type === ETxnType.INCOMING) {
					totalIncomingUSD += Number(usd);
					incomingTxns.push({
						balance_token: token,
						balance_usd: usd,
						multisigAddress: multisig.address,
						network: multisig.network,
						timestamp,
						txHash,
						type
					});
				} else {
					totalOutgoingUSD += Number(usd);
					outgoingTxns.push({
						balance_token: token,
						balance_usd: usd,
						multisigAddress: multisig.address,
						network: multisig.network,
						timestamp,
						txHash,
						type
					});
				}
			});

			orgTreasury = {
				...orgTreasury,
				[organisationId]: orgTreasury[organisationId]
					? {
							totalIncomingUSD: orgTreasury[organisationId].totalIncomingUSD + totalIncomingUSD,
							totalOutgoingUSD: orgTreasury[organisationId].totalOutgoingUSD + totalOutgoingUSD,
							incomingTransactions: [...orgTreasury[organisationId].incomingTransactions, ...incomingTxns],
							outgoingTransactions: [...orgTreasury[organisationId].outgoingTransactions, ...outgoingTxns]
						}
					: {
							totalIncomingUSD,
							totalOutgoingUSD,
							incomingTransactions: incomingTxns,
							outgoingTransactions: outgoingTxns
						},
				[`${multisig.address}_${multisig.network}`]: {
					totalIncomingUSD,
					totalOutgoingUSD,
					incomingTransactions: incomingTxns,
					outgoingTransactions: outgoingTxns
				}
			};
		}
	}
	return orgTreasury;
};
