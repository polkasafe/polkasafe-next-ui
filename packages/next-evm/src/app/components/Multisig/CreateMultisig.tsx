// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { Form, Input, InputNumber, Spin, Switch } from 'antd';
import React, { useState } from 'react';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from '@next-common/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import AddBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { useActiveMultisigContext } from '@next-evm/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { IMultisigAddress, ISharedAddressBookRecord, NotificationStatus } from '@next-common/types';
import { DashDotIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import queueNotification from '@next-common/ui-components/QueueNotification';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';

import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_URL } from '@next-common/global/apiUrls';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import AddAddress from '@next-evm/app/components/AddressBook/AddAddress';
import DragDrop from './DragDrop';
import Search from './Search';
import Signatory from './Signatory';

interface IMultisigProps {
	onCancel?: () => void;
	homepage?: boolean;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const CreateMultisig: React.FC<IMultisigProps> = ({ onCancel, homepage = false }) => {
	const {
		setUserDetailsContextState,
		address: userAddress,
		multisigAddresses,
		addressBook
	} = useGlobalUserDetailsContext();
	const { records, setActiveMultisigContextState } = useActiveMultisigContext();
	const { network } = useGlobalApiContext();

	const [uploadSignatoriesJson, setUploadSignatoriesJson] = useState(false);

	const [multisigName, setMultisigName] = useState<string>('');
	const [threshold, setThreshold] = useState<number>(2);
	const [signatories, setSignatories] = useState<string[]>([userAddress]);
	const { gnosisSafe } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [success] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages] = useState<string>('');
	const [addAddress, setAddAddress] = useState<string>('');
	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
	const [form] = Form.useForm();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const createProxy = (multisigData: IMultisigAddress, create: boolean) => {
		setUserDetailsContextState((prevState: any) => {
			return {
				...prevState,
				activeMultisig: multisigData.address,
				multisigAddresses: [...(prevState?.multisigAddresses || []), multisigData],
				multisigSettings: {
					...prevState.multisigSettings,
					[multisigData.address]: {
						name: multisigData.name,
						deleted: false
					}
				}
			};
		});
		onCancel?.();
	};

	const handleMultisigCreate = async () => {
		setLoading(true);
		try {
			const address = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!address || !signature || Boolean(!Object.keys(gnosisSafe).length)) {
				return;
			}

			const safeAddress = await gnosisSafe.createSafe(signatories as [string], threshold);

			if (!safeAddress) {
				queueNotification({
					header: 'Error!',
					message: 'Something went wrong',
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				setFailure(true);
				return;
			}

			const { data: multisigData, error: multisigError } = await nextApiClientFetch<IMultisigAddress>(
				`${EVM_API_URL}/createMultisigEth`,
				{
					signatories,
					threshold,
					multisigName,
					safeAddress,
					addressBook
				},
				{ address, network, signature }
			);

			if (multisigError) {
				queueNotification({
					header: 'Error!',
					message: multisigError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				setFailure(true);
				return;
			}

			if (multisigData) {
				if (multisigAddresses?.some((item: any) => item.address === multisigData.address && !item.disabled)) {
					queueNotification({
						header: 'Multisig Exist!',
						message: 'Please try adding a different multisig.',
						status: NotificationStatus.WARNING
					});
					setLoading(false);
					setUserDetailsContextState((prev) => ({ ...prev, activeMultisig: safeAddress || prev.activeMultisig }));
					return;
				}
				queueNotification({
					header: 'Success!',
					message: `Your Multisig ${multisigName} has been created successfully!`,
					status: NotificationStatus.SUCCESS
				});
				onCancel?.();
				setUserDetailsContextState((prevState) => {
					return {
						...prevState,
						activeMultisig: multisigData.address,
						multisigAddresses: [...(prevState?.multisigAddresses || []), multisigData],
						multisigSettings: {
							...prevState.multisigSettings,
							[`${multisigData.address}_${multisigData.network}`]: {
								name: multisigData.name,
								deleted: false
							}
						}
					};
				});
				const newRecords: { [address: string]: ISharedAddressBookRecord } = {};
				multisigData.signatories.forEach((signatory) => {
					const data = addressBook.find((a) => a.address === signatory);
					newRecords[signatory] = {
						address: signatory,
						name: data?.name || DEFAULT_ADDRESS_NAME,
						email: data?.email,
						discord: data?.discord,
						telegram: data?.telegram,
						roles: data?.roles
					};
				});
				setActiveMultisigContextState((prev) => ({
					...prev,
					records: newRecords,
					multisig: multisigData.address
				}));
			}
		} catch (error) {
			console.log('ERROR', error);
			setFailure(true);

			queueNotification({
				header: 'Something went wrong.',
				message: 'Please try again with different addresses.',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	return (
		<Spin
			spinning={loading || success || failure}
			indicator={
				loading ? (
					<LoadingLottie message={loadingMessages} />
				) : success ? (
					<div className='flex flex-col h-full'>
						<SuccessTransactionLottie message='Multisig created successfully!' />
					</div>
				) : (
					<FailedTransactionLottie message='Failed!' />
				)
			}
		>
			<ModalComponent
				open={showAddressModal}
				onCancel={() => setShowAddressModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Address</h3>}
			>
				<AddAddress
					onCancel={() => setShowAddressModal(false)}
					addAddress={addAddress}
					setAddAddress={setAddAddress}
				/>
			</ModalComponent>
			<Form
				form={form}
				// eslint-disable-next-line no-template-curly-in-string
				validateMessages={{ required: "Please add the '${name}'" }}
			>
				<div className={`flex flex-col relative ${!homepage && 'max-h-[68vh] overflow-y-auto px-3 py-2'}`}>
					<div className={`${homepage ? '' : 'w-[80vw]'}  flex justify-between items-end ${onCancel && 'w-auto'}`}>
						<div className='relative'>
							<div className='flex items-center justify-between'>
								{!uploadSignatoriesJson ? (
									<div className='flex items-center justify-between w-[45vw] gap-x-4'>
										<Search
											addAddress={addAddress}
											setAddAddress={setAddAddress}
										/>
										<PrimaryButton
											disabled={
												!addAddress ||
												!isValidWeb3Address(addAddress) ||
												(records && Object.keys(records).includes(addAddress)) ||
												addressBook.some((item) => item.address === addAddress)
											}
											onClick={() => setShowAddressModal(true)}
										>
											<p className='font-normal text-sm'>Add</p>
										</PrimaryButton>
									</div>
								) : null}
								<div className='flex flex-col items-end justify-center absolute top-1 right-1 z-50'>
									<div className='flex items-center justify-center mb-2'>
										<p className='mx-2 text-white'>Upload JSON file with signatories</p>
										<Switch
											size='small'
											onChange={(checked) => setUploadSignatoriesJson(checked)}
										/>
									</div>
								</div>
							</div>
							<Form.Item
								name='signatories'
								rules={[{ required: true }]}
								help={signatories.length < 2 && 'Multisig Must Have Atleast 2 Signatories.'}
								className='border-0 outline-0 my-0 p-0'
								validateStatus={signatories.length < 2 ? 'error' : 'success'}
							>
								<div className='w-full flex items-center justify-between'>
									{!uploadSignatoriesJson ? (
										<Signatory
											homepage={homepage}
											filterAddress={addAddress}
											setSignatories={setSignatories}
											signatories={signatories}
										/>
									) : (
										<DragDrop setSignatories={setSignatories} />
									)}
									<DashDotIcon className='mt-5' />
									<div className='w-[40%] overflow-auto'>
										<br />
										{!uploadSignatoriesJson ? (
											<p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary'>
												The signatories has the ability to create transactions using the multisig and approve
												transactions sent by others. Once the threshold is reached with approvals, the multisig
												transaction is enacted on-chain. Since the multisig function like any other account, once
												created it is available for selection anywhere accounts are used and needs to be funded before
												use.
											</p>
										) : (
											<p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary'>
												Supply a JSON file with the list of signatories.
											</p>
										)}
									</div>
								</div>
							</Form.Item>
							<div className='flex items-start justify-between'>
								<Form.Item
									name='threshold'
									rules={[{ required: true }]}
									help={
										!threshold || threshold < 2
											? 'Threshold Must Be More Than 1.'
											: threshold > signatories.length && signatories.length > 1
											? 'Threshold Must Be Less Than Or Equal To Selected Signatories.'
											: ''
									}
									className='border-0 outline-0 my-0 p-0'
									validateStatus={
										!threshold || threshold < 2 || (threshold > signatories.length && signatories.length > 1)
											? 'error'
											: 'success'
									}
								>
									<div className='w-[45vw]'>
										<p className='text-primary'>Threshold</p>
										<InputNumber
											onChange={(val) => setThreshold(val || 2)}
											value={threshold}
											className='bg-bg-secondary placeholder:text-[#505050] text-white outline-none border-none w-full mt-2 py-2'
											placeholder='0'
										/>
									</div>
								</Form.Item>
								<DashDotIcon className='mt-5' />
								<div className='w-[40%] overflow-auto'>
									<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>
										The threshold for approval should be less or equal to the number of signatories for this multisig.
									</p>
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<div className='w-[45vw]'>
									<p className='text-primary'>Name</p>
									<Input
										onChange={(e) => setMultisigName(e.target.value)}
										value={multisigName}
										className='bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none w-full mt-2 py-2'
										placeholder='Give the MultiSig a unique name'
									/>
								</div>
								<DashDotIcon className='mt-5' />
								<div className='w-[40%] overflow-auto'>
									<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>
										The name is for unique identification of the account in your owner lists.
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
						<CancelBtn onClick={onCancel} />
						<AddBtn
							disabled={
								signatories.length < 2 || !threshold || threshold < 2 || threshold > signatories.length || !multisigName
							}
							loading={loading}
							title='Create Multisig'
							onClick={handleMultisigCreate}
						/>
					</div>
				</div>
			</Form>
		</Spin>
	);
};

export default CreateMultisig;
