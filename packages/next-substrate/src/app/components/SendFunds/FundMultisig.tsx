// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { AutoComplete, Dropdown, Form, Spin } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import ModalBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import useGetWalletAccounts from '@next-substrate/hooks/useGetWalletAccounts';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import AddressQr from '@next-common/ui-components/AddressQr';
import Balance from '@next-common/ui-components/Balance';
import BalanceInput from '@next-common/ui-components/BalanceInput';
import { CircleArrowDownIcon, CopyIcon, QRIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import setSigner from '@next-substrate/utils/setSigner';
import transferFunds from '@next-substrate/utils/transferFunds';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { networks } from '@next-common/global/networkConstants';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
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
	const { apis } = useGlobalApiContext();
	const { activeMultisig, loggedInWallet, address } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const [network, setNetwork] = useState<string>(activeOrg?.multisigs?.[0]?.network || networks.POLKADOT);

	const { accounts } = useGetWalletAccounts(loggedInWallet);

	const [selectedSender, setSelectedSender] = useState(getEncodedAddress(address, network) || '');
	const [amount, setAmount] = useState(new BN(0));
	const [loading, setLoading] = useState(false);
	const [showQrModal, setShowQrModal] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);
	const [isValidSender, setIsValidSender] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const [txnHash, setTxnHash] = useState<string>('');
	const [selectedAccountBalance, setSelectedAccountBalance] = useState<string>('');

	const [selectedMultisig, setSelectedMultisig] = useState<string>(
		activeMultisig || activeOrg?.multisigs?.[0]?.address || ''
	);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<AddressComponent
				isMultisig
				showNetworkBadge
				network={item.network}
				withBadge={false}
				address={item.address}
			/>
		)
	}));

	useEffect(() => {
		if (!getSubstrateAddress(selectedSender)) {
			setIsValidSender(false);
		} else {
			setIsValidSender(true);
		}
	}, [selectedSender]);

	const autocompleteAddresses: DefaultOptionType[] = accounts?.map((account) => ({
		label: (
			<AddressComponent
				name={account.name}
				address={account.address}
				network={network}
			/>
		),
		value: getEncodedAddress(account.address, network) || account.address
	}));

	const addSenderHeading = () => {
		const elm = document.getElementById('recipient_list');
		if (elm) {
			const parentElm = elm.parentElement;
			if (parentElm) {
				const isElmPresent = document.getElementById('recipient_heading');
				if (!isElmPresent) {
					const recipientHeading = document.createElement('p');
					recipientHeading.textContent = 'Addresses';
					recipientHeading.id = 'recipient_heading';
					recipientHeading.classList.add('recipient_heading');
					parentElm.insertBefore(recipientHeading, parentElm.firstChild!);
				}
			}
		}
	};

	const handleSubmit = async () => {
		if (!apis || !apis[network] || !apis[network].apiReady || !selectedMultisig || !amount) return;

		await setSigner(apis[network].api, loggedInWallet, network);

		console.log('obj', {
			amount,
			api: apis[network].apiReady,
			network,
			recepientAddress: selectedMultisig,
			senderAddress: getSubstrateAddress(selectedSender) || selectedSender
		});

		setLoading(true);
		try {
			await transferFunds({
				amount,
				api: apis[network].api,
				network,
				recepientAddress: selectedMultisig,
				senderAddress: getSubstrateAddress(selectedSender) || selectedSender,
				setLoadingMessages,
				setTxnHash
			});
			setLoading(false);
			setSuccess(true);
		} catch (error) {
			console.log(error);
			setLoading(false);
			setFailure(true);
			setTimeout(() => setFailure(false), 5000);
		}
	};

	return success ? (
		<TransactionSuccessScreen
			network={network}
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
			<ModalComponent
				title={<span className='font-bold text-lg text-white'>Address QR</span>}
				onCancel={() => setShowQrModal(false)}
				open={showQrModal}
			>
				<AddressQr address={selectedSender} />
			</ModalComponent>
			<div className={className}>
				<div>
					<p className='text-primary font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'>
						Sending from
						<Balance
							api={apis?.[network]?.api}
							apiReady={apis?.[network]?.apiReady}
							network={network}
							address={selectedMultisig}
						/>
					</p>
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px]  max-sm:w-full'
						menu={{
							items: multisigOptions,
							onClick: (e) => {
								console.log(JSON.parse(e.key));
								setSelectedMultisig(JSON.parse(e.key)?.address);
								setNetwork(JSON.parse(e.key)?.network);
							}
						}}
					>
						<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
							<AddressComponent
								isMultisig
								showNetworkBadge
								network={network}
								withBadge={false}
								address={selectedMultisig}
							/>
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</div>

				<Form disabled={loading}>
					<section className='mt-6'>
						<div className='flex items-center justify-between mb-2'>
							<label className='text-primary font-normal text-xs leading-[13px] block'>Sending from</label>
							<Balance
								api={apis?.[network]?.api}
								network={network}
								apiReady={apis?.[network]?.apiReady}
								address={selectedSender}
								onChange={setSelectedAccountBalance}
							/>
						</div>
						<div className='flex items-center gap-x-[10px]'>
							<div className='w-full'>
								<Form.Item
									name='sender'
									rules={[{ required: true }]}
									help={!isValidSender && 'Please add a valid Address.'}
									className='border-0 outline-0 my-0 p-0'
									validateStatus={selectedSender && isValidSender ? 'success' : 'error'}
								>
									<div className='flex items-center'>
										<AutoComplete
											filterOption
											className='[&>div>span>input]:px-[12px]'
											onClick={addSenderHeading}
											options={autocompleteAddresses}
											id='sender'
											placeholder='Send from Address..'
											onChange={(value) => setSelectedSender(value)}
											defaultValue={getEncodedAddress(address, network) || ''}
										/>
										<div className='absolute right-2'>
											<button onClick={() => copyText(selectedSender, true, network)}>
												<CopyIcon className='mr-2 text-primary' />
											</button>
											<button onClick={() => setShowQrModal(true)}>
												<QRIcon className='text-text_secondary' />
											</button>
										</div>
									</div>
								</Form.Item>
							</div>
						</div>
					</section>
					<section className='mt-6'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-2'>Amount</label>
						<BalanceInput
							network={network}
							multipleCurrency
							fromBalance={selectedAccountBalance}
							placeholder='5'
							onChange={(balance) => setAmount(balance)}
						/>
					</section>

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
							loading={loading}
							className='w-[250px]'
							onClick={onCancel}
						/>
						<ModalBtn
							disabled={
								!selectedSender || !isValidSender || amount.isZero() || amount.gte(new BN(selectedAccountBalance))
							}
							loading={loading}
							onClick={handleSubmit}
							className='w-[250px]'
							title='Make Transaction'
						/>
					</section>
				</Form>
			</div>
		</Spin>
	);
};

export default FundMultisig;
