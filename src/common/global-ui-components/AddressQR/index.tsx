// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork } from '@common/enum/substrate';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import { QrDisplayAddress } from '@polkadot/react-qr';

const AddressQr = ({
	address,
	network,
	genesisHash,
	size = 150
}: {
	address: string;
	size?: number;
	network?: ENetwork;
	genesisHash: string;
}) => {
	return (
		<div className='flex flex-col items-center'>
			<QrDisplayAddress
				size={size}
				address={getEncodedAddress(address, network || ENetwork.POLKADOT) || address}
				genesisHash={genesisHash}
			/>
		</div>
	);
};

export default AddressQr;
