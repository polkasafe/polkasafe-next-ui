// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import React from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { CopyIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import shortenAddress from '@next-substrate/utils/shortenAddress';

import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';

interface IAddProxySuccessScreen {
	txnHash?: string;
	userAddress: string;
}

const AddProxyFailedScreen = ({ txnHash, userAddress }: IAddProxySuccessScreen) => {
	const { network } = useGlobalApiContext();
	return (
		<div className='flex flex-col items-center'>
			<FailedTransactionLottie message='Proxy creation failed!' />
			<div className='flex flex-col w-full gap-y-4 bg-bg-secondary p-4 rounded-lg mb-1 mt-4 text-text_secondary'>
				{txnHash && (
					<div className='flex justify-between items-center'>
						<span>Txn Hash:</span>
						<div className='flex items-center gap-x-1'>
							<span className='text-white'>{shortenAddress(txnHash)}</span>
							<button onClick={() => copyText(txnHash, false, network)}>
								<CopyIcon className='mr-2 text-primary' />
							</button>
						</div>
					</div>
				)}
				<div className='flex justify-between items-center'>
					<span>Created:</span>
					<span className='text-white'>{dayjs().format('llll')}</span>
				</div>
				<div className='flex justify-between items-center'>
					<span>Created By:</span>
					<span>
						<AddressComponent address={userAddress} />
					</span>
				</div>
			</div>
		</div>
	);
};

export default AddProxyFailedScreen;
