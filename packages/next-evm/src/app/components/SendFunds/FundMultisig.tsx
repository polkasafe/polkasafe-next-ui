// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown, Form, Spin } from 'antd';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import ModalBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import Balance from '@next-evm/ui-components/Balance';
import BalanceInput from '@next-evm/ui-components/BalanceInput';
import queueNotification from '@next-common/ui-components/QueueNotification';
import copyText from '@next-evm/utils/copyText';

import addNewTransaction from '@next-evm/utils/addNewTransaction';
import { useWallets } from '@privy-io/react-auth';
import { NETWORK } from '@next-common/global/evm-network-constants';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { CircleArrowDownIcon, CopyIcon } from '@next-common/ui-components/CustomIcons';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import TransactionSuccessScreen from './TransactionSuccessScreen';

const FundMultisig = ({
	className,
	onCancel,
	setNewTxn
}: {
	className?: string;
	onCancel: () => void;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>;
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { activeMultisig, address } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { allAssets } = useMultisigAssetsContext();

	const activeMultisigData = activeMultisig && activeOrg?.multisigs.find((item) => item.address === activeMultisig);

	const [amount, setAmount] = useState('0');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure] = useState(false);
	const [loadingMessages] = useState<string>('');
	const [txnHash] = useState<string>('');

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const [selectedMultisig, setSelectedMultisig] = useState<IMultisigAddress>(
		activeMultisigData || activeOrg?.multisigs?.[0]
	);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<AddressComponent
				isMultisig
				showNetworkBadge
				withBadge={false}
				network={item.network as NETWORK}
				address={item.address}
			/>
		)
	}));

	const handleSubmit = async () => {
		if (!connectedWallet || !connectedWallet.address) return;
		setLoading(true);
		try {
			const provider = await connectedWallet.getEthersProvider();
			const signer = provider.getSigner(connectedWallet.address);
			if (!signer) {
				console.log('No signer found');
				setLoading(false);
				return;
			}
			const tx = await signer.sendTransaction({
				to: selectedMultisig.address || activeMultisig,
				value: ethers.utils.parseUnits(amount.toString(), 'ether').toString()
			});
			const { transactionHash, to } = await tx.wait();
			await addNewTransaction({
				address: connectedWallet?.address || address,
				amount: ethers.utils.parseUnits(amount.toString(), 'ether').toString(),
				callData: '',
				callHash: transactionHash,
				executed: true,
				network: NETWORK.POLYGON,
				note: '',
				safeAddress: selectedMultisig.address || activeMultisig,
				to,
				type: 'received'
			});
			queueNotification({
				header: 'Success!',
				message: 'You have successfully completed the transaction. ',
				status: NotificationStatus.SUCCESS
			});
			setSuccess(true);
		} catch (err) {
			console.log('error from handleSubmit sendNativeToken', err);
			setNewTxn?.((prev) => !prev);
			onCancel();
			queueNotification({
				header: 'Error!',
				message: 'Please try again',
				status: NotificationStatus.ERROR
			});
		}

		setLoading(false);
	};

	return success ? (
		<TransactionSuccessScreen
			successMessage='Transaction Successful!'
			amount={amount}
			sender={connectedWallet?.address}
			recipients={[selectedMultisig.address]}
			created_at={new Date()}
			txnHash={txnHash}
			onDone={() => {
				setNewTxn?.((prev) => !prev);
				onCancel();
			}}
		/>
	) : failure ? (
		<FailedTransactionLottie message='Failed!' />
	) : (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={300}
					message={loadingMessages}
				/>
			}
		>
			<div className={className}>
				<p className='text-primary font-normal text-xs leading-[13px] mb-2 flex justify-between items-center'>
					Recipient
					<Balance
						isMultisig
						allAssets={allAssets}
						network={selectedMultisig.network as NETWORK}
						address={selectedMultisig.address || activeMultisig}
					/>
				</p>
				{/* TODO: Make into reusable component */}
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-full'
					menu={{
						items: multisigOptions,
						onClick: (e) => {
							console.log(JSON.parse(e.key));
							setSelectedMultisig(JSON.parse(e.key) as IMultisigAddress);
						}
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						<AddressComponent
							isMultisig
							showNetworkBadge
							withBadge={false}
							network={selectedMultisig.network as NETWORK}
							address={selectedMultisig.address}
						/>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>

				<Form disabled={loading}>
					<section className='mt-6'>
						<div className='flex items-center justify-between mb-2'>
							<label className='text-primary font-normal text-xs leading-[13px] block'>Sending from</label>
							<Balance
								network={selectedMultisig.network as NETWORK}
								address={connectedWallet.address || address}
							/>
						</div>
						<div className='flex items-center gap-x-[10px] border border-text_placeholder rounded-lg p-2'>
							<div className='w-full'>
								<div className='flex gap-x-3 items-center'>
									<div className='relative'>
										<MetaMaskAvatar
											address={connectedWallet.address || address || ''}
											size={20}
										/>
									</div>
									<div>
										<div className='text-xs font-bold text-white flex items-center gap-x-2'>My Address</div>
										<div className='flex text-xs text-text_secondary'>
											<div
												title={connectedWallet.address || address || ''}
												className=' font-normal'
											>
												{connectedWallet.address || address || ''}
											</div>
											<button
												className='ml-2 mr-1 text-primary'
												onClick={() => copyText(connectedWallet.address || address || '')}
											>
												<CopyIcon />
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					<BalanceInput
						multisigAddress={selectedMultisig.address || activeMultisig}
						className='mt-6'
						placeholder='5'
						label='Amount*'
						onChange={(balance) => setAmount(balance)}
					/>

					{/* <section className='mt-6'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Existential Deposit</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									name="existential_deposit"
									className='border-0 outline-0 my-0 p-0'
								>
									<div className='flex items-center h-[40px]'>
										<Input
											disabled={true}
											type='number'
											placeholder={String(chainProperties[network].existentialDeposit)}
											className="text-sm font-normal leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24"
											id="existential_deposit"
										/>
										<div className='absolute right-0 text-white px-3 flex items-center justify-center'>
											<ParachainIcon src={chainProperties[network]?.logo} className='mr-2' />
											<span>{ chainProperties[network].tokenSymbol}</span>
										</div>
									</div>
								</Form.Item>
							</article>
						</div>
					</section> */}

					<section className='flex items-center gap-x-5 justify-center mt-10'>
						<CancelBtn
							className='w-[200px]'
							onClick={onCancel}
							loading={loading}
						/>
						<ModalBtn
							disabled={amount === '0'}
							loading={loading}
							onClick={handleSubmit}
							className='w-[200px]'
							title='Make Transaction'
						/>
					</section>
				</Form>
			</div>
		</Spin>
	);
};

export default FundMultisig;
