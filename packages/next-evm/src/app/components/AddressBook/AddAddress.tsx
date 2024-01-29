// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import AddBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { EMAIL_REGEX } from '@next-common/global/default';
import queueNotification from '@next-common/ui-components/QueueNotification';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { IAddressBookItem, NotificationStatus } from '@next-common/types';

interface IMultisigProps {
	className?: string;
	addAddress?: string;
	onCancel?: () => void;
	setAddAddress?: React.Dispatch<React.SetStateAction<string>>;
}

const AddAddress: React.FC<IMultisigProps> = ({ addAddress, onCancel, setAddAddress, className }) => {
	const { activeOrg, setActiveOrg } = useActiveOrgContext();

	const [address, setAddress] = useState<string>(addAddress || '');
	const [addressValid, setAddressValid] = useState<boolean>(true);
	const [name, setName] = useState<string>('');
	const [nickName, setNickName] = useState<string>('');
	const [showNickNameField, setShowNickNameField] = useState<boolean>(false);
	const [email, setEmail] = useState<string>('');
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [roles, setRoles] = useState<string[]>([]);
	const [discord, setDiscord] = useState<string>('');
	const [telegram, setTelegram] = useState<string>('');

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (isValidWeb3Address(address)) {
			setAddressValid(true);
		} else {
			setAddressValid(false);
		}
	}, [address]);

	useEffect(() => {
		if (email) {
			const validEmail = EMAIL_REGEX.test(email);
			if (validEmail) {
				setEmailValid(true);
			} else {
				setEmailValid(false);
			}
		}
	}, [email]);

	const handlePersonalAddressBookUpdate = async () => {
		if (!address || !name || !activeOrg) return;

		try {
			setLoading(true);
			if (activeOrg.addressBook.some((item) => item.address === address)) {
				queueNotification({
					header: 'Address Exists',
					message: 'Please try editing the address.',
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			const createOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBookEth`, {
				body: JSON.stringify({
					address,
					discord,
					email,
					name,
					nickName,
					organisationId: activeOrg.id,
					roles,
					telegram
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: addAddressData, error: addAddressError } = (await createOrgRes.json()) as {
				data: IAddressBookItem[];
				error: string;
			};

			if (addAddressError) {
				queueNotification({
					header: 'Error!',
					message: addAddressError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if (addAddressData) {
				setActiveOrg((prevState) => {
					return {
						...prevState,
						addressBook: addAddressData
					};
				});

				queueNotification({
					header: 'Success!',
					message: 'Your address has been added successfully!',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				if (onCancel) {
					onCancel();
				}
				if (setAddAddress) {
					setAddAddress('');
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					noWaitMessage
					message='Updating Your Address Book'
				/>
			}
		>
			<Form className={`${className} add-address my-0 w-[560px] max-h-[75vh] px-2 overflow-y-auto`}>
				<div className='flex flex-col gap-y-3'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='name'
					>
						Name*
					</label>
					<Form.Item
						name='name'
						rules={[
							{
								message: 'Required',
								required: true
							}
						]}
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder='Give the address a name'
							className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='name'
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
						{!showNickNameField && (
							<Button
								onClick={() => setShowNickNameField(true)}
								icon={<PlusCircleOutlined className='text-primary' />}
								className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'
							>
								Add Nickname
							</Button>
						)}
					</Form.Item>
				</div>
				{showNickNameField && (
					<div className='flex flex-col gap-y-3 mt-5'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='nick-name'
						>
							Nickname
						</label>
						<Form.Item
							name='nick-name'
							rules={[
								{
									message: 'Required',
									required: true
								}
							]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='Give the address a Nickname'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='nick-name'
								onChange={(e) => setNickName(e.target.value)}
								value={nickName}
							/>
							<Button
								onClick={() => {
									setShowNickNameField(false);
									setNickName('');
								}}
								icon={<MinusCircleOutlined className='text-primary' />}
								className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'
							>
								Remove Nickname
							</Button>
						</Form.Item>
					</div>
				)}
				<div className='flex flex-col gap-y-3 mt-5'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='address'
					>
						Address*
					</label>
					<Form.Item
						name='address'
						rules={[{ message: 'Address Required', required: true }]}
						validateStatus={address && !addressValid ? 'error' : 'success'}
						help={address && !addressValid && 'Please enter a valid address'}
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder='Unique Address'
							className='text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='address'
							defaultValue={addAddress || ''}
							onChange={(e) => setAddress(e.target.value)}
							value={address}
						/>
					</Form.Item>
				</div>
				<div className='flex flex-col gap-y-3 mt-5'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='email-address'
					>
						Email
					</label>
					<Form.Item
						name='email'
						className='border-0 outline-0 my-0 p-0'
						help={email && !emailValid && 'Please enter a valid Email.'}
						validateStatus={email && !emailValid ? 'error' : 'success'}
					>
						<Input
							type='email'
							placeholder='Email'
							className='text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='email-address'
							onChange={(e) => setEmail(e.target.value)}
							value={email}
						/>
					</Form.Item>
				</div>
				<div className='flex flex-col gap-y-3 mt-5'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='discord'
					>
						Discord
					</label>
					<Form.Item
						name='discord'
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder='Discord'
							className='text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='discord'
							onChange={(e) => setDiscord(e.target.value)}
							value={discord}
						/>
					</Form.Item>
				</div>
				<div className='flex flex-col gap-y-3 mt-5'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='telegram'
					>
						Telegram
					</label>
					<Form.Item
						name='telegram'
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder='Telegram'
							className='text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='telegram'
							onChange={(e) => setTelegram(e.target.value)}
							value={telegram}
						/>
					</Form.Item>
				</div>
				<div className='flex flex-col gap-y-3 mt-5'>
					<label className='text-primary text-xs leading-[13px] font-normal'>Role</label>
					<Form.Item
						name='role'
						className='border-0 outline-0 my-0 p-0'
					>
						<Select
							options={[]}
							mode='tags'
							className={className}
							onChange={(value) => setRoles(value)}
							tokenSeparators={[',']}
							placeholder='Add Roles'
							notFoundContent={false}
						/>
					</Form.Item>
				</div>
			</Form>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn
					loading={loading}
					onClick={onCancel}
				/>
				<AddBtn
					loading={loading}
					disabled={!name || !address || !addressValid || (!!email && !emailValid)}
					title='Add'
					onClick={handlePersonalAddressBookUpdate}
				/>
			</div>
		</Spin>
	);
};

export default AddAddress;
