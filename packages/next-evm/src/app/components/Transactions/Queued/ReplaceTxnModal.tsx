// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import returnTxUrl from '@next-common/global/gnosisService';
import { EthersAdapter } from '@safe-global/protocol-kit';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import SendFundsForm from '../../SendFunds/SendFundsForm';

const ReplaceTxnModal = ({
	txNonce,
	onCancel,
	refetchTxns,
	canCancelTx,
	multisigAddress
}: {
	txNonce: number;
	onCancel: () => void;
	refetchTxns: () => void;
	canCancelTx: boolean;
	multisigAddress: string;
}) => {
	const [sendTokens, setSendTokens] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const { address } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const onRejectTxn = async () => {
		try {
			setLoading(true);
			const txUrl = returnTxUrl(network as NETWORK);
			const provider = await connectedWallet.getEthersProvider();
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: provider.getSigner(connectedWallet?.address)
			});
			const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
			const data = await gnosisService.createRejectTransactionByNonce(
				txNonce,
				multisigAddress,
				connectedWallet?.address || address,
				chainProperties[network].contractNetworks
			);
			if (data) {
				queueNotification({
					header: 'Success',
					message: 'Rejection Transaction Created',
					status: NotificationStatus.SUCCESS
				});
			}
			setLoading(false);
			refetchTxns();
			onCancel();
		} catch (err) {
			console.log(err);
			queueNotification({
				header: 'Error.',
				message: 'Please try again.',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	return sendTokens ? (
		<SendFundsForm
			defaultTxNonce={txNonce}
			onCancel={onCancel}
		/>
	) : (
		<div className='flex flex-col gap-y-6 items-center text-white'>
			<p className='text-semibold text-lg'>Select how you would like to replace this transaction</p>
			<p className='text-sm max-w-[450px] text-center'>
				A signed transaction cannot be removed but it can be replaced with a new transaction with the same nonce.
			</p>
			<div className='flex items-center gap-x-4 mt-8'>
				<Button
					size='large'
					className='border-none font-normal bg-primary text-white'
					onClick={() => setSendTokens(true)}
					disabled={loading}
				>
					Send Tokens
				</Button>
				<span className='text-sm'>OR</span>
				<div className='flex items-center gap-x-2'>
					<Tooltip
						title={
							!canCancelTx ? (
								<div className='text-text_secondary text-xs'>
									<div>Transaction with nonce {txNonce} already has a reject transaction</div>
								</div>
							) : null
						}
					>
						<Button
							size='large'
							className={`border-2 ${
								!canCancelTx ? 'border-text_secondary text-text_secondary' : 'border-primary text-primary'
							} font-normal bg-transparent`}
							onClick={onRejectTxn}
							loading={loading}
							disabled={!canCancelTx}
						>
							Reject Transaction
						</Button>
					</Tooltip>
					<Tooltip
						title={
							<div className='text-text_secondary text-xs'>
								<div>
									An on-chain rejection doesn&apos;t send any funds. Executing an on-chain rejection will replace all
									currently awaiting transactions with nonce {txNonce}.
								</div>
							</div>
						}
						placement='bottom'
					>
						<InfoCircleOutlined className='text-text_secondary' />
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

export default ReplaceTxnModal;
