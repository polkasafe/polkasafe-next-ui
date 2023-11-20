// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useSigner } from '@thirdweb-dev/react';
import { Form, Spin } from 'antd';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import ModalBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { NotificationStatus } from '@next-common/types';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import Balance from '@next-evm/ui-components/Balance';
import BalanceInput from '@next-evm/ui-components/BalanceInput';
import queueNotification from '@next-common/ui-components/QueueNotification';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';

import addNewTransaction from '@next-evm/utils/addNewTransaction';
import TransactionSuccessScreen from './TransactionSuccessScreen';

const FundMultisig = ({
	className,
	onCancel,
	setNewTxn
}: {
	className?: string;
	onCancel: () => void;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { network } = useGlobalApiContext();
	const { activeMultisig, addressBook, address } = useGlobalUserDetailsContext();

	const [selectedSender] = useState(addressBook[0].address);
	const [amount, setAmount] = useState('0');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure] = useState(false);
	const [loadingMessages] = useState<string>('');
	const [txnHash] = useState<string>('');
	const signer = useSigner();

	const handleSubmit = async () => {
		setLoading(true);
		try {
			if (!signer) {
				return;
			}
			const tx = await signer.sendTransaction({
				to: activeMultisig,
				value: ethers.utils.parseUnits(amount.toString(), 'ether').toString()
			});
			const { transactionHash, to } = await tx.wait();
			await addNewTransaction({
				amount: ethers.utils.parseUnits(amount.toString(), 'ether').toString(),
				callData: '',
				callHash: transactionHash,
				executed: true,
				network,
				note: '',
				safeAddress: activeMultisig,
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
			sender={selectedSender}
			recipients={[activeMultisig]}
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
				<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Recipient</p>
				{/* TODO: Make into reusable component */}
				<div className=' p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center justify-between'>
					<AddressComponent
						withBadge={false}
						address={activeMultisig}
					/>
					<Balance address={activeMultisig} />
				</div>

				<Form disabled={loading}>
					<section className='mt-6'>
						<div className='flex items-center justify-between mb-2'>
							<label className='text-primary font-normal text-xs leading-[13px] block'>Sending from</label>
							<Balance address={selectedSender} />
						</div>
						<div className='flex items-center gap-x-[10px]'>
							<div className='w-full'>
								<div className='flex gap-x-3 items-center'>
									<div className='relative'>
										<MetaMaskAvatar
											address={address || ''}
											size={20}
										/>
									</div>
									<div>
										<div className='text-xs font-bold text-white flex items-center gap-x-2'>My Address</div>
										<div className='flex text-xs'>
											<div
												title={address || ''}
												className=' font-normal text-text_secondary'
											>
												{address && shortenAddress(address || '')}
											</div>
											{
												// eslint-disable-next-line jsx-a11y/control-has-associated-label
												<button
													className='ml-2 mr-1'
													onClick={() => copyText(address)}
												/>
											}
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					<BalanceInput
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
											<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
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
