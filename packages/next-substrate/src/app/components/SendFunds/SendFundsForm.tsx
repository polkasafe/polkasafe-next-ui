// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';

import './style.css';
import { PlusCircleOutlined } from '@ant-design/icons';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AutoComplete, Button, Divider, Dropdown, Form, Input, Skeleton, Spin, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import BN from 'bn.js';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import ModalBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import { EFieldType, IMultisigAddress, IQueueItem, ITxnCategory, NotificationStatus } from '@next-common/types';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import Balance from '@next-common/ui-components/Balance';
import BalanceInput from '@next-common/ui-components/BalanceInput';
import {
	ArrowRightIcon,
	CircleArrowDownIcon,
	CopyIcon,
	DeleteIcon,
	LineIcon,
	OutlineCloseIcon,
	SquareDownArrowIcon,
	WarningCircleIcon
} from '@next-common/ui-components/CustomIcons';
import queueNotification from '@next-common/ui-components/QueueNotification';
import copyText from '@next-substrate/utils/copyText';
import customCallDataTransaction from '@next-substrate/utils/customCallDataTransaction';
import decodeCallData from '@next-substrate/utils/decodeCallData';
import formatBnBalance from '@next-substrate/utils/formatBnBalance';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import initMultisigTransfer, {
	IMultiTransferResponse,
	IRecipientAndAmount
} from '@next-substrate/utils/initMultisigTransfer';
import inputToBn from '@next-substrate/utils/inputToBn';
import setSigner from '@next-substrate/utils/setSigner';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useCache } from '@next-substrate/context/CachedDataContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

import ArgumentsTable from '../Transactions/Queued/ArgumentsTable';
import ManualExtrinsics from './ManualExtrinsics';
import SubmitPreimage from './SubmitPreimage';
import SubmitProposal from './SubmitProposal';
import TransactionFailedScreen from './TransactionFailedScreen';
import TransactionSuccessScreen from './TransactionSuccessScreen';
import UploadAttachment, { ISubfieldAndAttachment } from './UploadAttachment';
import AddAddressModal from './AddAddressModal';
import SetIdentity from './SetIdentity';
import Delegate from './Delegate';

export enum ETransactionType {
	SEND_TOKEN = 'Send Token',
	MANUAL_EXTRINSIC = 'Manual Extrinsic',
	CALL_DATA = 'Call Data',
	SUBMIT_PREIMAGE = 'Submit Preimage',
	SUBMIT_PROPOSAL = 'Submit Proposal',
	SET_IDENTITY = 'Set Identity',
	DELEGATE = 'Delegate'
}

interface ISendFundsFormProps {
	onCancel?: () => void;
	className?: string;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>;
	defaultSelectedAddress?: string;
	transactionType?: ETransactionType;
	setTransactionType?: React.Dispatch<React.SetStateAction<ETransactionType>>;
}

const SendFundsForm = ({
	className,
	onCancel,
	defaultSelectedAddress,
	setNewTxn,
	transactionType = ETransactionType.SEND_TOKEN,
	setTransactionType // eslint-disable-next-line sonarjs/cognitive-complexity
}: ISendFundsFormProps) => {
	const { getCache, setCache } = useCache();
	const { activeMultisig, address, loggedInWallet } = useGlobalUserDetailsContext();
	const { apis } = useGlobalApiContext();
	const [note, setNote] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState(new BN(0));
	const { activeOrg } = useActiveOrgContext();
	const { transactionFields } = activeOrg;

	const [isProxy, setIsProxy] = useState<boolean>(false);
	const [selectedProxyName, setSelectedProxyName] = useState<string>('');

	const [multisig, setMultisig] = useState<IMultisigAddress>(
		activeOrg?.multisigs?.find(
			(item) => item.address === activeMultisig || checkMultisigWithProxy(item.proxy, activeMultisig)
		)
	);
	const [network, setNetwork] = useState<string>(activeOrg?.multisigs?.[0]?.network || networks.POLKADOT);
	const [recipientAndAmount, setRecipientAndAmount] = useState<IRecipientAndAmount[]>([
		{
			amount: new BN(0),
			recipient: defaultSelectedAddress ? getEncodedAddress(defaultSelectedAddress, network) || '' : address || ''
		}
	]);
	const [callData, setCallData] = useState<string>('');
	const [transferKeepAlive, setTransferKeepAlive] = useState<boolean>(true);
	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>([]);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);

	const [validRecipient, setValidRecipient] = useState<boolean[]>([true]);
	const [form] = Form.useForm();

	const [multisigBalance, setMultisigBalance] = useState<string>('');

	const [loadingMessages, setLoadingMessages] = useState<string>('');

	const [transactionData, setTransactionData] = useState<any>({});

	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));

	const [totalGas, setTotalGas] = useState<BN>(new BN(0));

	const [initiatorBalance, setInitiatorBalance] = useState<BN>(new BN(0));

	const [tip, setTip] = useState<BN>(new BN(0));

	const [fetchBalancesLoading, setFetchBalancesLoading] = useState<boolean>(false);

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<{
		category: string;
		subfields: { [subfield: string]: { name: string; value: string } };
	}>({ category: 'none', subfields: {} });

	const [category, setCategory] = useState<string>('none');

	const [subfieldAttachments, setSubfieldAttachments] = useState<ISubfieldAndAttachment>({});

	const [callHash, setCallHash] = useState<string>('');

	const [txnParams, setTxnParams] = useState<{ method: string; section: string }>({} as any);

	const [showDecodedCallData, setShowDecodedCallData] = useState<boolean>(false);

	const [selectedMultisig, setSelectedMultisig] = useState<string>(
		activeMultisig || activeOrg?.multisigs?.[0]?.address || ''
	);

	const multisigOptionsWithProxy: IMultisigAddress[] = [];

	activeOrg?.multisigs?.forEach((item) => {
		if (item.proxy) {
			if (typeof item.proxy === 'string') {
				multisigOptionsWithProxy.push({ ...item, proxy: item.proxy });
			} else {
				item.proxy.map((mp) =>
					multisigOptionsWithProxy.push({ ...item, name: mp.name || item.name, proxy: mp.address })
				);
			}
		}
	});

	console.log(multisigOptionsWithProxy);

	const multisigOptions: ItemType[] = multisigOptionsWithProxy?.map((item) => ({
		key: JSON.stringify({ ...item, isProxy: true }),
		label: (
			<AddressComponent
				isMultisig
				isProxy
				name={item.name}
				showNetworkBadge
				network={item.network}
				withBadge={false}
				address={item.proxy as string}
			/>
		)
	}));

	activeOrg?.multisigs?.forEach((item) => {
		multisigOptions.push({
			key: JSON.stringify({ ...item, isProxy: false }),
			label: (
				<AddressComponent
					isMultisig
					showNetworkBadge
					network={item.network}
					withBadge={false}
					address={item.address}
				/>
			)
		});
	});

	const transactionTypes: ItemType[] = Object.values(ETransactionType)
		.filter(
			(item) =>
				!(
					(['alephzero', 'astar', 'assethub-polkadot', 'assethub-kusama'].includes(network) &&
						item === ETransactionType.SUBMIT_PREIMAGE) ||
					(!['polkadot', 'kusama'].includes(network) && item === ETransactionType.SUBMIT_PROPOSAL)
				)
		)
		.map((item) => ({
			key: item,
			label: <span className='text-white text-sm flex items-center gap-x-2'>{item}</span>
		}));

	const onRecipientChange = (value: string, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.recipient = value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onAmountChange = (a: BN, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.amount = a;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddRecipient = () => {
		setRecipientAndAmount((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ amount: new BN(0), recipient: '' });
			return copyOptionsArray;
		});
	};

	const onRemoveRecipient = (i: number) => {
		const copyOptionsArray = [...recipientAndAmount];
		copyOptionsArray.splice(i, 1);
		setRecipientAndAmount(copyOptionsArray);
	};

	useEffect(() => {
		if (!activeOrg || !activeOrg.multisigs) return;
		const m = activeOrg?.multisigs?.find(
			(item) => item.address === selectedMultisig || checkMultisigWithProxy(item.proxy, selectedMultisig)
		);
		console.log('m', m);
		setMultisig(m || activeOrg.multisigs[0]);
		setNetwork(m?.network || activeOrg.multisigs[0].network);
	}, [activeOrg, selectedMultisig]);

	useEffect(() => {
		if (
			!apis ||
			!apis[network] ||
			!apis[network].apiReady ||
			transactionType === ETransactionType.SEND_TOKEN ||
			!callData
		)
			return;

		const { data, error } = decodeCallData(callData, apis[network].api);
		if (error || !data) return;

		setCallHash(data.decoded?.method.hash.toHex() || '');

		const callDataFunc = data.extrinsicFn;
		setTxnParams({ method: `${callDataFunc?.method}`, section: `${callDataFunc?.section}` });
	}, [apis, callData, network, transactionType]);

	// Set address options for recipient
	useEffect(() => {
		if (!activeOrg || !activeOrg.addressBook || activeOrg.addressBook.length === 0) return;
		const allAddresses: string[] = [];
		activeOrg.addressBook.forEach((item) => {
			if (!allAddresses.includes(getEncodedAddress(item.address, network) || item.address)) {
				allAddresses.push(item.address);
			}
		});
		setAutoCompleteAddresses(
			allAddresses.map((a) => ({
				label: (
					<AddressComponent
						network={network}
						address={a}
					/>
				),
				value: a
			}))
		);
	}, [activeOrg, address, network]);

	useEffect(() => {
		setTransactionFieldsObject({ category, subfields: {} });
	}, [category]);

	useEffect(() => {
		if (!recipientAndAmount) return;

		recipientAndAmount.forEach((item, i) => {
			if (
				item.recipient &&
				(!getSubstrateAddress(item.recipient) ||
					recipientAndAmount.indexOf(
						recipientAndAmount.find(
							(a) => getSubstrateAddress(item.recipient) === getSubstrateAddress(a.recipient)
						) as IRecipientAndAmount
					) !== i)
			) {
				setValidRecipient((prev) => {
					const copyArray = [...prev];
					copyArray[i] = false;
					return copyArray;
				});
			} else {
				setValidRecipient((prev) => {
					const copyArray = [...prev];
					copyArray[i] = true;
					return copyArray;
				});
			}
		});
	}, [recipientAndAmount]);

	useEffect(() => {
		if (
			!apis ||
			!apis[network] ||
			!apis[network].apiReady ||
			transactionType !== ETransactionType.SEND_TOKEN ||
			!recipientAndAmount ||
			recipientAndAmount.some((item) => item.recipient === '' || item.amount.isZero())
		)
			return;

		const batch = apis[network].api.tx.utility.batch(
			recipientAndAmount.map((item) =>
				transferKeepAlive
					? apis[network].api.tx.balances.transferKeepAlive(item.recipient, item.amount.toString())
					: apis[network].api.tx.balances.transfer(item.recipient, item.amount.toString())
			)
		);
		let tx: SubmittableExtrinsic<'promise'>;
		if (isProxy && multisig?.proxy) {
			tx = apis[network].api.tx.proxy.proxy(selectedMultisig, null, batch);
			setCallData(tx.method.toHex());
		} else {
			setCallData(batch.method.toHex());
		}
	}, [
		amount,
		apis,
		isProxy,
		multisig,
		network,
		recipientAndAmount,
		selectedMultisig,
		transactionType,
		transferKeepAlive
	]);

	useEffect(() => {
		const fetchBalanceInfos = async () => {
			if (!apis || !apis[network] || !apis[network].apiReady || !address || !recipientAndAmount[0].recipient) {
				return;
			}

			setFetchBalancesLoading(true);
			// deposit balance
			const depositBase = apis[network].api.consts.multisig.depositBase.toString();
			const depositFactor = apis[network].api.consts.multisig.depositFactor.toString();

			console.log({ api: apis[network].apiReady, network }, { depositBase, depositFactor });

			setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));

			// gas fee
			if (!['westend', 'rococo', 'kusama', 'avail-testnet'].includes(network)) {
				const txn = transferKeepAlive
					? apis[network].api.tx.balances.transferKeepAlive(recipientAndAmount[0].recipient, amount)
					: apis[network].api.tx.balances.transfer(recipientAndAmount[0].recipient, amount);
				const gasInfo = await txn.paymentInfo(address);
				setTotalGas(new BN(gasInfo.partialFee.toString()));
			} else {
				setTotalGas(new BN(0));
			}

			// initiator balance
			const initiatorAccountBalance = await apis[network].api.query.system.account(address);
			setInitiatorBalance(new BN(initiatorAccountBalance.data.free.toString()));
			setFetchBalancesLoading(false);
		};
		fetchBalanceInfos();
	}, [address, amount, apis, network, recipientAndAmount, transferKeepAlive]);

	// calculate total amount
	useEffect(() => {
		const total = recipientAndAmount.reduce((sum, item) => sum.add(item.amount), new BN(0));
		setAmount(total);
	}, [recipientAndAmount]);

	const addToQueue = ({
		approvals,
		txHash,
		txData,
		totalAmount,
		multisigNetwork,
		multisigAddress,
		txFields,
		multisigThreshold
	}: {
		totalAmount: string;
		txHash: string;
		txData: string;
		multisigAddress: string;
		multisigNetwork: string;
		txFields: ITxnCategory;
		multisigThreshold: number;
		approvals: string[];
	}) => {
		if (!txHash || !txData || !activeOrg?.id) return;
		const prevQueue = getCache(`all-queue-txns-${activeOrg?.id}`);
		console.log('old queue', prevQueue);
		const newQueueItem: IQueueItem = {
			approvals,
			callData: txData,
			callHash: txHash,
			created_at: new Date(),
			multisigAddress,
			network: multisigNetwork,
			status: 'Approval',
			threshold: multisigThreshold,
			totalAmount,
			transactionFields: txFields
		};
		const newQueue: IQueueItem[] = [newQueueItem, ...prevQueue];
		setCache(`all-queue-txns-${activeOrg?.id}`, newQueue, 1800);
	};

	const handleSubmit = async () => {
		if (!apis || !apis[network] || !apis[network].apiReady || !address) {
			return;
		}

		await setSigner(apis[network].api, loggedInWallet, network);

		if (!multisig) return;

		setLoading(true);
		try {
			let queueItemData: IMultiTransferResponse = {} as any;
			if (transactionType === ETransactionType.SEND_TOKEN) {
				if (recipientAndAmount.some((item) => item.recipient === '' || item.amount.isZero()) || !amount) {
					queueNotification({
						header: 'Error!',
						message: 'Invalid Input.',
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}
				queueItemData = await initMultisigTransfer({
					addToQueue,
					api: apis[network].api,
					attachments: subfieldAttachments,
					initiatorAddress: address,
					isProxy,
					multisig,
					network,
					note,
					recipientAndAmount,
					selectedProxy: selectedMultisig,
					setLoadingMessages,
					tip,
					transactionFields: transactionFieldsObject,
					transferKeepAlive
				});
			} else {
				queueItemData = await customCallDataTransaction({
					api: apis[network].api,
					attachments: subfieldAttachments,
					callDataString: callData,
					initiatorAddress: address,
					isProxy,
					multisig,
					network,
					note,
					selectedProxy: selectedMultisig,
					setLoadingMessages,
					tip,
					transactionFields: transactionFieldsObject
				});
			}
			setTransactionData(queueItemData);
			setLoading(false);
			setSuccess(true);
		} catch (error) {
			console.log(error);
			setTransactionData(error);
			setLoading(false);
			setFailure(true);
		}
	};

	return success ? (
		<TransactionSuccessScreen
			network={network}
			successMessage='Transaction in Progress!'
			waitMessage='All Threshold Signatories need to Approve the Transaction.'
			amount={amount}
			txnParams={transactionType !== ETransactionType.SEND_TOKEN ? txnParams : undefined}
			txnHash={transactionData?.callHash}
			created_at={new Date()}
			sender={address}
			recipients={
				transactionType === ETransactionType.SEND_TOKEN ? recipientAndAmount.map((item) => item.recipient) : []
			}
			onDone={() => {
				setNewTxn?.((prev) => !prev);
				onCancel?.();
			}}
		/>
	) : failure ? (
		<TransactionFailedScreen
			onDone={() => {
				setNewTxn?.((prev) => !prev);
				onCancel?.();
			}}
			txnHash={transactionData?.callHash || ''}
			sender={address}
			failedMessage='Oh no! Something went wrong.'
			waitMessage='Your transaction has failed due to some technical error. Please try again...Details of the transaction are included below'
			created_at={new Date()}
		/>
	) : (
		<Spin
			wrapperClassName={className}
			spinning={loading}
			indicator={<LoadingLottie message={loadingMessages} />}
		>
			{
				<>
					{initiatorBalance.lte(totalDeposit.add(totalGas)) && !fetchBalancesLoading && apis?.[network]?.apiReady ? (
						<section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
							<WarningCircleIcon />
							<p>
								The Free Balance in your logged in account is less than the Minimum Deposit(
								{formatBnBalance(totalDeposit.add(totalGas), { numberAfterComma: 3, withUnit: true }, network)})
								required to create a Transaction.
							</p>
						</section>
					) : (
						<Skeleton
							className={`${!fetchBalancesLoading && 'opacity-0'}`}
							active
							paragraph={{ rows: 0 }}
						/>
					)}
					{transactionType !== ETransactionType.CALL_DATA &&
						amount.gt(
							new BN(multisigBalance).sub(
								inputToBn(`${chainProperties[network]?.existentialDeposit}`, network, false)[0]
							)
						) && (
							<section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
								<WarningCircleIcon />
								<p>
									The Multisig Balance will Drop below its Existential Deposit and it won&apos;t be onchain anymore, you
									may also lose your assets in it.
								</p>
							</section>
						)}
					<Form
						className={classNames('max-h-[68vh] overflow-y-auto px-2')}
						form={form}
						// eslint-disable-next-line no-template-curly-in-string
						validateMessages={{ required: "Please add the '${name}'" }}
					>
						{setTransactionType && (
							<section className='flex justify-end w-full'>
								<Dropdown
									trigger={['click']}
									className={`border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer ${className}`}
									menu={{
										items: transactionTypes,
										onClick: (e) => {
											setCallData('');
											setTransactionType?.(e.key as ETransactionType);
										}
									}}
								>
									<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
										<span className='flex items-center gap-x-2 text-sm'>{transactionType}</span>
										<CircleArrowDownIcon className='text-primary' />
									</div>
								</Dropdown>
							</section>
						)}
						<section>
							<div className='flex items-center gap-x-[10px] mt-[14px] max-sm:flex-col'>
								<article className='w-[500px] max-sm:w-full'>
									<p className='text-primary font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'>
										Sending from
										<Balance
											api={apis?.[network]?.api}
											apiReady={apis?.[network]?.apiReady || false}
											network={network}
											onChange={setMultisigBalance}
											address={selectedMultisig}
										/>
									</p>
									<Dropdown
										trigger={['click']}
										className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'
										menu={{
											items: multisigOptions,
											onClick: (e) => {
												const data = JSON.parse(e.key);
												setSelectedMultisig(data?.isProxy ? data?.proxy : data?.address);
												setNetwork(data?.network);
												setIsProxy(data?.isProxy);
												setSelectedProxyName(data.name);
											}
										}}
									>
										<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
											<AddressComponent
												isMultisig
												isProxy={isProxy}
												name={selectedProxyName}
												showNetworkBadge
												network={network}
												withBadge={false}
												address={selectedMultisig}
											/>
											<CircleArrowDownIcon className='text-primary' />
										</div>
									</Dropdown>
								</article>
								<article className='w-[412px] flex items-center max-sm:w-full'>
									<span className='-mr-1.5 z-0 max-sm:hidden max-sm:mt-1'>
										<LineIcon className='text-5xl' />
									</span>
									<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px] max-sm:w-full'>
										The transferred balance will be subtracted (along with fees) from the sender account.
									</p>
								</article>
							</div>
							<div className='w-[500px] max-sm:w-full'>
								<Divider className='border-[#505050]'>
									<SquareDownArrowIcon />
								</Divider>
							</div>
						</section>
						{transactionType === ETransactionType.CALL_DATA ? (
							<section className={`${className}`}>
								<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Call Data</label>
								<div className='flex items-center gap-x-[10px]'>
									<article className='w-full'>
										<Form.Item
											className='border-0 outline-0 my-0 p-0'
											name='call-data'
											rules={[{ required: true }]}
											validateStatus={!callData || !callHash ? 'error' : 'success'}
											help={(!callData || !callHash) && 'Please enter Valid Call Data'}
										>
											<Input
												id='call-data'
												onChange={(e) => setCallData(e.target.value)}
												placeholder='Enter Call Data'
												value={callData}
												className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
											/>
										</Form.Item>
									</article>
								</div>
							</section>
						) : transactionType === ETransactionType.MANUAL_EXTRINSIC ? (
							<ManualExtrinsics
								apiReady={apis?.[network]?.apiReady || false}
								api={apis?.[network]?.api}
								network={network}
								setCallData={setCallData}
							/>
						) : transactionType === ETransactionType.SUBMIT_PREIMAGE ? (
							<SubmitPreimage
								apiReady={apis?.[network]?.apiReady || false}
								network={network}
								api={apis?.[network]?.api}
								setCallData={setCallData}
								className={className}
							/>
						) : transactionType === ETransactionType.SUBMIT_PROPOSAL ? (
							<SubmitProposal
								apiReady={apis?.[network]?.apiReady || false}
								network={network}
								api={apis?.[network]?.api}
								className={className}
								setCallData={setCallData}
							/>
						) : transactionType === ETransactionType.SET_IDENTITY ? (
							<SetIdentity
								multisigAddress={multisig?.address || activeMultisig}
								api={apis?.[network]?.api}
								apiReady={apis?.[network]?.apiReady || false}
								className={className}
								setCallData={setCallData}
							/>
						) : transactionType === ETransactionType.DELEGATE ? (
							<Delegate
								api={apis?.[network]?.api}
								apiReady={apis?.[network]?.apiReady || false}
								className={className}
								setCallData={setCallData}
								autocompleteAddresses={autocompleteAddresses}
							/>
						) : (
							<section className=''>
								<div className='flex items-start gap-x-[10px]'>
									<div>
										<div className='flex flex-col gap-y-3 mb-2'>
											{recipientAndAmount.map(({ recipient }, i) => (
												<article
													key={recipient}
													className='w-[500px] flex items-start gap-x-2 max-sm:w-full max-sm:flex-col'
												>
													<AddAddressModal
														setShowAddressModal={setShowAddressModal}
														setAutoCompleteAddresses={setAutoCompleteAddresses}
														showAddressModal={showAddressModal}
														defaultAddress={recipient}
													/>
													<div className='w-[55%] max-sm:w-full'>
														<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
															Recipient*
														</label>
														<Form.Item
															name='recipient'
															rules={[{ required: true }]}
															help={
																(!recipient && 'Recipient Address is Required') ||
																(!validRecipient[i] && 'Please add a valid Address')
															}
															className='border-0 outline-0 my-0 p-0'
															validateStatus={recipient && validRecipient[i] ? 'success' : 'error'}
														>
															<div className='h-[50px]'>
																{recipient &&
																autocompleteAddresses.some(
																	(item) =>
																		item.value &&
																		getSubstrateAddress(String(item.value)) === getSubstrateAddress(recipient)
																) ? (
																	<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
																		{
																			autocompleteAddresses.find(
																				(item) =>
																					item.value &&
																					getSubstrateAddress(String(item.value)) === getSubstrateAddress(recipient)
																			)?.label
																		}
																		<button
																			className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
																			onClick={() => {
																				onRecipientChange('', i);
																			}}
																		>
																			<OutlineCloseIcon className='text-primary w-2 h-2' />
																		</button>
																	</div>
																) : (
																	<AutoComplete
																		autoFocus
																		defaultOpen
																		className='[&>div>span>input]:px-[12px]'
																		filterOption={(inputValue, options) => {
																			return inputValue && options?.value
																				? getSubstrateAddress(String(options?.value) || '') ===
																						getSubstrateAddress(inputValue)
																				: true;
																		}}
																		notFoundContent={
																			validRecipient[i] && (
																				<Button
																					icon={<PlusCircleOutlined className='text-primary' />}
																					className='bg-transparent border-none outline-none text-primary text-sm flex items-center'
																					onClick={() => setShowAddressModal(true)}
																				>
																					Add Address to Address Book
																				</Button>
																			)
																		}
																		options={autocompleteAddresses.filter(
																			(item) =>
																				!recipientAndAmount.some(
																					(r) =>
																						r.recipient &&
																						item.value &&
																						getSubstrateAddress(r.recipient) ===
																							getSubstrateAddress(String(item.value) || '')
																				)
																		)}
																		id='recipient'
																		placeholder='Send to Address..'
																		onChange={(value) => onRecipientChange(value, i)}
																		value={recipientAndAmount[i].recipient}
																		defaultValue={defaultSelectedAddress || ''}
																	/>
																)}
															</div>
														</Form.Item>
													</div>
													<div className='flex items-center gap-x-2 w-[45%]'>
														<BalanceInput
															network={network}
															multipleCurrency
															label='Amount*'
															fromBalance={multisigBalance}
															onChange={(balance) => onAmountChange(balance, i)}
														/>
														{i !== 0 && (
															<Button
																onClick={() => onRemoveRecipient(i)}
																className='text-failure border-none outline-none bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
															>
																<DeleteIcon />
															</Button>
														)}
													</div>
												</article>
											))}
										</div>
										<Button
											icon={<PlusCircleOutlined className='text-primary' />}
											className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'
											onClick={onAddRecipient}
										>
											Add Another Recipient
										</Button>
									</div>
									<div className='flex flex-col gap-y-4 max-sm:hidden'>
										<article className='w-[412px] flex items-center'>
											<span className='-mr-1.5 z-0'>
												<LineIcon className='text-5xl' />
											</span>
											<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
												The beneficiary will have access to the transferred fees when the transaction is included in a
												block.
											</p>
										</article>
										<article className='w-[412px] flex items-center'>
											<span className='-mr-1.5 z-0'>
												<LineIcon className='text-5xl' />
											</span>
											<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px] -mb-5'>
												If the recipient account is new, the balance needs to be more than the existential deposit.
												Likewise if the sending account balance drops below the same value, the account will be removed
												from the state.
											</p>
										</article>
									</div>
								</div>
							</section>
						)}

						{callData && (
							<section className='mt-[15px]'>
								{transactionType !== ETransactionType.CALL_DATA && (
									<>
										<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Call Data</label>
										<div className='flex items-center gap-x-[10px]'>
											<article className='w-[500px]'>
												{
													// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
													<div
														className='text-sm cursor-pointer w-full font-normal flex items-center justify-between leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white'
														onClick={() => copyText(callData)}
													>
														{shortenAddress(callData, 10)}
														<button className='text-primary'>
															<CopyIcon />
														</button>
													</div>
												}
											</article>
										</div>
									</>
								)}
								{
									// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
									<p
										onClick={() => setShowDecodedCallData((prev) => !prev)}
										className='text-primary cursor-pointer font-medium text-sm leading-[15px] mt-3 mb-6 flex items-center gap-x-3'
									>
										<span>{showDecodedCallData ? 'Hide' : 'Advanced'} Details</span>
										<ArrowRightIcon />
									</p>
								}
								{showDecodedCallData && (
									<article className='w-[900px]'>
										<Divider
											className='border-bg-secondary text-text_secondary my-5'
											orientation='left'
										>
											Decoded Call
										</Divider>
										<ArgumentsTable
											api={apis?.[network]?.api}
											apiReady={apis?.[network]?.apiReady || false}
											network={network}
											className='w-[500px]'
											callData={callData}
										/>
									</article>
								)}
							</section>
						)}

						<section className='mt-[15px]'>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
								Existential Deposit
							</label>
							<div className='flex items-center gap-x-[10px]'>
								<article className='w-[500px]'>
									<Form.Item
										name='existential_deposit'
										rules={[]}
										className='border-0 outline-0 my-0 p-0'
									>
										<div className='flex items-center h-[40px]'>
											<Input
												disabled
												type='number'
												placeholder={String(chainProperties[network]?.existentialDeposit)}
												className='text-sm font-normal leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24'
												id='existential_deposit'
											/>
											<div className='absolute right-0 text-white px-3 flex gap-x-1 items-center justify-center'>
												<ParachainIcon src={chainProperties[network]?.logo} />
												<span>{chainProperties[network]?.tokenSymbol}</span>
											</div>
										</div>
									</Form.Item>
								</article>
							</div>
						</section>

						<section className='mt-[15px]'>
							<div className='flex items-center gap-x-[10px]'>
								<div className='w-[500px]'>
									<BalanceInput
										network={network}
										placeholder='1'
										label='Tip'
										fromBalance={initiatorBalance}
										onChange={(balance) => setTip(balance)}
									/>
								</div>
								<article className='w-[412px] flex items-center'>
									<span className='-mr-1.5 z-0'>
										<LineIcon className='text-5xl' />
									</span>
									<p className='p-3 w-full bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
										Speed up transactions by including a Tip.
									</p>
								</article>
							</div>
						</section>

						<section className='mt-[15px] w-[500px] max-sm:w-full'>
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
												) : subfieldObject.subfieldType === EFieldType.ATTACHMENT ? (
													<UploadAttachment
														setSubfieldAttachments={setSubfieldAttachments}
														subfield={subfield}
													/>
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
								<article className='w-[500px] max-sm:w-full'>
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

						<section className='mt-[30px]'>
							<div className='flex items-center gap-x-[10px] max-sm:flex-col'>
								<article className='w-[500px] flex items-center gap-x-3 max-sm:w-full'>
									<p className='text-white text-sm font-normal leading-[15px]'>
										Transfer with account keep-alive checks
									</p>
									<Switch
										checked={transferKeepAlive}
										onChange={(checked) => setTransferKeepAlive(checked)}
										size='small'
										className='text-primary'
									/>
								</article>
								<article className='w-[412px] flex items-center max-sm:w-full'>
									<span className='-mr-1.5 z-0'>
										<LineIcon className='text-5xl' />
									</span>
									<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
										With the keep-alive option set, the account is protected against removal due to low balances.
									</p>
								</article>
							</div>
						</section>

						{/* <section className='mt-4 max-w-[500px] text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[13px] flex items-center gap-x-[11px]'>
						<span>
							<WarningCircleIcon className='text-base' />
						</span>
						<p className=''>
							The transaction, after application of the transfer fees, will drop the available balance below the existential deposit. As such the transfer will fail. The account needs more free funds to cover the transaction fees.
						</p>
					</section> */}
					</Form>
					<section className='flex items-center gap-x-5 justify-center mt-10'>
						{onCancel && (
							<CancelBtn
								className='w-[250px]'
								onClick={onCancel}
							/>
						)}
						<ModalBtn
							disabled={
								(transactionType === ETransactionType.SEND_TOKEN &&
									(recipientAndAmount.some(
										(item) => item.recipient === '' || item.amount.isZero() || item.amount.gte(new BN(multisigBalance))
									) ||
										(transferKeepAlive &&
											amount.gt(
												new BN(multisigBalance).sub(
													inputToBn(`${chainProperties[network]?.existentialDeposit}`, network, false)[0]
												)
											)) ||
										amount.gt(new BN(multisigBalance)) ||
										validRecipient.includes(false) ||
										initiatorBalance.lt(totalDeposit.add(totalGas)))) ||
								((transactionType === ETransactionType.CALL_DATA ||
									transactionType === ETransactionType.MANUAL_EXTRINSIC ||
									transactionType === ETransactionType.SUBMIT_PREIMAGE ||
									transactionType === ETransactionType.SUBMIT_PROPOSAL ||
									transactionType === ETransactionType.DELEGATE) &&
									(!callData || !callHash)) ||
								Object.keys(transactionFields[category].subfields).some((key) =>
									transactionFields[category].subfields[key].subfieldType === EFieldType.ATTACHMENT
										? transactionFields[category].subfields[key].required && !subfieldAttachments[key]?.file
										: !transactionFieldsObject.subfields[key]?.value &&
										  transactionFields[category].subfields[key].required
								)
							}
							loading={loading}
							onClick={handleSubmit}
							className='w-[250px]'
							title='Make Transaction'
						/>
					</section>
				</>
			}
		</Spin>
	);
};

export default SendFundsForm;
