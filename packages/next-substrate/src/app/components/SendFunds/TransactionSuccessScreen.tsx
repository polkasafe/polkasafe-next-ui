// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import dayjs from 'dayjs';
import React from 'react';
import SuccessTransactionLottie from '@next-common/assets/lottie-graphics/SuccessTransaction';
import ModalBtn from '@next-substrate/app/components/Multisig/ModalBtn';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { CopyIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import formatBnBalance from '@next-substrate/utils/formatBnBalance';
import shortenAddress from '@next-substrate/utils/shortenAddress';

interface ITransactionSuccessScreen {
	amount: BN;
	txnHash?: string;
	created_at: Date;
	sender: string;
	recipients: string[];
	onDone?: () => void;
	successMessage: string;
	waitMessage?: string;
	txnParams?: { method: string; section: string };
	network: string;
}

const TransactionSuccessScreen = ({
	amount,
	txnHash,
	created_at,
	sender,
	recipients,
	onDone,
	successMessage,
	waitMessage,
	txnParams,
	network
}: ITransactionSuccessScreen) => {
	return (
		<div className='flex flex-col items-center'>
			<SuccessTransactionLottie
				message={successMessage}
				waitMessage={waitMessage}
			/>
			<div className='flex flex-col w-full gap-y-4 bg-bg-secondary p-4 rounded-lg my-1 text-text_secondary'>
				{!amount.isZero() && (
					<div className='flex justify-between items-center'>
						<span>Amount:</span>
						<span className='text-failure'>
							-{formatBnBalance(amount, { numberAfterComma: 4, withUnit: true }, network)}
						</span>
					</div>
				)}
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
				{txnParams && (
					<>
						<div className='flex justify-between items-center'>
							<span>Section:</span>
							<span className='text-white'>{txnParams?.section}</span>
						</div>
						<div className='flex justify-between items-center'>
							<span>Method:</span>
							<span className='text-white'>{txnParams?.method}</span>
						</div>
					</>
				)}
				<div className='flex justify-between items-center'>
					<span>Created:</span>
					<span className='text-white'>{dayjs(created_at).format('llll')}</span>
				</div>
				<div className='flex justify-between items-center'>
					<span>Created By:</span>
					<span>
						<AddressComponent address={sender} />
					</span>
				</div>
				{recipients.length > 0 && (
					<div className='flex justify-between items-center'>
						<span>
							Recipients: <span className='text-white'>{recipients.length}</span>
						</span>
						<div className='flex flex-col gap-y-1'>
							{recipients.map((recipient) => (
								<AddressComponent
									key={recipient}
									address={recipient}
									network={network}
								/>
							))}
						</div>
					</div>
				)}
			</div>
			{onDone && (
				<div className='flex justify-center mt-2'>
					<ModalBtn
						title='Done'
						onClick={onDone}
					/>
				</div>
			)}
		</div>
	);
};

export default TransactionSuccessScreen;
