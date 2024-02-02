// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Dropdown, Spin } from 'antd';
// import { RandomAvatar } from 'react-random-avatars';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import Image from 'next/image';
import React, { useState } from 'react';
import CreateMultisig from '@next-evm/app/components/Multisig/CreateMultisig';
import {
	ArrowLeftCircle,
	ArrowRightCircle,
	CheckOutlined,
	CircleArrowDownIcon,
	CreateMultisigIcon
} from '@next-common/ui-components/CustomIcons';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import Link from 'next/link';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { useWallets } from '@privy-io/react-auth';
import { IMultisigAddress, IOrganisation, NotificationStatus } from '@next-common/types';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import queueNotification from '@next-common/ui-components/QueueNotification';
import LinkMultisig from './LinkMultisig/LinkMultisig';
import LinkMultisigStep from '../CreateOrg/LinkMultisigStep';
import CancelBtn from '../Settings/CancelBtn';
import ReviewOrgStep from '../CreateOrg/ReviewOrgStep';

interface IMultisigProps {
	className?: string;
	isModalPopup?: boolean;
	homepage?: boolean;
	onCancel?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddMultisig: React.FC<IMultisigProps> = ({ isModalPopup, homepage, className, onCancel }) => {
	// const [isMultisigVisible, setMultisigVisible] = useState(false);
	const [openLinkMultisig, setOpenLinkMultisig] = useState(false);
	const [openCreateMultisig, setOpenCreateMultisig] = useState(false);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { organisations, userID, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { activeOrg, setActiveOrg } = useActiveOrgContext();
	const [selectedOrg, setSelectedOrg] = useState<IOrganisation>(activeOrg);
	const [linkedMultisigs, setLinkedMultisigs] = useState<IMultisigAddress[]>([]);

	const [loading, setLoading] = useState<boolean>(false);

	const [step, setStep] = useState<number>(0);

	const { wallets } = useWallets();
	const connectedWallet = wallets[0];

	const orgOptions: ItemType[] = organisations?.map((item) => ({
		key: JSON.stringify(item),
		label: <span className='text-white truncate capitalize'>{item.name}</span>
	}));

	const steps = [
		{
			component: (
				<>
					<section>
						<p className='text-primary text-xs mb-2'>Select Existing Organisation</p>
						<Dropdown
							trigger={['click']}
							className='p-2 org_dropdown cursor-pointer'
							menu={{
								items: orgOptions,
								onClick: (e) => setSelectedOrg(JSON.parse(e.key) as IOrganisation)
							}}
						>
							<div className='flex justify-between items-center text-white gap-x-2'>
								<div className='flex items-center gap-x-3'>
									<Image
										width={30}
										height={30}
										src={emptyImage}
										alt='empty profile image'
									/>
									{/* <RandomAvatar
										name={activeOrg?.id}
										size={30}
									/> */}
									<div className='flex flex-col gap-y-[1px]'>
										<span className='text-sm text-white capitalize truncate'>{selectedOrg?.name}</span>
										<span className='text-xs text-text_secondary'>{activeOrg?.members?.length} Members</span>
									</div>
								</div>
								<CircleArrowDownIcon className='text-white' />
							</div>
						</Dropdown>
					</section>
					<Divider className='border-text_placeholder'>
						<span className='text-white'>OR</span>
					</Divider>
					<section>
						<Link href='/create-org'>
							<PrimaryButton
								onClick={onCancel}
								size='large'
								className='w-full flex justify-center'
								icon={<CreateMultisigIcon />}
							>
								Create Organisation
							</PrimaryButton>
						</Link>
					</section>
				</>
			),
			description: 'Choose an existing organisation or create new to associate with the multisig account'
		},
		{
			component: (
				<LinkMultisigStep
					selectedOrg={selectedOrg}
					linkedMultisigs={linkedMultisigs}
					setLinkedMultisigs={setLinkedMultisigs}
				/>
			),
			description: 'To add a MultiSig you can choose from the options below:'
		},
		{
			component: (
				<ReviewOrgStep
					notCreateOrg
					loading={loading}
					orgName={selectedOrg?.name}
					linkedMultisigs={linkedMultisigs}
				/>
			),
			description: 'Review the details of your MultiSigs, these can be edited later as well'
		}
	];

	const handleAddMultisigToOrg = async () => {
		if (!userID || !selectedOrg || linkedMultisigs.length === 0) return;

		try {
			setLoading(true);
			const addMultisigToOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addMultisigOrganisation_v1`, {
				body: JSON.stringify({
					multisigs: linkedMultisigs,
					organisationId: activeOrg?.id
				}),
				headers: firebaseFunctionsHeader(connectedWallet.address),
				method: 'POST'
			});
			const { data: addMultisigToOrgData, error: addMultisigToOrgError } = (await addMultisigToOrgRes.json()) as {
				data: IOrganisation[];
				error: string;
			};
			if (addMultisigToOrgError) {
				queueNotification({
					header: 'Error!',
					message: addMultisigToOrgError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}
			if (addMultisigToOrgData) {
				console.log('add multsig data', addMultisigToOrgData);
				// setUserDetailsContextState((prev) => ({
				// ...prev,
				// organisations: addMultisigToOrgData
				// }));
				setActiveOrg((prev) => ({
					...prev,
					multisigs: [...prev.multisigs, ...linkedMultisigs]
				}));

				queueNotification({
					header: 'Success!',
					message: 'MultiSigs Added to Organisation',
					status: NotificationStatus.SUCCESS
				});
				onCancel();
			}
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.log('error in adding multisigs to Org', error);
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					message='Adding MultiSigs to Organisation'
					width={300}
				/>
			}
		>
			<div className={`relative w-[600px] ${className}`}>
				<ModalComponent
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Create Multisig</h3>}
					open={openCreateMultisig}
					onCancel={() => setOpenCreateMultisig(false)}
				>
					<CreateMultisig
						onCancel={() => {
							setOpenCreateMultisig(false);
							onCancel?.();
						}}
					/>
				</ModalComponent>
				<ModalComponent
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Link Multisig</h3>}
					open={openLinkMultisig}
					onCancel={() => setOpenLinkMultisig(false)}
				>
					<LinkMultisig
						onCancel={() => {
							setOpenLinkMultisig(false);
							onCancel?.();
						}}
					/>
				</ModalComponent>
				{steps.map((item, i) =>
					i === step ? (
						<>
							<p className='text-text_secondary text-xs absolute top-[-35px]'>
								Choose an existing organisation or create new to associate with the multisig account
							</p>
							<div className='mt-10'>{item.component}</div>
						</>
					) : null
				)}
				<div className='flex w-full justify-between mt-7'>
					<CancelBtn
						title={step !== 0 && 'Back'}
						icon={step !== 0 && <ArrowLeftCircle className='text-sm' />}
						disabled={loading}
						onClick={step !== 0 ? () => setStep((prev) => prev - 1) : () => onCancel?.()}
					/>
					<PrimaryButton
						loading={loading}
						disabled={
							(step === 0 && !selectedOrg) ||
							(step === 1 && linkedMultisigs.length === 0) ||
							(step === 2 && (!selectedOrg || linkedMultisigs.length === 0))
						}
						icon={step === 2 && <CheckOutlined className='text-sm' />}
						onClick={() => (step === 2 ? handleAddMultisigToOrg() : setStep((prev) => prev + 1))}
						className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
						size='large'
					>
						{step === 2 ? 'Confirm' : 'Next'}
						{step !== 2 && <ArrowRightCircle className='text-sm' />}
					</PrimaryButton>
				</div>
			</div>
		</Spin>
	);
};

export default AddMultisig;
