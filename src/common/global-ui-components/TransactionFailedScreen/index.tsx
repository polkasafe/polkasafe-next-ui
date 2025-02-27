// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import ActionButton from '@common/global-ui-components/ActionButton';
import Address from '@common/global-ui-components/Address';
import { CopyIcon } from '@common/global-ui-components/Icons';
import FailedTransactionLottie from '@common/global-ui-components/LottieAnimations/FailedLottie';
import copyText from '@common/utils/copyText';
import shortenAddress from '@common/utils/shortenAddress';
import dayjs from 'dayjs';
import React from 'react';

interface ITransactionFailedScreen {
	txnHash?: string;
	created_at: Date;
	sender: string;
	onDone?: () => void;
	failedMessage: string;
	waitMessage?: string;
}

const TransactionFailedScreen = ({
	txnHash,
	created_at,
	sender,
	onDone,
	failedMessage,
	waitMessage
}: ITransactionFailedScreen) => {
	return (
		<div className='flex flex-col items-center'>
			<FailedTransactionLottie
				className='mb-3'
				message={failedMessage}
				waitMessage={waitMessage}
			/>
			<div className='flex flex-col w-full gap-y-4 bg-bg-secondary p-4 rounded-lg my-1 text-text_secondary'>
				{txnHash && (
					<div className='flex justify-between items-center'>
						<span>Txn Hash:</span>
						<div className='flex items-center gap-x-1'>
							<span className='text-white'>{shortenAddress(txnHash)}</span>
							<button onClick={() => copyText(txnHash)}>
								<CopyIcon className='mr-2 text-primary' />
							</button>
						</div>
					</div>
				)}
				<div className='flex justify-between items-center'>
					<span>Created:</span>
					<span className='text-white'>{dayjs(created_at).format('DD/MM/YYYY, hh:mm A')}</span>
				</div>
				<div className='flex justify-between items-center'>
					<span>Created By:</span>
					<span>
						<Address address={sender} />
					</span>
				</div>
			</div>
			<div className='flex justify-center mt-2'>
				<ActionButton
					label='Done'
					onClick={onDone}
				/>
			</div>
		</div>
	);
};

export default TransactionFailedScreen;
