import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { EFieldType, EINVOICE_STATUS, NotificationStatus } from '@next-common/types';
import {
	CircleArrowDownIcon,
	LineIcon,
	SquareDownArrowIcon,
	WarningCircleIcon
} from '@next-common/ui-components/CustomIcons';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import Balance from '@next-evm/ui-components/Balance';
import { Divider, Dropdown, Form, Input } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useEffect, useState } from 'react';
import BalanceInput from '@next-evm/ui-components/BalanceInput';
import formatBalance from '@next-evm/utils/formatBalance';
import returnTxUrl from '@next-common/global/gnosisService';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import GnosisSafeService from '@next-evm/services/Gnosis';
import addNewTransaction from '@next-evm/utils/addNewTransaction';
import queueNotification from '@next-common/ui-components/QueueNotification';
import notify from '@next-evm/utils/notify';
import getOtherSignatories from '@next-evm/utils/getOtherSignatories';
import { useWallets } from '@privy-io/react-auth';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import ModalBtn from '../../Settings/ModalBtn';
import CancelBtn from '../../Settings/CancelBtn';

const PayWithMultisig = ({
	receiverAddress,
	requestedAmountInDollars,
	onCancel,
	invoiceId,
	requestedNetwork
}: {
	receiverAddress: string;
	requestedAmountInDollars: string;
	onCancel: () => void;
	invoiceId: string;
	requestedNetwork: NETWORK;
}) => {
	const { activeMultisig, address, activeMultisigData } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { transactionFields } = activeOrg;
	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const [network, setNetwork] = useState<NETWORK>(
		(activeMultisigData?.network as NETWORK) || (activeOrg?.multisigs?.[0]?.network as NETWORK) || NETWORK.POLYGON
	);
	const { allAssets } = useMultisigAssetsContext();

	console.log('all assets', allAssets);

	const [selectedMultisig, setSelectedMultisig] = useState<string>(
		activeMultisig || activeOrg?.multisigs?.[0]?.address || ''
	);

	const [note, setNote] = useState<string>('');
	const [amount, setAmount] = useState('0');
	const [token, setToken] = useState(allAssets[selectedMultisig]?.assets?.[0]);

	const [tokensRequested, setTokensRequested] = useState<string>('0');

	const [category, setCategory] = useState<string>('none');

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<{
		category: string;
		subfields: { [subfield: string]: { name: string; value: string } };
	}>({ category: 'none', subfields: {} });

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (allAssets && allAssets[selectedMultisig]?.assets) {
			setToken(allAssets[selectedMultisig]?.assets?.[0]);
		}
	}, [allAssets, selectedMultisig]);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<AddressComponent
				isMultisig
				showNetworkBadge
				network={item.network as NETWORK}
				withBadge={false}
				address={item.address}
			/>
		)
	}));

	useEffect(() => {
		if (!requestedAmountInDollars || !token) return;

		const numberOfTokens = Number(requestedAmountInDollars) / Number(token.fiat_conversion);
		setTokensRequested(String(numberOfTokens));
	}, [requestedAmountInDollars, token]);

	const updateInvoice = async (transactionHash: string) => {
		if (!invoiceId || !transactionHash || !connectedWallet) return;

		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateInvoice_eth`, {
			body: JSON.stringify({
				invoiceId,
				status: EINVOICE_STATUS.PAID,
				transactionHash
			}),
			headers: firebaseFunctionsHeader(connectedWallet.address),
			method: 'POST'
		});
		const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
			data: any;
			error: string;
		};
		if (!invoiceError && invoiceData) {
			console.log('invoice data', invoiceData);
		}
	};

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const txUrl = returnTxUrl(network as NETWORK);
			await connectedWallet.switchChain(chainProperties[network].chainId);
			const provider = await connectedWallet.getEthersProvider();
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: provider.getSigner(connectedWallet.address)
			});
			const gnosisService = new GnosisSafeService(web3Adapter, web3Adapter.getSigner(), txUrl);
			let safeTxHash = '';

			const recipients = [receiverAddress];
			const amounts = [ethers.utils.parseUnits(amount, token?.token_decimals || 'ether').toString()];
			const selectedTokens = [token];

			safeTxHash = await gnosisService.createSafeTx(
				selectedMultisig,
				recipients,
				amounts,
				connectedWallet.address || address,
				note,
				selectedTokens
			);

			if (safeTxHash) {
				addNewTransaction({
					address: connectedWallet?.address || address,
					amount,
					callData: safeTxHash,
					callHash: safeTxHash,
					executed: false,
					network,
					note,
					safeAddress: selectedMultisig,
					to: recipients,
					transactionFields: transactionFieldsObject,
					type: 'sent'
				});
				queueNotification({
					header: 'Success',
					message: 'New Transaction Created.',
					status: NotificationStatus.SUCCESS
				});
				onCancel();
				await updateInvoice(safeTxHash);
				notify({
					args: {
						address,
						addresses: getOtherSignatories(address, activeMultisig, activeOrg.multisigs),
						callHash: safeTxHash,
						multisigAddress: selectedMultisig,
						network
					},
					network,
					triggerName: 'initMultisigTransfer'
				});
			} else {
				queueNotification({
					header: 'Error.',
					message: 'Please try again.',
					status: NotificationStatus.ERROR
				});
				setLoading(false);
			}
		} catch (err) {
			console.log(err);
			onCancel?.();
			setLoading(false);
			queueNotification({
				header: 'Error.',
				message: 'Please try again.',
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<div>
			{requestedNetwork !== network && (
				<p className='p-3 bg-waiting bg-opacity-10 rounded-xl font-normal text-sm text-waiting leading-[15.23px] flex items-center gap-x-2 w-full'>
					<WarningCircleIcon className='text-sm' />
					The Receiver Address Network is {requestedNetwork}, Please select a Multisig in the same network.
				</p>
			)}
			<Form className='max-h-[68vh] overflow-y-auto px-2 pb-8'>
				<section>
					<div className='flex items-center gap-x-[10px] mt-[14px]'>
						<article className='w-[500px]'>
							<p className='text-primary font-normal mb-2 text-xs leading-[13px] flex items-center justify-between'>
								Sending from
								<Balance
									isMultisig
									allAssets={allAssets}
									network={network}
									address={selectedMultisig}
								/>
							</p>
							<Dropdown
								trigger={['click']}
								className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px]'
								menu={{
									items: multisigOptions,
									onClick: (e) => {
										console.log(JSON.parse(e.key));
										setSelectedMultisig(JSON.parse(e.key)?.address);
										setNetwork(JSON.parse(e.key)?.network as NETWORK);
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
						</article>
						<article className='w-[412px] flex items-center'>
							<span className='-mr-1.5 z-0'>
								<LineIcon className='text-5xl' />
							</span>
							<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
								The transferred balance will be subtracted (along with fees) from the sender account.
							</p>
						</article>
					</div>
					<div className='w-[500px]'>
						<Divider className='border-[#505050]'>
							<SquareDownArrowIcon />
						</Divider>
					</div>
				</section>

				<section className=''>
					<div className='flex items-start gap-x-[10px]'>
						<article className='w-[500px]'>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient*</label>
							<div className='h-[50px]'>
								<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
									<AddressComponent address={receiverAddress} />
								</div>
							</div>
						</article>
						<div className='flex flex-col gap-y-4'>
							<article className='w-[412px] flex items-center'>
								<span className='-mr-1.5 z-0'>
									<LineIcon className='text-5xl' />
								</span>
								<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
									The beneficiary will have access to the transferred fees when the transaction is included in a block.
								</p>
							</article>
						</div>
					</div>
				</section>
				<section className='mt-[15px]'>
					<div className='flex items-start gap-x-[10px]'>
						<article className='w-[500px]'>
							<BalanceInput
								multisigAddress={selectedMultisig}
								token={token}
								onTokenChange={(t) => {
									setToken(t);
									console.log('token', t);
								}}
								label={`Amount* (Requested: $${formatBalance(requestedAmountInDollars)})`}
								onChange={(balance) => setAmount(balance)}
								requestedAmount={requestedAmountInDollars}
							/>
						</article>
						<div className='flex flex-col gap-y-4'>
							<article className='w-[412px] flex items-center'>
								<span className='-mr-1.5 z-0'>
									<LineIcon className='text-5xl' />
								</span>
								<p className='p-3 bg-waiting bg-opacity-10 rounded-xl font-normal text-sm text-waiting leading-[15.23px] flex items-center gap-x-2 w-full'>
									<WarningCircleIcon className='text-sm' />
									Tokens Requested in {token.name} is {formatBalance(tokensRequested)} {token.name}
								</p>
							</article>
						</div>
					</div>
				</section>

				<section className='mt-[15px] w-[500px]'>
					<label className='text-primary font-normal text-xs block mb-[5px]'>Category*</label>
					<Form.Item
						name='category'
						rules={[{ message: 'Required', required: true }]}
						className='border-0 outline-0 my-0 p-0'
					>
						<Dropdown
							trigger={['click']}
							className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
							menu={{
								items: [
									...Object.keys(transactionFields)
										.filter((c) => c !== 'none')
										.map((c) => ({
											key: c,
											label: <span className='text-white'>{transactionFields[c]?.fieldName}</span>
										})),
									{
										key: 'none',
										label: <span className='text-white'>Other</span>
									}
								],
								onClick: (e) => setCategory(e.key)
							}}
						>
							<div className='flex justify-between items-center text-white'>
								{transactionFields[category]?.fieldName}
								<CircleArrowDownIcon className='text-primary' />
							</div>
						</Dropdown>
					</Form.Item>
				</section>

				{transactionFields[category] &&
					transactionFields[category].subfields &&
					Object.keys(transactionFields[category].subfields).map((subfield) => {
						const subfieldObject = transactionFields[category].subfields[subfield];
						return (
							<section
								key={subfield}
								className='mt-[15px]'
							>
								<label className='text-primary font-normal text-xs block mb-[5px]'>
									{subfieldObject.subfieldName}
									{subfieldObject.required && '*'}
								</label>
								<div className=''>
									<article className='w-[500px]'>
										{subfieldObject.subfieldType === EFieldType.SINGLE_SELECT && subfieldObject.dropdownOptions ? (
											<Form.Item
												name={`${subfieldObject.subfieldName}`}
												rules={[{ message: 'Required', required: subfieldObject.required }]}
												className='border-0 outline-0 my-0 p-0'
												// help={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required && `${subfieldObject.subfieldName} is Required.`}
												// validateStatus={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required ? 'error' : 'success'}
											>
												<Dropdown
													trigger={['click']}
													className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
													menu={{
														items: subfieldObject.dropdownOptions
															?.filter((item) => !item.archieved)
															.map((item) => ({
																key: item.optionName,
																label: <span className='text-white'>{item.optionName}</span>
															})),
														onClick: (e) => {
															setTransactionFieldsObject((prev) => ({
																category: transactionFields[category].fieldName,
																subfields: {
																	...prev.subfields,
																	[subfield]: {
																		name: subfieldObject.subfieldName,
																		value: e.key
																	}
																}
															}));
														}
													}}
												>
													<div className='flex justify-between items-center text-white'>
														{transactionFieldsObject.subfields[subfield]?.value ? (
															transactionFieldsObject.subfields[subfield]?.value
														) : (
															<span className='text-text_secondary'>Select {subfieldObject.subfieldName}</span>
														)}
														<CircleArrowDownIcon className='text-primary' />
													</div>
												</Dropdown>
											</Form.Item>
										) : (
											<Form.Item
												name={subfield}
												rules={[{ message: 'Required', required: subfieldObject.required }]}
												className='border-0 outline-0 my-0 p-0'
											>
												<div className='flex items-center h-[40px]'>
													<Input
														placeholder={`${subfieldObject.subfieldName}`}
														className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
														id={subfield}
														value={transactionFieldsObject.subfields[subfield]?.value}
														onChange={(e) =>
															setTransactionFieldsObject((prev) => ({
																category: transactionFields[category].fieldName,
																subfields: {
																	...prev.subfields,
																	[subfield]: {
																		name: subfieldObject.subfieldName,
																		value: e.target.value
																	}
																}
															}))
														}
													/>
												</div>
											</Form.Item>
										)}
									</article>
								</div>
							</section>
						);
					})}

				<section className='mt-[15px]'>
					<label className='text-primary font-normal text-xs block mb-7'>Note</label>
					<div className=''>
						<article className='w-[500px]'>
							<Form.Item
								name='note'
								rules={[]}
								className='border-0 outline-0 my-0 p-0'
							>
								<div className='flex items-center h-[40px]'>
									<Input.TextArea
										placeholder='Note'
										className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
										id='note'
										rows={4}
										value={note}
										onChange={(e) => setNote(e.target.value)}
									/>
								</div>
							</Form.Item>
						</article>
					</div>
				</section>
			</Form>
			<section className='flex items-center gap-x-5 justify-center mt-10'>
				<CancelBtn
					className='w-[250px]'
					onClick={onCancel}
					loading={loading}
				/>
				<ModalBtn
					loading={loading}
					disabled={
						!amount ||
						Number.isNaN(Number(amount)) ||
						Number(amount) === 0 ||
						Number(amount) > Number(token.balance_token) ||
						requestedNetwork !== network ||
						Object.keys(transactionFields[category].subfields).some(
							(key) =>
								!transactionFieldsObject.subfields[key]?.value && transactionFields[category].subfields[key].required
						)
					}
					onClick={handleSubmit}
					className='w-[250px]'
					title='Make Transaction'
				/>
			</section>
		</div>
	);
};

export default PayWithMultisig;
