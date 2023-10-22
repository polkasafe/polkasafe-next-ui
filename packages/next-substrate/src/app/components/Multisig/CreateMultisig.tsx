// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { Form, Input, InputNumber, Spin, Switch } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from '@next-common/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from '@next-substrate/app/components/Multisig/CancelBtn';
import AddBtn from '@next-substrate/app/components/Multisig/ModalBtn';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigAddress, ISharedAddressBookRecord, NotificationStatus } from '@next-common/types';
import { DashDotIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import ProxyImpPoints from '@next-common/ui-components/ProxyImpPoints';
import queueNotification from '@next-common/ui-components/QueueNotification';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import inputToBn from '@next-substrate/utils/inputToBn';
import setSigner from '@next-substrate/utils/setSigner';
import transferFunds from '@next-substrate/utils/transferFunds';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import { useAddMultisigContext } from '@next-substrate/context/AddMultisigContext';
import { usePathname } from 'next/navigation';
import AddAddress from '../AddressBook/AddAddress';
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
		addressBook,
		multisigAddresses,
		loggedInWallet
	} = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();
	const { records, setActiveMultisigContextState } = useActiveMultisigContext();
	const { setOpenProxyModal } = useAddMultisigContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [uploadSignatoriesJson, setUploadSignatoriesJson] = useState(false);

	const [multisigName, setMultisigName] = useState<string>('');
	const [threshold, setThreshold] = useState<number | null>(2);
	const [signatories, setSignatories] = useState<string[]>([userAddress]);

	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const [addAddress, setAddAddress] = useState<string>('');
	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
	const [cancelCreateProxy, setCancelCreateProxy] = useState<boolean>(false);

	const pathname = usePathname();

	const [form] = Form.useForm();

	const [createMultisigData, setCreateMultisigData] = useState<IMultisigAddress>({} as any);

	const createProxy = (multisigData: IMultisigAddress, create: boolean) => {
		const newRecords: { [address: string]: ISharedAddressBookRecord } = {};
		multisigData.signatories.forEach((signatory) => {
			const data = addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(signatory));
			const substrateSignatory = getSubstrateAddress(signatory) || signatory;
			newRecords[substrateSignatory] = {
				address: signatory,
				name: data?.name || DEFAULT_ADDRESS_NAME,
				email: data?.email,
				discord: data?.discord,
				telegram: data?.telegram,
				roles: data?.roles
			};
		});
		if (create && pathname === '/') {
			setOpenProxyModal(true);
		}
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
		setActiveMultisigContextState((prev) => ({
			...prev,
			records: newRecords,
			multisig: multisigData.address
		}));
	};

	const addExistentialDeposit = async (multisigData: IMultisigAddress) => {
		if (!api || !apiReady) return;

		await setSigner(api, loggedInWallet);

		setLoading(true);
		setLoadingMessages(
			`Please Sign To Add A Small (${chainProperties[network].existentialDeposit} ${chainProperties[network].tokenSymbol}) Existential Deposit To Make Your Multisig Onchain.`
		);
		try {
			await transferFunds({
				amount: inputToBn(`${chainProperties[network].existentialDeposit}`, network, false)[0],
				api,
				network,
				recepientAddress: multisigData.address,
				senderAddress: getSubstrateAddress(userAddress) || userAddress,
				setLoadingMessages
			});
			if (['alephzero', 'ternoa'].includes(network) || pathname !== '/') {
				createProxy(multisigData, false);
			} else {
				setSuccess(true);
			}
			setLoading(false);
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoading(false);
			createProxy(multisigData, false);
		}
	};

	const handleMultisigCreate = async () => {
		try {
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if (!address || !signature) {
				console.log('ERROR');
			} else {
				setLoading(true);
				setLoadingMessages('Creating Your Multisig.');
				const newRecords: { [address: string]: ISharedAddressBookRecord } = {};
				signatories.forEach((signatory) => {
					const substrateSignatory = getSubstrateAddress(signatory) || signatory;
					const data = addressBook.find((a) => getSubstrateAddress(a.address) === substrateSignatory);
					newRecords[substrateSignatory] = {
						address: signatory,
						name: data?.name || DEFAULT_ADDRESS_NAME,
						email: data?.email,
						discord: data?.discord,
						telegram: data?.telegram,
						roles: data?.roles
					};
				});
				const { data: multisigData, error: multisigError } = await nextApiClientFetch<IMultisigAddress>(
					`${SUBSTRATE_API_URL}/createMultisig`,
					{
						addressBook: newRecords,
						signatories,
						threshold,
						multisigName
					}
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
					if (
						multisigAddresses?.some(
							(item) => item.address === multisigData.address && item.network === multisigData.network && !item.disabled
						)
					) {
						queueNotification({
							header: 'Multisig Exist!',
							message: 'Please try adding a different multisig.',
							status: NotificationStatus.WARNING
						});
						setLoading(false);
						return;
					}
					queueNotification({
						header: 'Success!',
						message: `Your Multisig ${multisigName} has been created successfully!`,
						status: NotificationStatus.SUCCESS
					});
					setCreateMultisigData(multisigData);
					await addExistentialDeposit(multisigData);
				}
			}
		} catch (error) {
			console.log('ERROR', error);
		}
	};

	return (
		<Spin
			spinning={loading || success || failure}
			indicator={
				loading ? (
					<LoadingLottie message={loadingMessages} />
				) : success ? (
					<div className='w-full'>
						<SuccessTransactionLottie message='Multisig created successfully!' />
						<div className='w-full flex justify-center my-3 text-left'>
							<ProxyImpPoints />
						</div>
						<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
							<CancelBtn onClick={() => setCancelCreateProxy(true)} />
							<AddBtn
								title='Create Proxy'
								onClick={() => createProxy(createMultisigData, true)}
							/>
						</div>
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
			<ModalComponent
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Cancel Create Proxy</h3>}
				open={cancelCreateProxy}
				onCancel={() => setCancelCreateProxy(false)}
			>
				<div className='flex flex-col h-full'>
					<div className='w-full flex justify-center my-3 flex-1'>
						<ProxyImpPoints />
					</div>
					<div className='text-white'>Are you sure you don&apos;t want to create proxy right now?</div>
					<div className='flex items-center justify-between mt-[40px]'>
						<CancelBtn onClick={() => createProxy(createMultisigData, false)} />
						<AddBtn
							title='No, Create Proxy'
							onClick={() => setCancelCreateProxy(false)}
						/>
					</div>
				</div>
			</ModalComponent>
			<Form
				form={form}
				// eslint-disable-next-line no-template-curly-in-string
				validateMessages={{ required: "Please add the '${name}'" }}
			>
				<div className={`flex flex-col relative ${!homepage && 'max-h-[68vh] overflow-y-auto px-3 py-2'}`}>
					<div
						className={classNames(`${homepage ? '' : 'w-[80vw]'}  flex justify-between items-end`, {
							// eslint-disable-next-line @typescript-eslint/naming-convention
							'w-auto': onCancel
						})}
					>
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
												!getSubstrateAddress(addAddress) ||
												(records &&
													Object.keys(records || {}).includes(getSubstrateAddress(addAddress) || addAddress)) ||
												addressBook.some((item) => item.address === getEncodedAddress(addAddress, network))
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
											onChange={(val) => setThreshold(val)}
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
