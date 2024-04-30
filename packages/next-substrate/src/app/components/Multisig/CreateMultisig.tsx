// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { Dropdown, Form, Input, InputNumber, Spin, Switch } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from '@next-common/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from '@next-substrate/app/components/Multisig/CancelBtn';
import AddBtn from '@next-substrate/app/components/Multisig/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import { IMultisigAddress, ISharedAddressBookRecord, NotificationStatus } from '@next-common/types';
import { CircleArrowDownIcon, DashDotIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import ProxyImpPoints from '@next-common/ui-components/ProxyImpPoints';
import queueNotification from '@next-common/ui-components/QueueNotification';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import inputToBn from '@next-substrate/utils/inputToBn';
import setSigner from '@next-substrate/utils/setSigner';
import transferFunds from '@next-substrate/utils/transferFunds';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { useAddMultisigContext } from '@next-substrate/context/AddMultisigContext';
import { usePathname } from 'next/navigation';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import _createMultisig from '@next-substrate/utils/_createMultisig';
import AddAddress from '../AddressBook/AddAddress';
import DragDrop from './DragDrop';
import Search from './Search';
import Signatory from './Signatory';
import NetworkCard, { ParachainIcon } from '../NetworksDropdown/NetworkCard';

interface IMultisigProps {
	onCancel?: () => void;
	homepage?: boolean;
	onComplete?: (multisig: IMultisigAddress) => void;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const CreateMultisig: React.FC<IMultisigProps> = ({ onCancel, homepage = false, onComplete }) => {
	const { setUserDetailsContextState, address: userAddress, loggedInWallet } = useGlobalUserDetailsContext();
	const { setOpenProxyModal } = useAddMultisigContext();
	const { activeOrg } = useActiveOrgContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [uploadSignatoriesJson, setUploadSignatoriesJson] = useState(false);

	const [multisigName, setMultisigName] = useState<string>('');
	const [threshold, setThreshold] = useState<number | null>(2);
	const [signatories, setSignatories] = useState<string[]>([userAddress]);

	const [network, setNetwork] = useState<string>(networks.POLKADOT);
	const { apis } = useGlobalApiContext();

	const [loading, setLoading] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const [addAddress, setAddAddress] = useState<string>('');
	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
	const [cancelCreateProxy, setCancelCreateProxy] = useState<boolean>(false);

	const pathname = usePathname();

	const [form] = Form.useForm();

	const [createMultisigData, setCreateMultisigData] = useState<IMultisigAddress>({} as any);

	const networkOptions: ItemType[] = Object.values(networks).map((item) => ({
		key: item,
		label: (
			<NetworkCard
				selectedNetwork={network}
				key={item}
				network={item}
			/>
		)
	}));

	const createProxy = (multisigData: IMultisigAddress, create: boolean) => {
		const newRecords: { [address: string]: ISharedAddressBookRecord } = {};
		multisigData.signatories.forEach((signatory) => {
			const data = activeOrg?.addressBook.find(
				(a) => getSubstrateAddress(a.address) === getSubstrateAddress(signatory)
			);
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
		// setActiveMultisigContextState((prev) => ({
		// ...prev,
		// records: newRecords,
		// multisig: multisigData.address
		// }));
	};

	const addExistentialDeposit = async (multisigData: IMultisigAddress) => {
		if (!apis || !apis[network] || !apis[network].apiReady) return;

		await setSigner(apis[network].api, loggedInWallet, network);

		setLoading(true);
		setLoadingMessages(
			`Please Sign To Add A Small (${chainProperties[network].existentialDeposit} ${chainProperties[network].tokenSymbol}) Existential Deposit To Make Your Multisig Onchain.`
		);
		try {
			await transferFunds({
				amount: inputToBn(`${chainProperties[network].existentialDeposit}`, network, false)[0],
				api: apis[network].api,
				network,
				recepientAddress: multisigData.address,
				senderAddress: getSubstrateAddress(userAddress) || userAddress,
				setLoadingMessages
			});
			// if (['alephzero'].includes(network) || pathname !== '/') {
			// createProxy(multisigData, false);
			// } else {
			// setSuccess(true);
			// }
			setLoading(false);
			onCancel?.();
		} catch (error) {
			console.log(error);
			setLoading(false);
			onCancel?.();
			// createProxy(multisigData, false);
		}
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleMultisigCreate = async () => {
		try {
			const address = localStorage.getItem('address');
			// const signature = localStorage.getItem('signature');

			if (!address) {
				console.log('ERROR');
			} else {
				const { multisigAddress } = _createMultisig(
					signatories,
					Number(threshold),
					chainProperties[network].ss58Format
				);
				if (
					activeOrg?.multisigs?.some(
						(item) => item.address === multisigAddress && item.network === network && !item.disabled
					)
				) {
					queueNotification({
						header: 'Multisig Exists in this Organisation!',
						message: `${multisigAddress}`,
						status: NotificationStatus.WARNING
					});
					return;
				}
				setLoading(true);
				setLoadingMessages('Creating Your Multisig.');
				const newRecords: { [address: string]: ISharedAddressBookRecord } = {};
				signatories.forEach((signatory) => {
					const substrateSignatory = getSubstrateAddress(signatory) || signatory;
					const data = activeOrg?.addressBook.find((a) => getSubstrateAddress(a.address) === substrateSignatory);
					newRecords[substrateSignatory] = {
						address: signatory,
						name: data?.name || DEFAULT_ADDRESS_NAME,
						email: data?.email,
						discord: data?.discord,
						telegram: data?.telegram,
						roles: data?.roles
					};
				});

				const createMultisigRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createMultisig_substrate`, {
					body: JSON.stringify({
						addressBook: newRecords,
						network,
						signatories,
						threshold,
						multisigName
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: multisigData, error: multisigError } = (await createMultisigRes.json()) as {
					data: IMultisigAddress;
					error: string;
				};

				console.log('multisig', multisigData, multisigError);

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
						activeOrg?.multisigs?.some(
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
					onComplete?.({
						address: multisigData.address,
						network,
						name: multisigName,
						signatories,
						threshold
					});
					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
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
							<div className='flex items-center justify-between max-sm:flex-wrap'>
								{!uploadSignatoriesJson ? (
									<div className='flex items-center justify-between w-[45vw] gap-x-4 max-sm:w-[200px]'>
										<Search
											addAddress={addAddress}
											setAddAddress={setAddAddress}
										/>
										<PrimaryButton
											disabled={
												!addAddress ||
												!getSubstrateAddress(addAddress) ||
												activeOrg?.addressBook?.some((item) => item.address === getEncodedAddress(addAddress, network))
											}
											onClick={
												activeOrg && activeOrg.id
													? () => setShowAddressModal(true)
													: () => {
															if (!signatories.includes(addAddress) && getSubstrateAddress(addAddress)) {
																setSignatories((prev) => [...prev, addAddress]);
																setAddAddress('');
															}
													  }
											}
										>
											<p className='font-normal text-sm'>Add</p>
										</PrimaryButton>
									</div>
								) : null}
								<div className='flex flex-col items-end justify-center absolute top-1 right-1 z-50 max-sm:relative'>
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
								<div className='w-full flex items-center justify-between max-sm:flex-col max-sm:items-start'>
									{!uploadSignatoriesJson ? (
										<Signatory
											network={network}
											homepage={homepage}
											filterAddress={addAddress}
											setSignatories={setSignatories}
											signatories={signatories}
											api={apis?.[network]?.api}
											apiReady={apis?.[network]?.apiReady}
										/>
									) : (
										<DragDrop setSignatories={setSignatories} />
									)}
									<DashDotIcon className='mt-5 max-sm:hidden' />
									<div className='w-[40%] overflow-auto max-sm:w-[100%]'>
										<br />
										{!uploadSignatoriesJson ? (
											<p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary max-sm:mx-0'>
												The signatories has the ability to create transactions using the multisig and approve
												transactions sent by others. Once the threshold is reached with approvals, the multisig
												transaction is enacted on-chain. Since the multisig function like any other account, once
												created it is available for selection anywhere accounts are used and needs to be funded before
												use.
											</p>
										) : (
											<p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary max-sm:mx-0'>
												Supply a JSON file with the list of signatories.
											</p>
										)}
									</div>
								</div>
							</Form.Item>
							<div className='w-[45vw] mb-2'>
								<p className='text-primary mb-2'>Select Network</p>
								<Dropdown
									trigger={['click']}
									className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer min-w-[150px]'
									menu={{
										items: networkOptions,
										onClick: (e) => setNetwork(e.key)
									}}
								>
									<div className='flex justify-between items-center text-white gap-x-2'>
										<div className='capitalize flex items-center gap-x-2 text-sm'>
											<ParachainIcon
												size={20}
												src={chainProperties[network]?.logo}
											/>
											{network}
										</div>
										<CircleArrowDownIcon className='text-primary' />
									</div>
								</Dropdown>
							</div>
							<div className='flex items-start justify-between max-sm:flex-col'>
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
								<DashDotIcon className='mt-5 max-sm:hidden' />
								<div className='w-[40%] overflow-auto max-sm:w-[80%]'>
									<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary max-sm:mx-0'>
										The threshold for approval should be less or equal to the number of signatories for this multisig.
									</p>
								</div>
							</div>
							<div className='flex items-center justify-between max-sm:flex-col max-sm:items-start'>
								<div className='w-[45vw] max-sm:mt-4'>
									<p className='text-primary'>Name</p>
									<Input
										onChange={(e) => setMultisigName(e.target.value)}
										value={multisigName}
										className='bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none w-full mt-2 py-2'
										placeholder='Give the MultiSig a unique name'
									/>
								</div>
								<DashDotIcon className='mt-5 max-sm:hidden' />
								<div className='w-[40%] overflow-auto max-sm:w-[80%]'>
									<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary max-sm:mx-0'>
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
