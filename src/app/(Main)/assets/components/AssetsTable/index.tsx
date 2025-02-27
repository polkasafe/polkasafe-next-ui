// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork } from '@common/enum/substrate';
import Address from '@common/global-ui-components/Address';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { IMultisigAssets } from '@common/types/substrate';
import { findMultisig } from '@common/utils/findMultisig';
import { getCurrencySymbol } from '@common/utils/getCurrencySymbol';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { TransferByMultisig } from '@substrate/app/(Main)/assets/components/AssetsTable/components/Transfer';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { Table } from 'antd';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

interface IAssetsTableProps {
	dataSource: Array<IMultisigAssetsWithProxy>;
	currency: string;
	isExpandable: boolean;
}

interface IMultisigAssetsWithProxy extends IMultisigAssets {
	proxy: Array<IMultisigAssets>;
}

const columns = [
	{
		title: 'Asset',
		variant: ETypographyVariants.h1,
		className: 'basis-[20%] text-base'
	},
	{
		title: 'Balance',
		variant: ETypographyVariants.h1,
		className: 'basis-[20%] text-base'
	},
	{
		title: 'Value',
		variant: ETypographyVariants.h1,
		className: 'basis-[20%] text-base'
	},
	{
		title: 'Multisig',
		variant: ETypographyVariants.h1,
		className: 'basis-[20%] text-base'
	},
	{
		title: 'Actions',
		variant: ETypographyVariants.h1,
		className: 'text-base'
	}
];

function AssetsTable({ dataSource, currency, isExpandable }: IAssetsTableProps) {
	const [user] = useUser();
	const [organisation] = useOrganisation();
	const multisigs = organisation?.multisigs || [];
	const assetsColumns = [
		{
			title: 'Asset',
			dataIndex: 'symbol',
			key: 'symbol',
			width: '20%'
		},
		{
			title: 'Balance',
			dataIndex: 'free',
			key: 'free',
			width: '20%'
		},
		{
			title: 'Value',
			dataIndex: 'usd',
			key: 'usd',
			width: '20%',
			render: (usd: string, allData: IMultisigAssets) => {
				const symbol = getCurrencySymbol(currency);
				return (
					<div className='flex gap-2'>
						{symbol}{' '}
						{(
							allData.allCurrency?.[
								allData.network === ENetwork.POLKADOT_ASSETHUB
									? ENetwork.POLKADOT
									: allData.network === ENetwork.KUSAMA_ASSETHUB
										? ENetwork.KUSAMA
										: allData.network
							]?.[currency.toLowerCase()] || 0
						).toFixed(2)}
					</div>
				);
			}
		},
		{
			title: 'Multisig',
			dataIndex: 'address',
			key: 'address',
			width: '20%',
			render: (address: string, allData: IMultisigAssets) => (
				<div>
					<Address
						address={allData.proxyAddress || address}
						isProxy={!!allData.proxyAddress}
						isMultisig={true}
						withBadge={false}
						network={allData.network}
					/>
				</div>
			)
		},

		{
			title: 'Actions',
			dataIndex: 'actions',
			key: 'actions',
			width: '20%',
			render: (_: any, data: any) => {
				if (data.proxyAddress) {
					return null;
				}
				const multisig = findMultisig(multisigs, `${data.address}_${data.network}`);
				if (!multisig) {
					return null;
				}
				const isSignatory = multisig.signatories
					.map((a) => getSubstrateAddress(a))
					.includes(getSubstrateAddress(user?.address || ''));
				return (
					<div>
						<TransferByMultisig
							address={data.address}
							network={data.network}
							proxyAddress={data.proxyAddress}
							disabled={!isSignatory}
						/>
					</div>
				);
			}
		}
	];
	return (
		<Fragment>
			<div className='flex bg-bg-secondary my-1 p-3 rounded-lg mr-1 basis-1/'>
				{columns.map((column) => (
					<Typography
						key={column.title}
						variant={column.variant}
						className={twMerge(column.className, column.title === 'Asset' && isExpandable && 'pl-4')}
					>
						{column.title}
					</Typography>
				))}
			</div>

			<div className='overflow-x-auto overflow-y-auto pr-4'>
				<Table
					rowClassName='bg-bg-main'
					pagination={false}
					showHeader={false}
					className='w-full bg-bg-main'
					columns={assetsColumns}
					dataSource={dataSource}
				/>
			</div>
		</Fragment>
	);
}

export default AssetsTable;
