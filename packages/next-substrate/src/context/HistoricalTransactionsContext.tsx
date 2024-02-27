// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import dayjs from 'dayjs';
import { useActiveOrgContext } from './ActiveOrgContext';
import { useMultisigAssetsContext } from './MultisigAssetsContext';

enum ETxnType {
	INCOMING = 'INCOMING',
	OUTGOING = 'OUTGOING'
}

export interface ITreasuryTxns {
	type: ETxnType;
	balance_usd: string;
	balance_token: string;
	txHash: string;
	timestamp: string;
	multisigAddress: string;
	network: string;
}

export interface ITreasury {
	[id: string]: {
		totalIncomingUSD: number;
		totalOutgoingUSD: number;
		incomingTransactions: ITreasuryTxns[];
		outgoingTransactions: ITreasuryTxns[];
	};
}

export interface IHistoricalTransactionsContext {
	treasury: ITreasury;
	loadingTreasury: boolean;
}

export const initialHistoricalTransactionsContext: IHistoricalTransactionsContext = {
	loadingTreasury: false,
	treasury: {}
};

export const HistoricalTransactionsContext = createContext(initialHistoricalTransactionsContext);

export function useHistoricalTransactionsContext() {
	return useContext(HistoricalTransactionsContext);
}

export const HistoricalTransactionsProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const { activeOrg } = useActiveOrgContext();
	const { loadingAssets } = useMultisigAssetsContext();
	const [treasury, setTreasury] = useState<ITreasury>();
	const [loading, setLoading] = useState<boolean>(false);
	const [dataLoaded, setDataLoaded] = useState<boolean>(false);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleGetHistoricalTransfers = useCallback(async () => {
		if (!activeOrg || !activeOrg.multisigs || loadingAssets) {
			console.log('not found at 1st in history');
			return;
		}

		try {
			const allMultisigs = activeOrg?.multisigs;
			const orgTreasury = {
				incomingTransactions: [],
				outgoingTransactions: [],
				totalIncomingUSD: 0,
				totalOutgoingUSD: 0
			};

			setLoading(true);

			let counter = 0;
			// eslint-disable-next-line no-restricted-syntax
			for (const multisig of allMultisigs) {
				// eslint-disable-next-line no-await-in-loop
				const multisigHistoryRes = await fetch(`https://${multisig?.network}.api.subscan.io/api/v2/scan/transfers`, {
					body: JSON.stringify({
						address: multisig?.address,
						page: 0,
						row: 100
					}),
					headers: SUBSCAN_API_HEADERS,
					method: 'POST'
				});
				// eslint-disable-next-line no-await-in-loop
				const { data } = await multisigHistoryRes.json();

				let totalIncomingUSD = 0;
				let totalOutgoingUSD = 0;
				const incomingTxns: ITreasuryTxns[] = [];
				const outgoingTxns: ITreasuryTxns[] = [];
				if (data && data.transfers && data.count > 0) {
					data.transfers?.forEach((txn: any) => {
						const usd = txn.usd_amount;
						const token = txn.amount;
						const type =
							txn.from === getEncodedAddress(multisig.address, multisig.network)
								? ETxnType.OUTGOING
								: ETxnType.INCOMING;
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

					orgTreasury.totalIncomingUSD += totalIncomingUSD;
					orgTreasury.totalOutgoingUSD += totalOutgoingUSD;
					orgTreasury.incomingTransactions = [...orgTreasury.incomingTransactions, ...incomingTxns];
					orgTreasury.outgoingTransactions = [...orgTreasury.outgoingTransactions, ...outgoingTxns];

					setTreasury((prev) => ({
						...prev,
						[`${multisig.address}_${multisig.network}`]: {
							incomingTransactions: incomingTxns,
							outgoingTransactions: outgoingTxns,
							totalIncomingUSD,
							totalOutgoingUSD
						}
					}));
				}
				counter += 1;
			}

			setLoading(false);
			console.log('orgTreasury', orgTreasury);
			setTreasury((prev) => ({
				...prev,
				[activeOrg.id]: orgTreasury
			}));
			if (counter === allMultisigs.length) {
				setDataLoaded(true);
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeOrg, loadingAssets]);

	useEffect(() => {
		handleGetHistoricalTransfers();
	}, [handleGetHistoricalTransfers]);

	const value = useMemo(() => ({ loadingTreasury: loading, treasury }), [loading, treasury]);

	return (
		<HistoricalTransactionsContext.Provider value={value}>
			{dataLoaded ? children : null}
		</HistoricalTransactionsContext.Provider>
	);
};
