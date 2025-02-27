// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AssetsTable from '../AssetsTable';
import { useAssets } from '@substrate/app/atoms/assets/assetsAtom';
import { Skeleton } from 'antd';
import { useCurrency } from '@substrate/app/atoms/currency/currencyAtom';
import { getCurrencySymbol } from '@common/constants/currencyConstants';
import SelectCurrency from '@common/global-ui-components/SelectCurrency';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';

function AssetsTemplate() {
	const [data] = useAssets();
	const [selectedCurrency] = useCurrency();

	const assets = (data?.assets || []).map((asset) => ({
		...asset,
		key: `${asset.address}_${asset.network}`,
		children: Boolean(asset.proxy?.length) ? asset.proxy : null
	}));

	const isExpandable = assets.find((record) => Boolean(record.children));

	return (
		<div className='bg-bg-main rounded-xl p-5 h-full gap-2 flex flex-col'>
			<div className='flex justify-between items-center mb-5'>
				<Typography variant={ETypographyVariants.h1}>Tokens</Typography>
				<SelectCurrency transparent />
			</div>
			{assets && assets.length > 0 ? (
				<AssetsTable
					dataSource={assets || []}
					currency={String(getCurrencySymbol(selectedCurrency))}
					isExpandable={Boolean(isExpandable)}
				/>
			) : (
				<Skeleton />
			)}
		</div>
	);
}

export default AssetsTemplate;
