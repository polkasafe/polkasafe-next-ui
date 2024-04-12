// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Spin, Tooltip } from 'antd';
import React, { useState } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import AddMultisigSVG from '@next-common/assets/add-multisig.svg';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import AddProxySuccessScreen from '@next-evm/app/components/Multisig/AddProxySuccessScreen';
import CancelBtn from '@next-evm/app/components/Settings/CancelBtn';
import RemoveBtn from '@next-evm/app/components/Settings/RemoveBtn';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import { WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import queueNotification from '@next-common/ui-components/QueueNotification';
import addNewTransaction from '@next-evm/utils/addNewTransaction';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { EthersAdapter } from '@safe-global/protocol-kit';
import returnTxUrl from '@next-common/global/gnosisService';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';

const RemoveOwner = ({
	addressToRemove,
	oldThreshold,
	oldSignatoriesLength,
	onCancel,
	multisig
}: {
	addressToRemove: string;
	oldThreshold: number;
	oldSignatoriesLength: number;
	onCancel: () => void;
	multisig: IMultisigAddress;
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const [newThreshold, setNewThreshold] = useState(
		oldThreshold === oldSignatoriesLength ? oldThreshold - 1 : oldThreshold
	);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const { address } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [txnHash] = useState<string>('');

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const handleRemoveOwner = async () => {
		if (!connectedWallet || !connectedWallet.address) return;
		setLoading(true);
		try {
			const txUrl = returnTxUrl(multisig.network as NETWORK);
			await connectedWallet.switchChain(chainProperties[multisig.network].chainId);
			const provider = await connectedWallet.getEthersProvider();
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: provider.getSigner(connectedWallet.address)
			});
			const gnosisService = new GnosisSafeService(web3Adapter, web3Adapter.getSigner(), txUrl);
			const safeTxHash = await gnosisService.createRemoveOwner(
				multisig.address,
				connectedWallet.address,
				addressToRemove,
				newThreshold,
				chainProperties[network].contractNetworks
			);
			if (safeTxHash) {
				addNewTransaction({
					address: connectedWallet.address,
					amount: '0',
					callData: safeTxHash,
					callHash: safeTxHash,
					executed: false,
					network,
					note: 'Removing Owner',
					safeAddress: multisig.address,
					to: '',
					type: 'sent'
				});
				onCancel?.();
				setLoading(false);
				queueNotification({
					header: 'Success',
					message: 'New Transaction Created.',
					status: NotificationStatus.SUCCESS
				});
			} else {
				setLoading(false);
				setFailure(true);
				queueNotification({
					header: 'Error.',
					message: 'Please try again.',
					status: NotificationStatus.ERROR
				});
			}
		} catch (err) {
			onCancel?.();
			setLoading(false);
			setFailure(true);
			queueNotification({
				header: 'Error.',
				message: 'Please try again.',
				status: NotificationStatus.ERROR
			});
		}
	};

	return success ? (
		<AddProxySuccessScreen
			createdBy={connectedWallet.address || address}
			signatories={multisig?.signatories || []}
			threshold={multisig?.threshold || 2}
			txnHash={txnHash}
			onDone={() => {
				onCancel?.();
				setSuccess(false);
			}}
			successMessage='Multisig Edit in Progress!'
			waitMessage='All threshold signatories need to sign the Transaction to Edit the Multisig.'
		/>
	) : failure ? (
		<FailedTransactionLottie message='Failed!' />
	) : (
		<Spin
			spinning={loading}
			indicator={<LoadingLottie />}
		>
			<Form className='my-0'>
				<div className='flex justify-center gap-x-4 items-center mb-6 w-full'>
					<div className='flex flex-col text-white items-center justify-center'>
						<AddMultisigSVG />
						<p className='text-text_secondary'>Remove Owner</p>
					</div>
				</div>
				<section className='mb-4 w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[16px] flex items-center gap-x-[11px]'>
					<span>
						<WarningCircleIcon className='text-base' />
					</span>
					<p>Removing a signatory would require the approvals of present signatories.</p>
				</section>
				<div className='text-primary text-sm mb-2'>Remove Signatory*</div>
				<div className='flex items-center p-3 mb-4 text-text_secondary border-dashed border-2 border-bg-secondary rounded-lg gap-x-5'>
					<MetaMaskAvatar
						address={addressToRemove}
						size={20}
					/>
					{addressToRemove}
				</div>
				<div className='text-primary text-sm mb-2'>New Threshold</div>
				<div className='flex items-center gap-x-3'>
					<p className='flex items-center justify-center gap-x-[16.83px] p-[12.83px] bg-bg-secondary rounded-lg'>
						<Tooltip title={newThreshold === 2 && 'Minimum Threshold must be 2'}>
							<Button
								onClick={() => {
									if (newThreshold !== 2) {
										setNewThreshold((prev) => prev - 1);
									}
								}}
								className={`p-0 outline-none border rounded-full flex items-center justify-center ${
									newThreshold === 2 ? 'border-text_secondary text-text_secondary' : 'text-primary border-primary'
								} w-[14.5px] h-[14.5px]`}
							>
								-
							</Button>
						</Tooltip>
						<span className='text-white text-sm'>{newThreshold}</span>
						<Tooltip
							title={newThreshold === oldSignatoriesLength - 1 && 'Threshold must be Less than or Equal to Signatories'}
						>
							<Button
								onClick={() => {
									if (newThreshold < oldSignatoriesLength - 1) {
										setNewThreshold((prev) => prev + 1);
									}
								}}
								className={`p-0 outline-none border rounded-full flex items-center justify-center ${
									newThreshold === oldSignatoriesLength - 1
										? 'border-text_secondary text-text_secondary'
										: 'text-primary border-primary'
								} w-[14.5px] h-[14.5px]`}
							>
								+
							</Button>
						</Tooltip>
					</p>
					<p className='text-text_secondary font-normal text-sm leading-[15px]'>
						out of <span className='text-white font-medium'>{oldSignatoriesLength - 1}</span> owners
					</p>
				</div>
				<div className='flex items-center justify-between gap-x-4 mt-[30px]'>
					<CancelBtn onClick={onCancel} />
					<RemoveBtn
						loading={loading}
						onClick={handleRemoveOwner}
					/>
				</div>
			</Form>
		</Spin>
	);
};

export default RemoveOwner;
