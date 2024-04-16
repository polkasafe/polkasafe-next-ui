// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import AddBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { EMAIL_REGEX } from '@next-common/global/default';
import { IAddressBookItem, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';

const EditAddress = ({
	className,
	onCancel,
	addressToEdit,
	nameToEdit,
	nickNameToEdit,
	discordToEdit,
	emailToEdit,
	telegramToEdit,
	rolesToEdit,
	personalToShared
}: {
	personalToShared?: boolean;
	className?: string;
	addressToEdit: string;
	nameToEdit?: string;
	nickNameToEdit?: string;
	discordToEdit?: string;
	emailToEdit?: string;
	telegramToEdit?: string;
	rolesToEdit?: string[];
	onCancel: () => void;
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const { activeOrg, setActiveOrg } = useActiveOrgContext();
	const { userID } = useGlobalUserDetailsContext();
	const [newName, setNewName] = useState<string>(nameToEdit || '');
	const [nickName, setNickName] = useState<string>(nickNameToEdit || '');
	const [showNickNameField, setShowNickNameField] = useState<boolean>(!!nickNameToEdit);
	const [email, setEmail] = useState<string>(emailToEdit || '');
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [roles, setRoles] = useState<string[]>(rolesToEdit || []);
	const [discord, setDiscord] = useState<string>(discordToEdit || '');
	const [telegram, setTelegram] = useState<string>(telegramToEdit || '');
	const [noChange, setNoChange] = useState<boolean>(true);

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

	useEffect(() => {
		if (
			newName === nameToEdit &&
			email === emailToEdit &&
			discord === discordToEdit &&
			telegram === telegramToEdit &&
			roles.toString() === rolesToEdit?.toString()
		) {
			if (nickName === nickNameToEdit) {
				setNoChange(true);
			} else {
				setNoChange(false);
			}
		} else {
			setNoChange(false);
		}
	}, [
		discord,
		discordToEdit,
		email,
		emailToEdit,
		nameToEdit,
		newName,
		nickName,
		nickNameToEdit,
		roles,
		rolesToEdit,
		telegram,
		telegramToEdit
	]);

	const handlePersonalAddressBookUpdate = async () => {
		if (!activeOrg || !activeOrg.id || !userID) return;
		try {
			setLoading(true);
			const addToAddressBookRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBook_substrate`, {
				body: JSON.stringify({
					address: addressToEdit,
					discord,
					email,
					name: newName,
					nickName,
					organisationId: activeOrg.id,
					roles,
					telegram
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: addAddressData, error: addAddressError } = (await addToAddressBookRes.json()) as {
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
				onCancel();
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<Spin
			spinning={loading && !personalToShared}
			indicator={
				<LoadingLottie
					noWaitMessage
					message='Updating Your Address Book'
				/>
			}
		>
			{personalToShared ? (
				<Form className='my-0 w-[560px]'>
					<p className='text-white font-medium text-sm leading-[15px]'>
						This will update the Address Book for All Signatories, do you want to proceed?
					</p>
				</Form>
			) : (
				<Form
					className={`${className} my-0 w-[560px] max-h-[75vh] py-1 px-2 overflow-y-auto`}
					disabled={loading}
				>
					<div className='flex flex-col gap-y-3'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='name'
						>
							Name
						</label>
						<Form.Item
							name='name'
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='Give the address a name'
								required
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='name'
								onChange={(e) => setNewName(e.target.value)}
								value={newName}
								defaultValue={newName}
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
								defaultValue={email}
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
								defaultValue={discord}
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
								defaultValue={telegram}
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
								mode='tags'
								className={className}
								onChange={(value) => setRoles(value)}
								tokenSeparators={[',']}
								placeholder='Add Roles'
								value={roles}
								defaultValue={roles}
								notFoundContent={false}
							/>
						</Form.Item>
					</div>
				</Form>
			)}
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn
					loading={loading}
					onClick={onCancel}
				/>
				<AddBtn
					disabled={!personalToShared && (!newName || (!!email && !emailValid) || noChange)}
					loading={loading}
					onClick={handlePersonalAddressBookUpdate}
					title={personalToShared ? 'Yes' : 'Save'}
				/>
			</div>
		</Spin>
	);
};

export default EditAddress;
