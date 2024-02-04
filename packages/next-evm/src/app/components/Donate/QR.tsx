// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import AddressQr from '@next-common/ui-components/AddressQr';
import { CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';

const QR = () => {
	return (
		<div className='flex flex-col gap-y-5 p-5 bg-bg-secondary rounded-xl items-center'>
			<p className='text-xs md:text-sm text-normal text-text_secondary'>
				Scan this QR Code with your wallet application
			</p>
			<div className='flex items-center justify-center'>
				<AddressQr address='0xa6f1f10E2d415366ED1912869CF14a1E29Df0c09' />
			</div>
			<div className='flex items-center gap-x-3 justify-center bg-highlight rounded-lg p-2'>
				<p className='text-xs md:text-sm leading-[15px]'>
					<span className='text-primary font-medium'>ETH:</span>
					<span className='font-normal ml-[6px]'>{shortenAddress('0xa6f1f10E2d415366ED1912869CF14a1E29Df0c09')}</span>
				</p>
				<p className='text-sm md:text-base text-text_secondary flex items-center gap-x-[9px]'>
					<button onClick={() => copyText('0xa6f1f10E2d415366ED1912869CF14a1E29Df0c09')}>
						<CopyIcon className='hover:text-primary' />
					</button>
					<a
						href={`${
							chainProperties[NETWORK.ETHEREUM].blockExplorer
						}/address/0xa6f1f10E2d415366ED1912869CF14a1E29Df0c09`}
						target='_blank'
						rel='noreferrer'
					>
						<ExternalLinkIcon />
					</a>
				</p>
			</div>
		</div>
	);
};

export default QR;
