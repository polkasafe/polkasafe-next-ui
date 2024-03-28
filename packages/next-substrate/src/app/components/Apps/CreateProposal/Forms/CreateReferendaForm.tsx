/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { BN, BN_HUNDRED, BN_ZERO, BN_ONE, isHex } from '@polkadot/util';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { chainProperties } from '@next-common/global/evm-network-constants';
import setSigner from '@next-substrate/utils/setSigner';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NotificationStatus, PostOrigin } from '@next-common/types';
import { getTypeDef } from '@polkadot/types/create';
import { TypeDef, TypeDefInfo } from '@polkadot/types/types';
import _ from 'lodash';
import { Form, Input, Radio, Spin } from 'antd';
import HelperTooltip from '@next-common/ui-components/HelperTooltip';
import Alert from 'antd/es/alert/Alert';
import formatBalance from '@next-substrate/utils/formatBalance';
import formatBnBalance from '@next-substrate/utils/formatBnBalance';
import Dropdown from 'antd/es/dropdown/dropdown';
import SelectTracks from '@next-substrate/app/components/SelectTracks';
import { CircleArrowDownIcon, WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import BalanceInput from '@next-common/ui-components/BalanceInput';
import AddressInput from '@next-common/ui-components/AddressInput';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import executeTx from '../utils/executeTx';
import { EEnactment, FormState, IAdvancedDetails, IEnactment } from '../types';
import useCurrentBlock from '../../hooks/useCurrentBlock';
import createPreImage from '../utils/createPreimage';

interface ParamField {
	name: string;
	type: string;
	optional: boolean;
	raw: TypeDef;
	typeName: string;
}

const initFormState = {
	callable: '',
	inputParams: [] as any[],
	palletRpc: ''
} as FormState;

const paramIsOptional = (arg: any) => arg.type.toString().startsWith('Option<');

const isNumberType = (type: string) =>
	['Compact<Balance>', 'BalanceOf', 'u8', 'u16', 'u32', 'u64', 'u128', 'i8', 'i16', 'i32', 'i64', 'i128'].includes(
		type
	);

const transformParams = (paramFields: ParamField[], inputParams: any[], opts = { emptyAsNull: true }) => {
	const paramVal = inputParams.map((inputParam) => {
		if (typeof inputParam === 'object' && inputParam !== null && typeof inputParam.value === 'string') {
			return inputParam.value.trim();
		}
		if (typeof inputParam === 'string') {
			return inputParam.trim();
		}
		return inputParam;
	});

	const params = paramFields.map((field, ind) => ({
		...field,
		value: paramVal[ind] || null
	}));

	return params.reduce((previousValue, { type = 'string', value }) => {
		if (value == null || value === '') return opts.emptyAsNull ? [...previousValue, null] : previousValue;

		let converted = value;

		if (type.indexOf('Vec<') >= 0) {
			converted = converted.split(',').map((e: string) => e.trim());
			converted = converted.map((single: any) =>
				isNumberType(type)
					? single.indexOf('.') >= 0
						? Number.parseFloat(single)
						: Number.parseInt(single, 10)
					: single
			);
			return [...previousValue, converted];
		}

		if (isNumberType(type)) {
			converted = converted.indexOf('.') >= 0 ? Number.parseFloat(converted) : Number.parseInt(converted, 10);
		}
		return [...previousValue, converted];
	}, [] as any[]);
};

export default function CreateReferendaForm({
	isProxySelected,
	selectedMultisig,
	seTransactionData
}: {
	isProxySelected: boolean;
	selectedMultisig: string;
	seTransactionData: React.Dispatch<any>;
}) {
	const { api, apiReady } = useGlobalApiContext();
	const { loggedInWallet: loginWallet, address } = useGlobalUserDetailsContext();
	const [availableBalance, setAvailableBalance] = useState('0');
	const availableBalanceBN = new BN(availableBalance);
	const { activeOrg } = useActiveOrgContext();
	const multisigAddresses = activeOrg.multisigs;
	const currentMultisig = multisigAddresses?.find(
		(item) =>
			item.address === selectedMultisig ||
			getEncodedAddress(item.address, item.network) === selectedMultisig ||
			item.proxy === selectedMultisig
	);

	const { network } = currentMultisig;

	const [submissionDeposit, setSubmissionDeposit] = useState<BN>(BN_ZERO);
	const [palletRPCs, setPalletRPCs] = useState<ItemType[]>([]);
	const [callables, setCallables] = useState<ItemType[]>([]);
	const [paramFields, setParamFields] = useState<ParamField[] | null>(null);
	const [formState, setFormState] = useState(initFormState);
	const { palletRpc, callable, inputParams } = formState;
	const [transformedParams, setTransformedParams] = useState<any>();
	const [methodCall, setMethodCall] = useState<SubmittableExtrinsic<'promise'> | null>();
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({
		afterNoOfBlocks: BN_HUNDRED,
		atBlockNo: BN_ONE
	});
	const currentBlock = useCurrentBlock();
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
	const [selectedTrack, setSelectedTrack] = useState('');
	const [isPreimage, setIsPreimage] = useState<boolean | null>(null);
	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number | null>(null);

	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const handleSubmit = async () => {
		if (!methodCall) return;
		if (!api || !apiReady) {
			return;
		}
		if (!loginWallet) {
			return;
		}
		await setSigner(api, loginWallet);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const proposalPreImage = createPreImage(api, methodCall);
			const preImageTx = proposalPreImage.notePreimageTx;
			const origin: any = { Origins: selectedTrack };
			const proposalTx = api.tx.referenda.submit(
				origin,
				{ Lookup: { hash: proposalPreImage.preimageHash, len: proposalPreImage.preimageLength } },
				enactment.value
					? enactment.key === EEnactment.At_Block_No
						? { At: enactment.value }
						: { After: enactment.value }
					: { After: BN_HUNDRED }
			);
			const mainTx = api.tx.utility.batchAll([preImageTx, proposalTx]);
			// const post_id = Number(await api.query.referenda.referendumCount());
			const data = await executeTx({
				address,
				api,
				apiReady,
				isProxy: isProxySelected,
				multisig: currentMultisig,
				network: currentMultisig?.network,
				setLoadingMessages: (message: string) => {
					setLoadingStatus({ isLoading: true, message });
				},
				tx: mainTx
			});
			seTransactionData({ ...data, network });
		} catch (error) {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleExistingPreimageSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}
		if (!loginWallet) {
			return;
		}
		await setSigner(api, loginWallet);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const proposalTx = api.tx.referenda.submit(
				selectedTrack,
				{ Lookup: { hash: preimageHash, len: preimageLength } },
				enactment.value
					? enactment.key === EEnactment.At_Block_No
						? { At: enactment.value }
						: { After: enactment.value }
					: { After: BN_HUNDRED }
			);

			await executeTx({
				address,
				api,
				apiReady,
				isProxy: isProxySelected,
				multisig: currentMultisig,
				network: currentMultisig?.network,
				setLoadingMessages: (message: string) => {
					setLoadingStatus({ isLoading: true, message });
				},
				tx: proposalTx
			});
			seTransactionData(true);
		} catch (error) {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Creating Proposal',
				status: NotificationStatus.ERROR
			});
		}
	};

	const areAllParamsFilled = useMemo(() => {
		if (paramFields === null) {
			return false;
		}

		if (paramFields.length === 0) {
			return true;
		}

		return paramFields?.every((paramField, ind) => {
			const param = inputParams[ind];
			if (paramField.optional) {
				return true;
			}
			if (param == null) {
				return false;
			}

			const value = typeof param === 'object' ? param.value : param;
			return value !== null && value !== '';
		});
	}, [inputParams, paramFields]);

	const updatePalletRPCs = useCallback(() => {
		if (!api) {
			return;
		}
		const apiType = api.tx;
		const palletRPCsList = Object.keys(apiType)
			.sort()
			.filter((pr) => Object.keys(apiType[pr]).length > 0)
			.map((pr) => ({ key: pr, label: <span className='flex items-center gap-x-2 dark:text-white'>{pr}</span> }));
		setPalletRPCs(palletRPCsList);
	}, [api]);

	const updateCallables = useCallback(() => {
		if (!api || !palletRpc) {
			return;
		}

		const callablesList = Object.keys(api.tx[palletRpc])
			.sort()
			.map((c) => ({ key: c, label: <span className='flex items-center gap-x-2 dark:text-white'>{c}</span> }));
		setCallables(callablesList);
	}, [api, palletRpc]);

	const updateParamFields = useCallback(() => {
		if (!api || !palletRpc || !callable) {
			setParamFields(null);
			return;
		}

		let paramFieldsList: ParamField[] = [];
		const metaArgs = api.tx[palletRpc][callable].meta.args;

		if (metaArgs && metaArgs.length > 0) {
			paramFieldsList = metaArgs.map((arg) => {
				const instance = api.registry.createType(arg.type as unknown as 'u32');

				const raw = getTypeDef(instance.toRawType());

				return {
					name: arg.name.toString(),
					optional: paramIsOptional(arg),
					raw,
					type: arg.type.toString(),
					typeName: arg.typeName.toString()
				};
			});
		}

		setParamFields(paramFieldsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, callable, palletRpc, formState]);

	useEffect(() => {
		if (!!paramFields?.length && !!inputParams.length) {
			setTransformedParams(transformParams(paramFields, inputParams));
		}
	}, [inputParams, paramFields]);
	useEffect(updatePalletRPCs, [updatePalletRPCs]);
	useEffect(updateCallables, [updateCallables]);
	useEffect(updateParamFields, [updateParamFields]);

	const onPalletCallableParamChange = useCallback((event: any, state: string) => {
		// reset the params
		setParamFields(null);

		setFormState((prevState) => {
			return { ...prevState, [state]: '' };
		});

		setFormState((prevState) => {
			const value = event.key;
			if (state === 'palletRpc') {
				return {
					...prevState,
					callable: '',
					inputParams: [],
					[state]: value
				};
			}
			if (state === 'callable') {
				return { ...prevState, inputParams: [], [state]: value };
			}

			return initFormState;
		});
	}, []);

	const onParamChange = (value: string, { ind, paramField }: { ind: number; paramField: ParamField }) => {
		if (!value) {
			return;
		}
		setFormState((prevState) => {
			const nputParams: any[] = [...prevState.inputParams];
			inputParams[ind] = { type: paramField.type, value };
			return { ...prevState, inputParams };
		});
	};
	const trackArr: string[] = [];

	if (network) {
		Object.values(PostOrigin).forEach((value) => {
			trackArr.push(value);
		});
	}

	const existPreimageData = async (preimageHash: string) => {
		setPreimageLength(0);
		if (!api || !apiReady || !isHex(preimageHash, 256) || preimageHash?.length < 0) return;
		setLoadingStatus({ isLoading: true, message: '' });
		const response = await fetch(
			`https://${currentMultisig.network}.polkassembly.io/api/v1/preimages/latest?hash=${preimageHash}`,
			{
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': '018db5c6-7225-70bc-8b5c-51202c78ec75',
					'x-network': currentMultisig.network
				},
				method: 'POST'
			}
		);
		const { data, error } = (await response.json()) as { data: any; error: any };

		if (data && !data?.message) {
			if (data.hash === preimageHash) {
				setPreimageLength(data.length);
			} else {
				setPreimageLength(0);
				queueNotification({
					header: 'Incorrect Preimage Added!',
					message: 'Please enter a preimage for a treasury related track.',
					status: NotificationStatus.ERROR
				});
			}
		} else if (error || data?.message) {
			console.log('fetching data from polkadotjs');
		}
		setLoadingStatus({ isLoading: false, message: '' });
	};
	const checkPreimageHash = (preimageLength: number | null, preimageHash: string) => {
		if (!preimageHash || preimageLength === null) return false;
		return !isHex(preimageHash, 256) || !preimageLength || preimageLength === 0;
	};

	const invalidPreimageHash = useCallback(
		() => checkPreimageHash(preimageLength, preimageHash),
		[preimageHash, preimageLength]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceExistPreimageFn = useCallback(_.debounce(existPreimageData, 2000), []);

	const handlePreimageHash = (preimageHash: string) => {
		if (!preimageHash || preimageHash.length === 0) return;
		debounceExistPreimageFn(preimageHash);
		setPreimageHash(preimageHash);
	};

	const handleAdvanceDetailsChange = (key: EEnactment, value: string) => {
		if (!value || value.includes('-')) return;
		try {
			const bnValue = new BN(value || '0');
			if (!bnValue) return;
			switch (key) {
				case EEnactment.At_Block_No:
					setAdvancedDetails({ afterNoOfBlocks: null, atBlockNo: bnValue });
					break;
				case EEnactment.After_No_Of_Blocks:
					setAdvancedDetails({ afterNoOfBlocks: bnValue, atBlockNo: null });
					break;
			}
			setEnactment({ ...enactment, value: bnValue });
			// onChangeLocalStorageSet({ enactment: { ...enactment, value: bnValue.toString() } }, Boolean(isPreimage));
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!apiReady || !api) {
			return;
		}

		if (!callable || !palletRpc || !areAllParamsFilled) {
			return;
		}

		try {
			const extrinsic = transformedParams
				? api.tx[palletRpc][callable](...transformedParams)
				: api.tx[palletRpc][callable]();

			if (extrinsic) setMethodCall(extrinsic);
		} catch (e) {
			console.error('Error in ManualExtrinsic');
			console.error(e);
		}
	}, [api, areAllParamsFilled, callable, apiReady, palletRpc, transformedParams]);

	useEffect(() => {
		if (!api || !apiReady) return;
		const submissionDeposit = api?.consts?.referenda?.submissionDeposit || BN_ZERO;
		setSubmissionDeposit(submissionDeposit);
	}, [api, apiReady]);

	useEffect(() => {
		if (!api || !apiReady || !selectedMultisig) return;

		api.query?.system
			?.account(selectedMultisig)
			.then((res) => {
				const balanceStr = res?.data?.free?.toString() || '0';
				setAvailableBalance(balanceStr);
			})
			.catch((e) => console.error(e));
	}, [selectedMultisig, api, apiReady]);

	return (
		<Spin
			spinning={loadingStatus.isLoading}
			indicator={<LoadingLottie message={loadingStatus.message} />}
		>
			<section className='w-full'>
				<div className='my-5 flex flex-col'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
						Do you have an existing preimage?{' '}
					</label>
					<Radio.Group
						onChange={(e) => {
							setIsPreimage(e.target.value);
							// onChangeLocalStorageSet({ isPreimage: e.target.value }, e.target.value, preimageCreated, preimageLinked, true);
						}}
						size='small'
						className='mt-1.5'
						value={isPreimage}
					>
						<Radio
							value
							className='text-primary [&>span>span]:border-primary'
						>
							Yes
						</Radio>
						<Radio
							value={false}
							className='text-primary [&>span>span]:border-primary'
						>
							No
						</Radio>
					</Radio.Group>
				</div>
				{isPreimage && (
					<>
						<div className='preimage mt-6'>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
								Preimage Hash{' '}
								<span>
									<HelperTooltip
										text='A unique hash is generate for your preimage and it is used to populate proposal details.'
										className='ml-1'
									/>
								</span>
							</label>
							<Form.Item name='preimage_hash'>
								<Input
									name='preimage_hash'
									className='h-10 rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									value={preimageHash}
									onChange={(e) => handlePreimageHash(e.target.value)}
								/>
							</Form.Item>
							{invalidPreimageHash() && !loadingStatus.isLoading && (
								<span className='text-sm text-[#ff4d4f]'>Invalid Preimage hash</span>
							)}
						</div>
						<div className='mt-6'>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Preimage Length</label>
							<Input
								name='preimage_length'
								className='h-10 rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								value={preimageLength || 0}
								disabled
							/>
						</div>
						<div className='mt-4'>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
								Select Track{' '}
								<span>
									<HelperTooltip
										text='Track selection is done based on the amount requested.'
										className='ml-1'
									/>
								</span>
							</label>
							<SelectTracks
								tracksArr={trackArr}
								onTrackChange={(track) => {
									setSelectedTrack(track);
									// onChangeLocalStorageSet({ selectedTrack: track }, isPreimage);
									// getPreimageTxFee();
									// setSteps({ percent: 100, step: 1 });
								}}
								selectedTrack={selectedTrack}
							/>
						</div>
					</>
				)}
				{isPreimage === false && (
					<div>
						{availableBalanceBN.lte(submissionDeposit) && (
							<section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2 mt-2'>
								<WarningCircleIcon />
								<p>
									Please maintain minimum{' '}
									{formatBnBalance(
										String(submissionDeposit.toString()),
										{ numberAfterComma: 3, withUnit: true },
										currentMultisig?.network
									)}{' '}
									balance for these transactions:
								</p>
							</section>
						)}
						{loadingStatus.isLoading && (
							<div className='flex flex-col items-center justify-center'>
								{/* <Loader /> */}
								{loadingStatus.isLoading && (
									<span className='text-pink_primary dark:text-pink-dark-primary'>{loadingStatus.message}</span>
								)}
							</div>
						)}
						<section className='w-[500px]'>
							<div className='flex items-center gap-x-2'>
								<div className='w-full'>
									<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Pallet</label>
									<Dropdown
										trigger={['click']}
										className='border w-full border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer '
										menu={{
											items: palletRPCs,
											onClick: (e) => onPalletCallableParamChange(e, 'palletRpc')
										}}
									>
										<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
											<span className='flex items-center gap-x-2'>
												{palletRpc || <span className='text-text_secondary'>Pallet</span>}
											</span>
											<CircleArrowDownIcon className='text-primary' />
										</div>
									</Dropdown>
								</div>
								{palletRpc && (
									<div className='w-full'>
										<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Method</label>
										<Dropdown
											trigger={['click']}
											className='border w-full border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer'
											menu={{
												items: callables,
												onClick: (e) => onPalletCallableParamChange(e, 'callable')
											}}
										>
											<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
												<span className='flex items-center gap-x-2'>
													{callable || <span className='text-text_secondary'>Method</span>}
												</span>
												<CircleArrowDownIcon className='text-primary' />
											</div>
										</Dropdown>
									</div>
								)}
							</div>
							{paramFields?.map((paramField, ind) => {
								return (
									<div
										key={ind}
										className='mt-2'
									>
										<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
											{paramField.name}
											{paramField.optional ? ' (optional)' : ''}
										</label>
										{['i8', 'i16', 'i32', 'i64', 'i128', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256'].includes(
											paramField.raw.info === TypeDefInfo.Compact && paramField.raw.sub
												? (paramField.raw.sub as any)?.type
												: paramField.raw.type
										) && ['Amount', 'Balance', 'BalanceOf'].includes(paramField.typeName) ? (
											<BalanceInput
												network={network}
												onChange={(balance) => onParamChange(balance.toString(), { ind, paramField })}
											/>
										) : ['AccountId', 'Address', 'LookupSource', 'MultiAddress'].includes(paramField.type) ? (
											<AddressInput
												onChange={(address) => onParamChange(address, { ind, paramField })}
												placeholder={paramField.type}
											/>
										) : (
											<Input
												placeholder={paramField.type}
												type='text'
												className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
												// value={inputParams[ind]?.value || ''}
												onChange={(event) => onParamChange(event.target.value, { ind, paramField })}
											/>
										)}
									</div>
								);
							})}
						</section>
						<div className='mt-4'>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
								Select Track{' '}
								<span>
									<HelperTooltip
										text='Track selection is done based on the amount requested.'
										className='ml-1'
									/>
								</span>
							</label>
							<SelectTracks
								tracksArr={trackArr}
								onTrackChange={(track) => {
									setSelectedTrack(track);
								}}
								selectedTrack={selectedTrack}
							/>
						</div>
					</div>
				)}

				{isPreimage !== null && (
					<div
						className='mt-6 flex cursor-pointer items-center gap-2'
						onClick={() => setOpenAdvanced(!openAdvanced)}
					>
						<span className='text-primary font-normal text-xs leading-[13px] block'>Advanced Details</span>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				)}
				{openAdvanced && (
					<div className='preimage mt-3 flex flex-col'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>
							Enactment{' '}
							<span>
								<HelperTooltip
									text='A custom delay can be set for enactment of approved proposals.'
									className='ml-1'
								/>
							</span>
						</label>
						<Radio.Group
							className='enactment mt-1 flex flex-col gap-2'
							value={enactment.key}
							onChange={(e) => {
								setEnactment({ ...enactment, key: e.target.value });
							}}
						>
							<Radio
								value={EEnactment.At_Block_No}
								className='text-primary [&>span>span]:border-primary'
							>
								<div className='flex h-10 items-center gap-2'>
									<span className='w-[150px]'>
										At Block no.
										<HelperTooltip
											className='ml-1'
											text='Allows you to choose a custom block number for enactment.'
										/>
									</span>
									<span>
										{enactment.key === EEnactment.At_Block_No && (
											<Form.Item
												name='at_block'
												rules={[
													{
														message: 'Invalid Block no.',
														validator(rule, value, callback) {
															const bnValue = new (BN as any)(Number(value) >= 0 ? value : '0') || BN_ZERO;

															if (
																callback &&
																value?.length > 0 &&
																((currentBlock && bnValue?.lt(currentBlock)) || (value?.length && Number(value) <= 0))
															) {
																callback(rule.message?.toString());
															} else {
																callback();
															}
														}
													}
												]}
											>
												<Input
													name='at_block'
													value={String(advancedDetails.atBlockNo?.toString())}
													className='mt-4 w-[100px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
													onChange={(e) => handleAdvanceDetailsChange(EEnactment.At_Block_No, e.target.value)}
												/>
											</Form.Item>
										)}
									</span>
								</div>
							</Radio>
							<Radio
								value={EEnactment.After_No_Of_Blocks}
								className='text-primary [&>span>span]:border-primary'
							>
								<div className='flex h-[30px] items-center gap-2'>
									<span className='w-[150px]'>
										After no. of Blocks
										<HelperTooltip
											text='Allows you to choose a custom delay in terms of blocks for enactment.'
											className='ml-1'
										/>
									</span>
									<span>
										{enactment.key === EEnactment.After_No_Of_Blocks && (
											<Form.Item
												name='after_blocks'
												rules={[
													{
														message: 'Invalid no. of Blocks',
														validator(rule, value, callback) {
															const bnValue = new BN(Number(value) >= 0 ? value : '0') || BN_ZERO;
															if (
																callback &&
																value?.length > 0 &&
																(bnValue?.lt(BN_ONE) || (value?.length && Number(value) <= 0))
															) {
																callback(rule.message?.toString());
															} else {
																callback();
															}
														}
													}
												]}
											>
												<Input
													name='after_blocks'
													defaultValue={100}
													className='mt-4 w-[100px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
													onChange={(e) => handleAdvanceDetailsChange(EEnactment.After_No_Of_Blocks, e.target.value)}
												/>
											</Form.Item>
										)}
									</span>
								</div>
							</Radio>
						</Radio.Group>
					</div>
				)}
				<div className='mt-6 flex items-center justify-end space-x-3'>
					<PrimaryButton
						onClick={isPreimage ? handleExistingPreimageSubmit : handleSubmit}
						className={`w-min ${!methodCall || !selectedTrack ? 'opacity-60' : ''}`}
						disabled={(!methodCall || !selectedTrack) && Boolean(!isPreimage)}
					>
						Create Referendum
					</PrimaryButton>
				</div>
			</section>
		</Spin>
	);
}
