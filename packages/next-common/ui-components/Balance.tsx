// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import formatBnBalance from '@next-substrate/utils/formatBnBalance';

interface Props {
	className?: string;
	address: string;
	onChange?: (balance: string) => void;
}

const Balance: React.FC<Props> = ({ address, className, onChange }: Props) => {
	const { api, apiReady, network } = useGlobalApiContext();

	const [balance, setBalance] = useState<string>('0');

	useEffect(() => {
		if (!api || !apiReady || !address) return;

		api.query?.system
			?.account(address)
			.then((res) => {
				const balanceStr = res?.data?.free?.toString() || '0';
				setBalance(balanceStr);
				if (onChange) {
					onChange(balanceStr);
				}
			})
			.catch((e) => console.error(e));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	return (
		<div
			className={`bg-highlight ml-auto flex items-center justify-center rounded-lg px-[10px] py-[6px] text-xs font-normal leading-[13px] ${className}`}
		>
			<span className='text-primary mr-2'>Balance: </span>
			<span className='text-white'>{formatBnBalance(balance, { numberAfterComma: 4, withUnit: true }, network)}</span>
		</div>
	);
};

export default Balance;
