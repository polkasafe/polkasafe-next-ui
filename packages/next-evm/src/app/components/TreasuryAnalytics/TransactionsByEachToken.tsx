// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React, { useEffect, useState } from 'react';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import NoAssetsSVG from '@next-common/assets/icons/no-transaction-home.svg';
import { ETxnType, ITreasuryTxns } from '@next-common/types';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { StaticImageData } from 'next/image';
import { Dropdown } from 'antd';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';
import TokenFlow from './TokenFlow';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ITokenTxnsData {
	balance_token: number;
	balance_usd: number;
	tokenSymbol: string;
	type: ETxnType;
}

interface ITokenData {
	[tokenSymbol: string]: {
		tokenLogoUri: string | StaticImageData;
		totalTokenAmountIncoming: number;
		totalTokenAmountOutgoing: number;
		totalUsdAmountIncoming: number;
		totalUsdAmountOutgoing: number;
		txns: ITokenTxnsData[];
	};
}

const TransactionsByEachToken = ({
	className,
	incomingTransactions,
	outgoingTransactions
}: {
	className?: string;
	incomingTransactions: ITreasuryTxns[];
	outgoingTransactions: ITreasuryTxns[];
}) => {
	const [tokenTxns, setTokenTxns] = useState<ITokenData>({});

	const [selectedToken, setSelectedToken] = useState<string>();

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		const tokensData: ITokenData = {};
		incomingTransactions.forEach((item) => {
			if (tokensData[item.tokenSymbol] && tokensData[item.tokenSymbol].txns) {
				tokensData[item.tokenSymbol].totalTokenAmountIncoming += Number(item.balance_token);
				tokensData[item.tokenSymbol].totalUsdAmountIncoming += Number(item.balance_usd);
				tokensData[item.tokenSymbol].txns.push({
					balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
					balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
					type: item.type,
					tokenSymbol: item.tokenSymbol || chainProperties[item.network].tokenSymbol
				});
				return;
			}
			tokensData[item.tokenSymbol] = {
				tokenLogoUri: item.tokenLogoUri,
				totalTokenAmountIncoming: Number(item.balance_token),
				totalUsdAmountIncoming: Number(item.balance_usd),
				totalTokenAmountOutgoing: 0,
				totalUsdAmountOutgoing: 0,
				txns: [
					{
						balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
						balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
						type: item.type,
						tokenSymbol: item.tokenSymbol || chainProperties[item.network].tokenSymbol
					}
				]
			};
		});
		outgoingTransactions.forEach((item) => {
			if (tokensData[item.tokenSymbol] && tokensData[item.tokenSymbol].txns) {
				tokensData[item.tokenSymbol].totalTokenAmountOutgoing += Number(item.balance_token);
				tokensData[item.tokenSymbol].totalUsdAmountOutgoing += Number(item.balance_usd);
				tokensData[item.tokenSymbol].txns.push({
					balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
					balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
					type: item.type,
					tokenSymbol: item.tokenSymbol || chainProperties[item.network].tokenSymbol
				});
				return;
			}
			tokensData[item.tokenSymbol] = {
				tokenLogoUri: item.tokenLogoUri,
				totalTokenAmountIncoming: 0,
				totalUsdAmountIncoming: 0,
				totalTokenAmountOutgoing: Number(item.balance_token),
				totalUsdAmountOutgoing: Number(item.balance_usd),
				txns: [
					{
						balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
						balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
						type: item.type,
						tokenSymbol: item.tokenSymbol || chainProperties[item.network].tokenSymbol
					}
				]
			};
		});
		setTokenTxns(tokensData);
	}, [incomingTransactions, outgoingTransactions]);

	useEffect(() => {
		if (Object.keys(tokenTxns).length > 0) {
			setSelectedToken(Object.keys(tokenTxns)[0]);
		}
	}, [tokenTxns]);

	const tokenOptions: ItemType[] = Object.keys(tokenTxns)?.map((item) => ({
		key: item,
		label: (
			<div className='flex items-center gap-x-2'>
				<ParachainIcon
					src={tokenTxns[item].tokenLogoUri}
					size={10}
				/>
				<span className='text-white'>{item}</span>
			</div>
		)
	}));

	const tokenIncomingtxns = tokenTxns[selectedToken]?.txns?.filter((item) => item.type === ETxnType.INCOMING).length;
	const tokenOutgoingTxns = tokenTxns[selectedToken]?.txns?.filter((item) => item.type === ETxnType.OUTGOING).length;

	return (
		<div>
			<div className='flex justify-between flex-row w-full mb-2'>
				<h2 className='text-base font-bold text-white'>Token Flow</h2>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-1 bg-bg-secondary cursor-pointer min-w-[150px]'
					menu={{
						items: tokenOptions,
						onClick: (e) => {
							setSelectedToken(e.key);
						}
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						<div className='flex items-center gap-x-2'>
							<ParachainIcon
								src={tokenTxns[selectedToken]?.tokenLogoUri}
								size={10}
							/>
							<span className='text-xs'>{selectedToken}</span>
						</div>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
			</div>
			{!tokenTxns ? (
				<div
					className={`bg-bg-main relative flex flex-col justify-around rounded-xl p-8 h-[17rem] shadow-lg scale-90 w-[111%] origin-top-left ${className}`}
				>
					<div className='flex flex-col gap-y-2 items-center justify-center'>
						<NoAssetsSVG />
						<p className='font-normal text-xs leading-[15px] text-text_secondary'>No Assets Found.</p>
					</div>
				</div>
			) : (
				<div
					className={`bg-bg-main relative flex items-center rounded-xl p-8 shadow-lg scale-90 w-[111%] origin-top-left ${className}`}
				>
					<TokenFlow
						numberOfIncoming={tokenIncomingtxns}
						numberOfOutgoing={tokenOutgoingTxns}
						incomingAmount={tokenTxns[selectedToken]?.totalUsdAmountIncoming}
						outgoingAmount={tokenTxns[selectedToken]?.totalUsdAmountOutgoing}
					/>
				</div>
			)}
		</div>
	);
};

export default TransactionsByEachToken;
