// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { QrDisplayAddress } from '@polkadot/react-qr';
import React, { useEffect, useState } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';

const AddressQr = ({ address }: { address: string }) => {
	const { api, apiReady, network } = useGlobalApiContext();
	const [genesisHash, setGenesisHash] = useState('');
	useEffect(() => {
		const getGenesisHash = async () => {
			if (!api || !apiReady) {
				return;
			}
			const hash = await api.genesisHash.toHex();
			setGenesisHash(hash);
		};
		getGenesisHash();
	}, [api, apiReady]);
	return (
		<div className='flex flex-col items-center'>
			<QrDisplayAddress
				size={150}
				address={getEncodedAddress(address, network) || address}
				genesisHash={genesisHash}
			/>
		</div>
	);
};

export default AddressQr;
