// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AssetsCard from '@common/global-ui-components/AssetsCard';
import { useAssets } from '@substrate/app/atoms/assets/assetsAtom';
import React, { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { IMultisigAssets } from '@common/types/substrate';

function AssetsOverview() {
	const [data] = useAssets();
	const assets = data?.assets;
	const [isMounted, setIsMounted] = useState(false);
	const tokenAssets: Array<IMultisigAssets> = [];
	const proxyMultiSigAssets = [...(assets || []), ...(assets || []).map((a) => a.proxy || []).flat()];
	proxyMultiSigAssets?.forEach((asset) => {
		const usdtBalance = asset.usdt?.free;
		const usdcBalance = asset.usdc?.free;
		if (usdtBalance) {
			tokenAssets.push({
				symbol: 'USDT',
				free: usdtBalance
			} as IMultisigAssets);
		}
		if (usdcBalance) {
			tokenAssets.push({
				symbol: 'USDC',
				free: usdcBalance
			} as IMultisigAssets);
		}
	});

	const totalAssets = [...proxyMultiSigAssets, ...tokenAssets].reduce((acc, asset) => {
		const free = parseFloat(asset.free);
		return acc + free;
	}, 0);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}
	if (!assets) {
		return (
			<Skeleton.Button
				size='large'
				active
			/>
		);
	}

	return (
		<AssetsCard
			assets={[...proxyMultiSigAssets, ...tokenAssets]}
			totalAssets={totalAssets}
		/>
	);
}

export default AssetsOverview;
