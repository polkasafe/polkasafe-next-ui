// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import './style.css';
import TenderlyIcon from '@next-common/assets/icons/tenderly-icon.png';
import { PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Divider, Dropdown, Form, Input, Spin, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import classNames from 'classnames';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import ModalBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { EFieldType, IAsset, INFTAsset, NotificationStatus } from '@next-common/types';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import Balance from '@next-evm/ui-components/Balance';
import BalanceInput from '@next-evm/ui-components/BalanceInput';
import {
	CheckOutlined,
	CircleArrowDownIcon,
	DeleteIcon,
	ExternalLinkIcon,
	LineIcon,
	OutlineCloseIcon,
	SquareDownArrowIcon
} from '@next-common/ui-components/CustomIcons';
import queueNotification from '@next-common/ui-components/QueueNotification';
import addNewTransaction from '@next-evm/utils/addNewTransaction';
import getOtherSignatories from '@next-evm/utils/getOtherSignatories';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';
import notify from '@next-evm/utils/notify';

import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import Image from 'next/image';
import { getSimulationLink, setSimulationSharing } from '@next-evm/utils/simulation';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import returnTxUrl from '@next-common/global/gnosisService';
import { EthersAdapter } from '@safe-global/protocol-kit';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { useWallets } from '@privy-io/react-auth';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { Framework } from '@superfluid-finance/sdk-core';
import TransactionFailedScreen from './TransactionFailedScreen';
import TransactionSuccessScreen from './TransactionSuccessScreen';
import AddAddressModal from './AddAddressModal';
import TxnSimulationFailedModal from './TxnSimulationFailedModal';
import TransactionBuilder from './TransactionBuilder';
import SendNFT from './SendNFT';

export interface IRecipientAndAmount {
	recipient: string;
	amount: string;
	token: IAsset;
}

export enum ETransactionTypeEVM {
	SEND_TOKEN = 'Send Token',
	SEND_NFT = 'Send NFT',
	STREAM_PAYMENTS = 'Stream Payments',
	TRANSACTION_BUILDER = 'Transaction Builder'
}

export enum EFlowRates {
	SECOND = '1',
	MINUTE = '60',
	HOUR = '3600',
	DAY = '86400',
	WEEK = '604800',
	MONTH = '2628000',
	YEAR = '31536000'
}

interface ISendFundsFormProps {
	onCancel?: () => void;
	className?: string;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>;
	defaultSelectedAddress?: string;
	defaultToken?: IAsset;
	defaultTxNonce?: number;
	transactionType?: ETransactionTypeEVM;
	setTransactionType?: React.Dispatch<React.SetStateAction<ETransactionTypeEVM>>;
	updateStreamAmount?: string;
	updateStream?: boolean;
	defaultNFT?: INFTAsset;
}

const SendFundsForm = ({
	className,
	onCancel,
	defaultSelectedAddress,
	setNewTxn,
	defaultTxNonce,
	transactionType = ETransactionTypeEVM.SEND_TOKEN,
	setTransactionType,
	updateStreamAmount,
	updateStream,
	defaultNFT,
	defaultToken // eslint-disable-next-line sonarjs/cognitive-complexity
}: ISendFundsFormProps) => {
	const { activeMultisig, address, multisigAddresses, activeMultisigData } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { transactionFields } = activeOrg;
	const [network, setNetwork] = useState<NETWORK>(
		(activeMultisigData?.network as NETWORK) || (activeOrg?.multisigs?.[0]?.network as NETWORK) || NETWORK.POLYGON
	);
	const { allAssets, allNfts } = useMultisigAssetsContext();
	const { wallets } = useWallets();

	const [selectedMultisig, setSelectedMultisig] = useState<string>(
		activeMultisig || activeOrg?.multisigs?.[0]?.address || ''
	);

	const [note, setNote] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('0');
	const [recipientAndAmount, setRecipientAndAmount] = useState<IRecipientAndAmount[]>([
		{
			amount: '0',
			recipient: defaultSelectedAddress ? defaultSelectedAddress || '' : address || '',
			token: defaultToken || allAssets[selectedMultisig]?.assets?.[0]
		}
	]);
	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>([]);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);

	const [validRecipient, setValidRecipient] = useState<boolean[]>([true]);

	const [form] = Form.useForm();

	const [loadingMessages] = useState<string>('');

	const [transactionData] = useState<any>({});

	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

	const [category, setCategory] = useState<string>('none');

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<{
		category: string;
		subfields: { [subfield: string]: { name: string; value: string } };
	}>({ category: 'none', subfields: {} });

	const [simulationLoading, setSimulationLoading] = useState<boolean>(false);

	const [isSimulationSuccess, setIsSimulationSuccess] = useState<boolean>(false);
	const [isSimulationFailed, setIsSimulationFailed] = useState<boolean>(false);
	const [simulationFailedReason, setSimulationFailedReason] = useState<string>('');

	const [simulationId, setSimulationId] = useState<string>('');

	const [openSimulationFailedModal, setOpenSimulationFailedModal] = useState<boolean>(false);

	const [streamRecipient, setStreamRecipient] = useState<string>(
		defaultSelectedAddress ? defaultSelectedAddress || '' : address || ''
	);
	const [streamAmount, setStreamAmount] = useState<string>(updateStreamAmount || '');
	const [weiAmount, setWeiAmount] = useState<string>('');

	const [flowRate, setFlowRate] = useState<EFlowRates>(EFlowRates.MONTH);

	const [streamToken, setStreamToken] = useState<IAsset>(defaultToken);

	const transactionTypes: ItemType[] = Object.values(ETransactionTypeEVM)
		.filter((item) => {
			return !(item === ETransactionTypeEVM.STREAM_PAYMENTS && !chainProperties[network].nativeSuperTokenAddress);
		})
		.map((item) => ({
			key: item,
			label: <span className='text-white text-sm flex items-center gap-x-2'>{item}</span>
		}));

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

	const flowRates: ItemType[] = Object.keys(EFlowRates).map((item) => ({
		key: EFlowRates[item],
		label: <span className='text-white text-sm flex items-center gap-x-2'>/ {item.toLowerCase()}</span>
	}));

	// nft txns vars

	const [selectedNFT, setSelectedNFT] = useState<INFTAsset>(defaultNFT);
	const [nftRecipient, setNftRecipient] = useState<string>(address || '');

	// transaction Builder vars
	const [txnBuilderData, setTxnBuilderData] = useState<string>('');
	const [txnBuilderToAddress, setTxnBuilderToAddress] = useState<string>('');

	useEffect(() => {
		if (allNfts && allNfts[selectedMultisig]) {
			setSelectedNFT(allNfts[selectedMultisig][0]);
		}
	}, [allNfts, selectedMultisig]);

	useEffect(() => {
		if (allAssets && allAssets[selectedMultisig]?.assets) {
			setStreamToken(allAssets[selectedMultisig]?.assets?.[0]);
			setRecipientAndAmount([
				{
					amount: '0',
					recipient: defaultSelectedAddress ? defaultSelectedAddress || '' : address || '',
					token: defaultToken || allAssets[selectedMultisig]?.assets?.[0]
				}
			]);
		}
	}, [address, allAssets, defaultSelectedAddress, defaultToken, selectedMultisig]);

	useEffect(() => {
		if (!streamAmount) return;

		const wei = ethers.utils.parseUnits(streamAmount, 'ether');
		const amountAsPerFlowrate = BigInt(wei.toString()) / BigInt(flowRate);
		setWeiAmount(amountAsPerFlowrate.toString());
	}, [flowRate, streamAmount]);

	const onRecipientChange = (value: string, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.recipient = value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onAmountChange = (a: string, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.amount = a;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onTokenChange = (t: IAsset, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.token = t;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddRecipient = () => {
		setRecipientAndAmount((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ amount: '0', recipient: '', token: defaultToken || streamToken });
			return copyOptionsArray;
		});
	};

	const onRemoveRecipient = (i: number) => {
		const copyOptionsArray = [...recipientAndAmount];
		copyOptionsArray.splice(i, 1);
		setRecipientAndAmount(copyOptionsArray);
	};

	// Set address options for recipient
	useEffect(() => {
		if (!activeOrg) return;
		const { addressBook } = activeOrg;

		const allAddresses: string[] = [];
		addressBook?.forEach((item) => {
			if (!allAddresses.includes(item?.address)) {
				allAddresses.push(item?.address);
			}
		});
		setAutoCompleteAddresses(
			allAddresses.map((a) => ({
				label: (
					<AddressComponent
						network={network}
						withBadge={false}
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
		const total = recipientAndAmount.reduce(
			(sum, item) =>
				sum +
				Number(
					ethers.utils.parseUnits(
						Number.isNaN(Number(item.amount.trim())) ? '0' : item.amount.trim(),
						item.token?.token_decimals || 'ether'
					)
				),
			0
		);
		setAmount(total.toString());
	}, [recipientAndAmount]);

	useEffect(() => {
		setValidRecipient([]);
		if (transactionType === ETransactionTypeEVM.STREAM_PAYMENTS) {
			if (!isValidWeb3Address(streamRecipient)) {
				setValidRecipient([false]);
			} else {
				setValidRecipient([true]);
			}
		} else {
			if (!recipientAndAmount) return;

			recipientAndAmount.forEach((item, i) => {
				if (
					item.recipient &&
					(!isValidWeb3Address(item.recipient) ||
						recipientAndAmount.indexOf(
							recipientAndAmount.find((a) => item.recipient === a.recipient) as IRecipientAndAmount
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
		}

		setSimulationId('');
		setIsSimulationFailed(false);
		setIsSimulationSuccess(false);
	}, [recipientAndAmount, streamRecipient, transactionType]);

	const handleSimulate = async () => {
		const txUrl = returnTxUrl(network as NETWORK);
		const wallet = wallets?.[0];
		await wallet.switchChain(chainProperties[network].chainId);
		const provider = await wallet.getEthersProvider();
		const web3Adapter = new EthersAdapter({
			ethers,
			signerOrProvider: provider.getSigner(wallet.address)
		});
		const gnosisService = new GnosisSafeService(web3Adapter, web3Adapter.getSigner(), txUrl);
		const recipients = recipientAndAmount.map((r) => r.recipient);
		const amounts = recipientAndAmount.map((a) =>
			ethers.utils.parseUnits(a.amount, a.token?.token_decimals || 'ether').toString()
		);
		const selectedTokens = recipientAndAmount.map((r) => r.token);
		setSimulationLoading(true);
		const simulationData = await gnosisService.getTxSimulationData(
			selectedMultisig,
			recipients,
			amounts,
			wallet.address || address,
			selectedTokens,
			chainProperties[network].chainId
		);
		if (simulationData && simulationData?.simulation?.status) {
			await setSimulationSharing(simulationData?.simulation?.id);
			setIsSimulationSuccess(true);
			setSimulationId(simulationData?.simulation?.id);
		} else if (simulationData && !simulationData?.simulation?.status) {
			await setSimulationSharing(simulationData?.simulation?.id);
			setIsSimulationFailed(true);
			setSimulationFailedReason(simulationData?.simulation?.error_message || '');
			setSimulationId(simulationData?.simulation?.id);
		}
		setSimulationLoading(false);
	};

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const txUrl = returnTxUrl(network as NETWORK);
			const wallet = wallets?.[0];
			await wallet.switchChain(chainProperties[network].chainId);
			const provider = await wallet.getEthersProvider();
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: provider.getSigner(wallet.address)
			});
			const gnosisService = new GnosisSafeService(web3Adapter, web3Adapter.getSigner(), txUrl);
			let safeTxHash = '';

			const recipients = recipientAndAmount.map((r) => r.recipient);
			const amounts = recipientAndAmount.map((a) =>
				ethers.utils.parseUnits(a.amount, a.token?.token_decimals || 'ether').toString()
			);
			const selectedTokens = recipientAndAmount.map((r) => r.token);
			if (transactionType === ETransactionTypeEVM.STREAM_PAYMENTS) {
				const sfProvider = typeof window !== 'undefined' && new ethers.providers.Web3Provider(window.ethereum);
				await provider.send('eth_requestAccounts', []);

				const { chainId } = chainProperties[network];

				const superfluidFramework = await Framework.create({
					chainId: Number(chainId),
					provider: sfProvider
				});
				const superToken = await superfluidFramework.loadSuperToken(`${streamToken.name}x`);
				const tokenAddress = superToken.address;
				if (!tokenAddress) {
					setLoading(false);
					queueNotification({
						header: 'Failed!',
						message: 'Selected Token is not Supported',
						status: NotificationStatus.ERROR
					});
					return;
				}
				if (updateStream) {
					safeTxHash = await gnosisService.createUpdateStreamTx(
						selectedMultisig,
						streamRecipient,
						weiAmount,
						wallet.address || address,
						tokenAddress,
						note,
						defaultTxNonce,
						chainProperties[network].contractNetworks
					);
				} else {
					safeTxHash = await gnosisService.createStreamTx(
						selectedMultisig,
						streamRecipient,
						weiAmount,
						address,
						tokenAddress,
						note,
						defaultTxNonce,
						chainProperties[network].contractNetworks
					);
				}
			} else if (transactionType === ETransactionTypeEVM.TRANSACTION_BUILDER) {
				safeTxHash = await gnosisService.createTxnBuilderTx(
					selectedMultisig,
					txnBuilderToAddress,
					wallet.address || address,
					txnBuilderData,
					note,
					defaultTxNonce,
					chainProperties[network].contractNetworks
				);
			} else if (transactionType === ETransactionTypeEVM.SEND_NFT) {
				safeTxHash = await gnosisService.createNftTx(
					selectedMultisig,
					nftRecipient,
					wallet.address || address,
					selectedNFT.tokenId,
					selectedNFT.tokenAddress,
					note,
					defaultTxNonce,
					chainProperties[network].contractNetworks
				);
			} else {
				safeTxHash = await gnosisService.createSafeTx(
					selectedMultisig,
					recipients,
					amounts,
					wallet.address || address,
					note,
					selectedTokens,
					defaultTxNonce,
					chainProperties[network].contractNetworks
				);
			}

			if (safeTxHash) {
				addNewTransaction({
					address: wallet?.address || address,
					amount,
					callData: safeTxHash,
					callHash: safeTxHash,
					executed: false,
					network,
					note,
					safeAddress: selectedMultisig,
					to: transactionType === ETransactionTypeEVM.STREAM_PAYMENTS ? streamRecipient : recipients,
					transactionFields: transactionFieldsObject,
					type: 'sent'
				});
				queueNotification({
					header: 'Success',
					message: 'New Transaction Created.',
					status: NotificationStatus.SUCCESS
				});
				setSuccess(true);
				notify({
					args: {
						address,
						addresses: getOtherSignatories(address, activeMultisig, multisigAddresses),
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
				setFailure(true);
				setLoading(false);
			}
		} catch (err) {
			console.log(err);
			setNewTxn?.((prev) => !prev);
			onCancel?.();
			setFailure(true);
			setLoading(false);
			queueNotification({
				header: 'Error.',
				message: 'Please try again.',
				status: NotificationStatus.ERROR
			});
		}
	};

	return success ? (
		<TransactionSuccessScreen
			successMessage='Transaction in Progress!'
			waitMessage='All Threshold Signatories need to Approve the Transaction.'
			amount={amount}
			txnHash={transactionData?.callHash}
			created_at={transactionData?.created_at || new Date()}
			sender={address}
			recipients={recipientAndAmount.map((item) => item.recipient)}
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
			<ModalComponent
				open={openSimulationFailedModal}
				onCancel={() => setOpenSimulationFailedModal(false)}
				title='Simulation Failed'
			>
				<TxnSimulationFailedModal
					reason={simulationFailedReason}
					onCancel={() => setOpenSimulationFailedModal(false)}
					onProceed={() => {
						handleSubmit();
						setOpenSimulationFailedModal(false);
					}}
				/>
			</ModalComponent>
			<Form
				className={classNames('max-h-[68vh] overflow-y-auto px-2 pb-8')}
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
									setTransactionType?.(e.key as ETransactionTypeEVM);
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
					{transactionType === ETransactionTypeEVM.STREAM_PAYMENTS ? (
						<div className='flex flex-col gap-y-4 w-[500px]'>
							<AddAddressModal
								showAddressModal={showAddressModal}
								setShowAddressModal={setShowAddressModal}
								setAutoCompleteAddresses={setAutoCompleteAddresses}
								defaultAddress={streamRecipient}
							/>
							<div>
								<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient*</label>
								<Form.Item
									name='recipient'
									rules={[{ required: true }]}
									help={
										(!streamRecipient && 'Recipient Address is Required') ||
										(!validRecipient[0] && 'Please add a valid Address')
									}
									className='border-0 outline-0 my-0 p-0'
									validateStatus={streamRecipient && validRecipient[0] ? 'success' : 'error'}
								>
									<div className='h-[50px]'>
										{streamRecipient &&
										autocompleteAddresses.some((item) => item.value && String(item.value) === streamRecipient) ? (
											<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
												{
													autocompleteAddresses.find((item) => item.value && String(item.value) === streamRecipient)
														?.label
												}
												<button
													className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
													onClick={() => {
														setStreamRecipient('');
													}}
												>
													<OutlineCloseIcon className='text-primary w-2 h-2' />
												</button>
											</div>
										) : (
											<AutoComplete
												autoFocus
												filterOption={(inputValue, options) => {
													return inputValue && options?.value ? String(options?.value) === inputValue : true;
												}}
												notFoundContent={
													validRecipient[0] && (
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
															(r) => r.recipient && item.value && r.recipient === (String(item.value) || '')
														)
												)}
												id='recipient'
												placeholder='Send to Address..'
												onChange={(value) => setStreamRecipient(value)}
												value={streamRecipient}
												defaultValue={defaultSelectedAddress || ''}
											/>
										)}
									</div>
								</Form.Item>
							</div>
							<div className='flex items-start gap-x-2'>
								<div className='flex-1'>
									<BalanceInput
										multisigAddress={selectedMultisig}
										label='Flow Rate'
										defaultValue={updateStreamAmount}
										onChange={(balance) => setStreamAmount(balance)}
										token={streamToken}
										onTokenChange={(t) => setStreamToken(t)}
									/>
								</div>
								<div>
									<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px] py-2' />
									<Dropdown
										trigger={['click']}
										className={`border border-primary rounded-lg p-3 bg-bg-secondary cursor-pointer ${className}`}
										menu={{
											items: flowRates,
											onClick: (e) => {
												setFlowRate?.(e.key as EFlowRates);
											}
										}}
									>
										<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
											<span className='flex items-center gap-x-2 text-sm'>
												/{' '}
												{Object.keys(EFlowRates)
													.find((k) => EFlowRates[k] === flowRate)
													?.toString()
													?.toLowerCase()}
											</span>
											<CircleArrowDownIcon className='text-primary' />
										</div>
									</Dropdown>
								</div>
							</div>
						</div>
					) : transactionType === ETransactionTypeEVM.TRANSACTION_BUILDER ? (
						<TransactionBuilder
							setToAddress={setTxnBuilderToAddress}
							setTxnData={setTxnBuilderData}
						/>
					) : transactionType === ETransactionTypeEVM.SEND_NFT ? (
						<SendNFT
							multisigAddress={selectedMultisig}
							setNftRecipient={setNftRecipient}
							setSelectedNft={setSelectedNFT}
							selectedNft={selectedNFT}
						/>
					) : (
						<div className='flex items-start gap-x-[10px]'>
							<div>
								<div className='flex flex-col gap-y-3 mb-2'>
									{recipientAndAmount.map(({ recipient }, i) => (
										<article
											key={recipient}
											className='w-[500px] flex items-start gap-x-2'
										>
											<AddAddressModal
												showAddressModal={showAddressModal}
												setShowAddressModal={setShowAddressModal}
												setAutoCompleteAddresses={setAutoCompleteAddresses}
												defaultAddress={recipient}
											/>
											<div className='w-[55%]'>
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
														autocompleteAddresses.some((item) => item.value && String(item.value) === recipient) ? (
															<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
																{
																	autocompleteAddresses.find((item) => item.value && String(item.value) === recipient)
																		?.label
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
																filterOption={(inputValue, options) => {
																	return inputValue && options?.value ? String(options?.value) === inputValue : true;
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
																			(r) => r.recipient && item.value && r.recipient === (String(item.value) || '')
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
													multisigAddress={selectedMultisig}
													token={recipientAndAmount[i].token}
													onTokenChange={(t) => onTokenChange(t, i)}
													label='Amount*'
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
							<div className='flex flex-col gap-y-4'>
								<article className='w-[412px] flex items-center'>
									<span className='-mr-1.5 z-0'>
										<LineIcon className='text-5xl' />
									</span>
									<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
										The beneficiary will have access to the transferred fees when the transaction is included in a
										block.
									</p>
								</article>
							</div>
						</div>
					)}
				</section>

				{!recipientAndAmount.some(
					(item) =>
						item.recipient === '' ||
						item.amount === '0' ||
						Number.isNaN(Number(item.amount)) ||
						!item.amount ||
						Number(item.amount) === 0 ||
						Number(item.amount) > Number(item.token.balance_token)
				) &&
					network !== NETWORK.ZETA_CHAIN && (
						<section className='mt-[15px] flex items-center gap-x-[10px]'>
							<article className='w-[500px] border border-primary rounded-lg p-3 flex justify-between items-center'>
								<div className='flex flex-col gap-y-1'>
									<span className='text-sm text-white flex items-center gap-x-2'>
										Run a Simulation
										<Tooltip
											title={
												<div className='text-text_secondary text-xs'>
													<div>
														Before executing this transaction, it can undergo a simulation to ensure its success,
														generating a comprehensive report detailing the execution of the transaction.
													</div>
												</div>
											}
											placement='bottom'
										>
											<InfoCircleOutlined className='text-text_secondary' />
										</Tooltip>
									</span>
									<span className='text-xs text-text_secondary flex items-center gap-x-1'>
										Powered by{' '}
										<Image
											src={TenderlyIcon}
											alt='tenderly'
											width={65}
										/>
									</span>
								</div>
								{isSimulationSuccess ? (
									<span className='flex items-center gap-x-1 text-success'>
										<CheckOutlined /> Success
									</span>
								) : isSimulationFailed ? (
									<span className='flex items-center gap-x-1 text-failure'>
										<span className='flex items-center justify-center p-2 border border-failure rounded-full w-[14.33px] h-[14.33px]'>
											<OutlineCloseIcon className='w-[5px] h-[5px]' />
										</span>{' '}
										Failed
									</span>
								) : (
									<Button
										onClick={handleSimulate}
										title='Simulate'
										loading={simulationLoading}
										className='border-2 border-primary bg-highlight text-primary'
										size='small'
									>
										Simulate
									</Button>
								)}
							</article>
							{simulationId && (
								<article className='flex-1 flex items-center'>
									<span className='-mr-1.5 z-0'>
										<LineIcon className='text-5xl' />
									</span>
									<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px] flex-1'>
										<h2 className='text-base font-semibold mb-1 text-white'>
											Simulation {isSimulationSuccess ? 'Successful' : 'Failed'}
										</h2>
										{simulationFailedReason && (
											<p className='text-base mt-1 mb-2 text-white'>{simulationFailedReason}</p>
										)}
										<div className='flex gap-x-1'>
											You can check the full report{' '}
											<a
												className='text-primary font-semibold flex items-center gap-x-1'
												target='_blank'
												href={getSimulationLink(simulationId)}
												rel='noreferrer'
											>
												on Tenderly <ExternalLinkIcon />
											</a>
										</div>
									</p>
								</article>
							)}
						</section>
					)}

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
					disabled={
						(transactionType === ETransactionTypeEVM.SEND_TOKEN &&
							recipientAndAmount.some(
								(item, i) =>
									item.recipient === '' ||
									item.amount === '0' ||
									Number.isNaN(Number(item.amount)) ||
									!item.amount ||
									Number(item.amount) === 0 ||
									Number(item.amount) > Number(item.token.balance_token) ||
									!validRecipient[i]
							)) ||
						(transactionType === ETransactionTypeEVM.STREAM_PAYMENTS &&
							(streamRecipient === '' ||
								streamAmount === '0' ||
								Number.isNaN(Number(streamAmount)) ||
								!streamAmount ||
								Number(streamAmount) === 0)) ||
						(transactionType === ETransactionTypeEVM.TRANSACTION_BUILDER &&
							(!txnBuilderData || !txnBuilderToAddress)) ||
						(transactionType === ETransactionTypeEVM.SEND_NFT &&
							(!nftRecipient || !selectedNFT || Object.keys(selectedNFT).length === 0)) ||
						Object.keys(transactionFields[category].subfields).some(
							(key) =>
								!transactionFieldsObject.subfields[key]?.value && transactionFields[category].subfields[key].required
						)
					}
					loading={loading}
					onClick={isSimulationFailed ? () => setOpenSimulationFailedModal(true) : handleSubmit}
					className='w-[250px]'
					title='Make Transaction'
				/>
			</section>
		</Spin>
	);
};

export default SendFundsForm;
