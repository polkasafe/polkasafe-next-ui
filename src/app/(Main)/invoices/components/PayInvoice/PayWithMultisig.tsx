// import {
// 	EFieldType,
// 	EINVOICE_STATUS,
// 	IMultisigAddress,
// 	IQueueItem,
// 	ITxnCategory,
// 	NotificationStatus,
// 	QrState
// } from '@next-common/types';
// import {
// 	CircleArrowDownIcon,
// 	LineIcon,
// 	SquareDownArrowIcon,
// 	WarningCircleIcon
// } from '@next-common/ui-components/CustomIcons';
// import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
// import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
// import AddressComponent from '@next-common/ui-components/AddressComponent';
// import Balance from '@next-common/ui-components/Balance';
// import { Divider, Dropdown, Form, Input } from 'antd';
// import { ItemType } from 'antd/lib/menu/hooks/useItems';
// import React, { useEffect, useState } from 'react';
// import BalanceInput from '@next-common/ui-components/BalanceInput';
// import formatBalance from '@next-substrate/utils/formatBalance';
// import queueNotification from '@next-common/ui-components/QueueNotification';
// import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
// import { chainProperties, networks } from '@next-common/global/networkConstants';
// import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
// import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
// import BN from 'bn.js';
// import initMultisigTransfer, { IMultiTransferResponse } from '@next-substrate/utils/initMultisigTransfer';
// import setSigner from '@next-substrate/utils/setSigner';
// import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
// import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
// import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
// import ModalComponent from '@next-common/ui-components/ModalComponent';
// import { isHex } from '@polkadot/util';
// import { useCache } from '@next-substrate/context/CachedDataContext';
// import CancelBtn from '../../Settings/CancelBtn';
// import ModalBtn from '../../Settings/ModalBtn';

// const PayWithMultisig = ({
// 	receiverAddress,
// 	requestedAmountInDollars,
// 	onCancel,
// 	invoiceId,
// 	requestedNetwork
// }: {
// 	receiverAddress: string;
// 	requestedAmountInDollars: string;
// 	onCancel: () => void;
// 	invoiceId: string;
// 	requestedNetwork: string;
// }) => {
// 	const { apis } = useGlobalApiContext();
// 	const { activeMultisig, address, loggedInWallet } = useGlobalUserDetailsContext();
// 	const { activeOrg } = useActiveOrgContext();
// 	const transactionFields = activeOrg?.transactionFields || {};

// 	const { getCache, setCache } = useCache();

// 	const { allCurrencyPrices, tokensUsdPrice } = useGlobalCurrencyContext();

// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 	const [transactionData, setTransactionData] = useState<any>({});

// 	const [multisig, setMultisig] = useState<IMultisigAddress>(
// 		activeOrg?.multisigs?.find(
// 			(item) => item.address === activeMultisig || (item.proxy && checkMultisigWithProxy(item.proxy, activeMultisig))
// 		) || ({} as IMultisigAddress)
// 	);
// 	const [network, setNetwork] = useState<string>(activeOrg?.multisigs?.[0]?.network || networks.POLKADOT);

// 	const [note, setNote] = useState<string>('');
// 	const [amount, setAmount] = useState<BN>(new BN(0));
// 	const [token, setToken] = useState<string>('');

// 	const [tokensRequested, setTokensRequested] = useState<string>('0');

// 	const [category, setCategory] = useState<string>('none');

// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 	const [loadingMessages, setLoadingMessages] = useState<string>('');

// 	const [transactionFieldsObject, setTransactionFieldsObject] = useState<{
// 		category: string;
// 		subfields: { [subfield: string]: { name: string; value: string } };
// 	}>({ category: 'none', subfields: {} });

// 	const [loading, setLoading] = useState<boolean>(false);

// 	const [selectedMultisig, setSelectedMultisig] = useState<string>(
// 		activeMultisig || activeOrg?.multisigs?.[0]?.address || ''
// 	);

// 	const [openSignWithVaultModal, setOpenSignWithVaultModal] = useState<boolean>(false);

// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 	const [{ isQrHashed, qrAddress, qrPayload, qrResolve }, setQrState] = useState<QrState>(() => ({
// 		isQrHashed: false,
// 		qrAddress: '',
// 		qrPayload: new Uint8Array()
// 	}));

// 	useEffect(() => {
// 		if (!activeOrg || !activeOrg.multisigs) return;
// 		const m = activeOrg?.multisigs?.find(
// 			(item) =>
// 				item.address === selectedMultisig || (item.proxy && checkMultisigWithProxy(item.proxy, selectedMultisig))
// 		);
// 		setMultisig(m || activeOrg.multisigs[0]);
// 		setNetwork(m?.network || activeOrg.multisigs[0].network);
// 	}, [activeOrg, selectedMultisig]);

// 	const multisigOptions: ItemType[] =
// 		activeOrg?.multisigs?.map((item) => ({
// 			key: JSON.stringify(item),
// 			label: (
// 				<AddressComponent
// 					isMultisig
// 					showNetworkBadge
// 					network={item.network}
// 					withBadge={false}
// 					address={item.address}
// 				/>
// 			)
// 		})) || [];

// 	useEffect(() => {
// 		if (!requestedAmountInDollars || !allCurrencyPrices || !tokensUsdPrice) return;

// 		const tokenPriceInUsd = Number(tokensUsdPrice[network]?.value) * (allCurrencyPrices.USD?.value || 1);
// 		if (tokenPriceInUsd === 0) {
// 			setTokensRequested(String(0));
// 			return;
// 		}
// 		const numberOfTokens = Number(requestedAmountInDollars) / Number(tokenPriceInUsd);
// 		setTokensRequested(String(numberOfTokens));
// 	}, [allCurrencyPrices, network, requestedAmountInDollars, tokensUsdPrice]);

// 	const updateInvoice = async (transactionHash: string) => {
// 		if (!invoiceId || !transactionHash) return;

// 		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateInvoice_substrate`, {
// 			body: JSON.stringify({
// 				invoiceId,
// 				status: EINVOICE_STATUS.PAID,
// 				transactionHash
// 			}),
// 			headers: firebaseFunctionsHeader(),
// 			method: 'POST'
// 		});
// 		const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
// 			data: any;
// 			error: string;
// 		};
// 		if (!invoiceError && invoiceData) {
// 			console.log('invoice data', invoiceData);
// 		}
// 	};

// 	const addToQueue = ({
// 		approvals,
// 		txHash,
// 		txData,
// 		totalAmount,
// 		multisigNetwork,
// 		multisigAddress,
// 		txFields,
// 		multisigThreshold
// 	}: {
// 		totalAmount: string;
// 		txHash: string;
// 		txData: string;
// 		multisigAddress: string;
// 		multisigNetwork: string;
// 		txFields: ITxnCategory;
// 		multisigThreshold: number;
// 		approvals: string[];
// 	}) => {
// 		if (!txHash || !txData || !activeOrg?.id) return;
// 		const prevQueue = getCache(`all-queue-txns-${activeOrg?.id}`);
// 		console.log('old queue', prevQueue);
// 		const newQueueItem: IQueueItem = {
// 			approvals,
// 			callData: txData,
// 			callHash: txHash,
// 			created_at: new Date(),
// 			multisigAddress,
// 			network: multisigNetwork,
// 			status: 'Approval',
// 			threshold: multisigThreshold,
// 			totalAmount,
// 			transactionFields: txFields
// 		};
// 		const newQueue: IQueueItem[] = [newQueueItem, ...prevQueue];
// 		setCache(`all-queue-txns-${activeOrg?.id}`, newQueue, 1800);
// 	};

// 	const handleSubmit = async () => {
// 		if (!apis || !apis[network] || !apis[network].apiReady || !address) {
// 			return;
// 		}

// 		await setSigner(apis[network].api, loggedInWallet, network);

// 		if (!selectedMultisig) return;

// 		setLoading(true);
// 		try {
// 			let queueItemData: IMultiTransferResponse | undefined = {} as any;
// 			if (!amount || amount.isZero() || !receiverAddress) {
// 				queueNotification({
// 					header: 'Error!',
// 					message: 'Invalid Input.',
// 					status: NotificationStatus.ERROR
// 				});
// 				setLoading(false);
// 				return;
// 			}
// 			queueItemData = await initMultisigTransfer({
// 				addToQueue,
// 				api: apis[network].api,
// 				initiatorAddress: address,
// 				multisig,
// 				network,
// 				note,
// 				recipientAndAmount: [{ amount, recipient: receiverAddress }],
// 				selectedProxy: selectedMultisig,
// 				setLoadingMessages,
// 				setOpenSignWithVaultModal,
// 				setQrState,
// 				tip: new BN(0),
// 				transactionFields: transactionFieldsObject,
// 				transferKeepAlive: true
// 			});
// 			setTransactionData(queueItemData);
// 			setLoading(false);
// 			if (queueItemData?.callHash) {
// 				await updateInvoice(queueItemData?.callHash);
// 			}
// 			// setSuccess(true);
// 		} catch (error) {
// 			console.log(error);
// 			// setTransactionData(error);
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<div>
// 			{requestedNetwork !== network && (
// 				<p className='p-3 bg-waiting bg-opacity-10 rounded-xl font-normal text-sm text-waiting leading-[15.23px] flex items-center gap-x-2 w-full'>
// 					<WarningCircleIcon className='text-sm' />
// 					The Receiver Address Network is {requestedNetwork}, Please select a Multisig in the same network.
// 				</p>
// 			)}
// 			<ModalComponent
// 				open={openSignWithVaultModal}
// 				onCancel={() => {
// 					setOpenSignWithVaultModal(false);
// 					setLoading(false);
// 				}}
// 				title='Authorize Transaction in Vault'
// 			>
// 				<div className='flex items-center gap-x-4'>
// 					<div className='rounded-xl bg-white p-4'>
// 						<QrDisplayPayload
// 							cmd={isQrHashed ? 1 : 2}
// 							address={address}
// 							genesisHash={apis[network]?.api?.genesisHash}
// 							payload={qrPayload}
// 						/>
// 					</div>
// 					<QrScanSignature
// 						onScan={(data) => {
// 							if (data && data.signature && isHex(data.signature)) {
// 								console.log('signature', data.signature);
// 								if (qrResolve) {
// 									qrResolve({
// 										id: 0,
// 										signature: data.signature
// 									});
// 								}
// 								setOpenSignWithVaultModal(false);
// 							}
// 						}}
// 					/>
// 				</div>
// 			</ModalComponent>
// 			<Form className='max-h-[68vh] overflow-y-auto px-2 pb-8'>
// 				<section>
// 					<div className='flex items-center gap-x-[10px] mt-[14px]'>
// 						<article className='w-[500px]'>
// 							<p className='text-primary font-normal mb-2 text-xs leading-[13px] flex items-center justify-between'>
// 								Sending from
// 								<Balance
// 									api={apis?.[network]?.api}
// 									apiReady={apis?.[network]?.apiReady || false}
// 									network={network}
// 									address={selectedMultisig}
// 									onChange={(balance) => setToken(balance)}
// 								/>
// 							</p>
// 							<Dropdown
// 								trigger={['click']}
// 								className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px]'
// 								menu={{
// 									items: multisigOptions,
// 									onClick: (e) => {
// 										console.log(JSON.parse(e.key));
// 										setSelectedMultisig(JSON.parse(e.key)?.address);
// 										setNetwork(JSON.parse(e.key)?.network);
// 									}
// 								}}
// 							>
// 								<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
// 									<AddressComponent
// 										isMultisig
// 										showNetworkBadge
// 										network={network}
// 										withBadge={false}
// 										address={selectedMultisig}
// 									/>
// 									<CircleArrowDownIcon className='text-primary' />
// 								</div>
// 							</Dropdown>
// 						</article>
// 						<article className='w-[412px] flex items-center'>
// 							<span className='-mr-1.5 z-0'>
// 								<LineIcon className='text-5xl' />
// 							</span>
// 							<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
// 								The transferred balance will be subtracted (along with fees) from the sender account.
// 							</p>
// 						</article>
// 					</div>
// 					<div className='w-[500px]'>
// 						<Divider className='border-[#505050]'>
// 							<SquareDownArrowIcon />
// 						</Divider>
// 					</div>
// 				</section>

// 				<section className=''>
// 					<div className='flex items-start gap-x-[10px]'>
// 						<article className='w-[500px]'>
// 							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient*</label>
// 							<div className='h-[50px]'>
// 								<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
// 									<AddressComponent address={receiverAddress} />
// 								</div>
// 							</div>
// 						</article>
// 						<div className='flex flex-col gap-y-4'>
// 							<article className='w-[412px] flex items-center'>
// 								<span className='-mr-1.5 z-0'>
// 									<LineIcon className='text-5xl' />
// 								</span>
// 								<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
// 									The beneficiary will have access to the transferred fees when the transaction is included in a block.
// 								</p>
// 							</article>
// 						</div>
// 					</div>
// 				</section>
// 				<section className='mt-[15px]'>
// 					<div className='flex items-start gap-x-[10px]'>
// 						<article className='w-[500px]'>
// 							<BalanceInput
// 								network={network}
// 								label={`Amount* (Requested: $${formatBalance(requestedAmountInDollars)})`}
// 								onChange={(balance) => setAmount(balance)}
// 								requestedAmount={requestedAmountInDollars}
// 								fromBalance={token}
// 							/>
// 						</article>
// 						<div className='flex flex-col gap-y-4'>
// 							<article className='w-[412px] flex items-center'>
// 								<span className='-mr-1.5 z-0'>
// 									<LineIcon className='text-5xl' />
// 								</span>
// 								<p className='p-3 bg-waiting bg-opacity-10 rounded-xl font-normal text-sm text-waiting leading-[15.23px] flex items-center gap-x-2 w-full'>
// 									<WarningCircleIcon className='text-sm' />
// 									Tokens Requested in {chainProperties[network].tokenSymbol} is {formatBalance(tokensRequested)}{' '}
// 									{chainProperties[network].tokenSymbol}
// 								</p>
// 							</article>
// 						</div>
// 					</div>
// 				</section>

// 				<section className='mt-[15px] w-[500px]'>
// 					<label className='text-primary font-normal text-xs block mb-[5px]'>Category*</label>
// 					<Form.Item
// 						name='category'
// 						rules={[{ message: 'Required', required: true }]}
// 						className='border-0 outline-0 my-0 p-0'
// 					>
// 						<Dropdown
// 							trigger={['click']}
// 							className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
// 							menu={{
// 								items: [
// 									...Object.keys(transactionFields)
// 										.filter((c) => c !== 'none')
// 										.map((c) => ({
// 											key: c,
// 											label: <span className='text-white'>{transactionFields[c]?.fieldName}</span>
// 										})),
// 									{
// 										key: 'none',
// 										label: <span className='text-white'>Other</span>
// 									}
// 								],
// 								onClick: (e) => setCategory(e.key)
// 							}}
// 						>
// 							<div className='flex justify-between items-center text-white'>
// 								{transactionFields[category]?.fieldName}
// 								<CircleArrowDownIcon className='text-primary' />
// 							</div>
// 						</Dropdown>
// 					</Form.Item>
// 				</section>

// 				{transactionFields[category] &&
// 					transactionFields[category].subfields &&
// 					Object.keys(transactionFields[category].subfields).map((subfield) => {
// 						const subfieldObject = transactionFields[category].subfields[subfield];
// 						return (
// 							<section
// 								key={subfield}
// 								className='mt-[15px]'
// 							>
// 								<label className='text-primary font-normal text-xs block mb-[5px]'>
// 									{subfieldObject.subfieldName}
// 									{subfieldObject.required && '*'}
// 								</label>
// 								<div className=''>
// 									<article className='w-[500px]'>
// 										{subfieldObject.subfieldType === EFieldType.SINGLE_SELECT && subfieldObject.dropdownOptions ? (
// 											<Form.Item
// 												name={`${subfieldObject.subfieldName}`}
// 												rules={[{ message: 'Required', required: subfieldObject.required }]}
// 												className='border-0 outline-0 my-0 p-0'
// 												// help={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required && `${subfieldObject.subfieldName} is Required.`}
// 												// validateStatus={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required ? 'error' : 'success'}
// 											>
// 												<Dropdown
// 													trigger={['click']}
// 													className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
// 													menu={{
// 														items: subfieldObject.dropdownOptions
// 															?.filter((item) => !item.archieved)
// 															.map((item) => ({
// 																key: item.optionName,
// 																label: <span className='text-white'>{item.optionName}</span>
// 															})),
// 														onClick: (e) => {
// 															setTransactionFieldsObject((prev) => ({
// 																category: transactionFields[category].fieldName,
// 																subfields: {
// 																	...prev.subfields,
// 																	[subfield]: {
// 																		name: subfieldObject.subfieldName,
// 																		value: e.key
// 																	}
// 																}
// 															}));
// 														}
// 													}}
// 												>
// 													<div className='flex justify-between items-center text-white'>
// 														{transactionFieldsObject.subfields[subfield]?.value ? (
// 															transactionFieldsObject.subfields[subfield]?.value
// 														) : (
// 															<span className='text-text_secondary'>Select {subfieldObject.subfieldName}</span>
// 														)}
// 														<CircleArrowDownIcon className='text-primary' />
// 													</div>
// 												</Dropdown>
// 											</Form.Item>
// 										) : (
// 											<Form.Item
// 												name={subfield}
// 												rules={[{ message: 'Required', required: subfieldObject.required }]}
// 												className='border-0 outline-0 my-0 p-0'
// 											>
// 												<div className='flex items-center h-[40px]'>
// 													<Input
// 														placeholder={`${subfieldObject.subfieldName}`}
// 														className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
// 														id={subfield}
// 														value={transactionFieldsObject.subfields[subfield]?.value}
// 														onChange={(e) =>
// 															setTransactionFieldsObject((prev) => ({
// 																category: transactionFields[category].fieldName,
// 																subfields: {
// 																	...prev.subfields,
// 																	[subfield]: {
// 																		name: subfieldObject.subfieldName,
// 																		value: e.target.value
// 																	}
// 																}
// 															}))
// 														}
// 													/>
// 												</div>
// 											</Form.Item>
// 										)}
// 									</article>
// 								</div>
// 							</section>
// 						);
// 					})}

// 				<section className='mt-[15px]'>
// 					<label className='text-primary font-normal text-xs block mb-7'>Note</label>
// 					<div className=''>
// 						<article className='w-[500px]'>
// 							<Form.Item
// 								name='note'
// 								rules={[]}
// 								className='border-0 outline-0 my-0 p-0'
// 							>
// 								<div className='flex items-center h-[40px]'>
// 									<Input.TextArea
// 										placeholder='Note'
// 										className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
// 										id='note'
// 										rows={4}
// 										value={note}
// 										onChange={(e) => setNote(e.target.value)}
// 									/>
// 								</div>
// 							</Form.Item>
// 						</article>
// 					</div>
// 				</section>
// 			</Form>
// 			<section className='flex items-center gap-x-5 justify-center mt-10'>
// 				<CancelBtn
// 					className='w-[250px]'
// 					onClick={onCancel}
// 					loading={loading}
// 				/>
// 				<ModalBtn
// 					loading={loading}
// 					disabled={
// 						!amount ||
// 						amount.isZero() ||
// 						amount.gt(new BN(token)) ||
// 						requestedNetwork !== network ||
// 						Object.keys(transactionFields[category].subfields).some(
// 							(key) =>
// 								!transactionFieldsObject.subfields[key]?.value && transactionFields[category].subfields[key].required
// 						)
// 					}
// 					onClick={handleSubmit}
// 					className='w-[250px]'
// 					title='Make Transaction'
// 				/>
// 			</section>
// 		</div>
// 	);
// };

// export default PayWithMultisig;
