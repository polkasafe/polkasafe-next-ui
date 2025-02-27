// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import shortenAddress from '@common/utils/shortenAddress';
import copyText from '@common/utils/copyText';
import { CopyIcon, ExternalLinkIcon } from '@common/global-ui-components/Icons';
import AddressQr from '@common/global-ui-components/AddressQR';
import { ENetwork } from '@common/enum/substrate';

const QR = ({ network }: { network: ENetwork }) => {
	return (
		<div className='flex flex-col gap-y-5 p-5 bg-bg-secondary rounded-xl items-center'>
			<p className='text-xs md:text-sm text-normal text-text_secondary'>
				Scan this QR Code with your wallet application
			</p>
			<div className='flex items-center justify-center p-2'>
				<AddressQr
					address='165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb'
					genesisHash=''
				/>
			</div>
			<div className='flex items-center gap-x-3 justify-center bg-highlight rounded-lg p-2'>
				<p className='text-xs md:text-sm leading-[15px]'>
					<span className='text-primary font-medium'>dot:</span>
					<span className='font-normal ml-[6px]'>
						{shortenAddress('165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb')}
					</span>
				</p>
				<p className='text-sm md:text-base text-text_secondary flex items-center gap-x-[9px]'>
					<button onClick={() => copyText('165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb')}>
						<CopyIcon className='hover:text-primary' />
					</button>
					<a
						href={`https://${network}.subscan.io/account/165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb`}
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
