/* eslint-disable sort-keys */
/* eslint-disable react/jsx-props-no-spreading */
import { Form, Input, Spin, Upload, UploadProps } from 'antd';
import Image from 'next/image';
import React, { useState } from 'react';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NotificationStatus } from '@next-common/types';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { CheckOutlined } from '@next-common/ui-components/CustomIcons';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import CancelBtn from '../Settings/CancelBtn';

const PersonalInfoForm = ({ onCancel }: { onCancel: () => void }) => {
	const [imageLoading, setImageLoading] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const IMGBB_KEY = '8ce9959fc4824951a0236e753775328d';
	const { activeOrg, setActiveOrg } = useActiveOrgContext();
	const [orgName, setOrgName] = useState<string>(activeOrg?.name);
	const [orgImageUrl, setOrgImageUrl] = useState<string>(activeOrg?.imageURI);
	const [senderName, setSenderName] = useState<string>('');

	const [countryName, setCountryName] = useState<string>('');
	const [stateName, setStateName] = useState<string>('');
	const [cityName, setCityName] = useState<string>('');

	const [postalCode, setPostalCode] = useState<string>('');
	const [residentialAddress, setResidentialAddress] = useState<string>('');
	const [taxNumber, setTaxNumber] = useState<string>('');

	const props: UploadProps = {
		name: 'file',
		// eslint-disable-next-line sort-keys
		headers: {
			authorization: 'authorization-text'
		},
		beforeUpload(file) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-async-promise-executor
			return new Promise(async (resolve) => {
				setImageLoading(true);
				console.log('file', file);
				const form = new FormData();
				form.append('image', file, `${file.name}`);
				const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
					body: form,
					method: 'POST'
				});
				const uploadData = await res.json();
				if (uploadData?.success && uploadData?.data?.url) {
					setOrgImageUrl(uploadData.data.url);
					setImageLoading(false);
					queueNotification({
						header: 'Uploaded!',
						message: 'Organisation Image Uploaded.',
						status: NotificationStatus.SUCCESS
					});
				} else {
					queueNotification({
						header: 'Error!',
						message: 'There was an issue uploading Image.',
						status: NotificationStatus.ERROR
					});
					setImageLoading(false);
				}
			});
		},
		onChange(info) {
			if (info.file.status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (info.file.status === 'done') {
				console.log(`${info.file.name} file uploaded successfully`);
			} else if (info.file.status === 'error') {
				console.log(`${info.file.name} file upload failed.`);
			}
		}
	};

	const savePersonalInfo = async () => {
		if (!activeOrg || !activeOrg.id) return;

		setLoading(true);

		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createOrganization_substrate`, {
			body: JSON.stringify({
				organisationId: activeOrg.id,
				name: orgName,
				imageURI: '',
				multisigs: activeOrg.multisigs,
				userFullName: senderName,
				country: countryName,
				state: stateName,
				city: cityName,
				postalCode,
				organisationAddress: residentialAddress,
				taxNumber
			}),
			headers: firebaseFunctionsHeader(),
			method: 'POST'
		});
		const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
			data: any;
			error: string;
		};
		if (invoiceError) {
			queueNotification({
				header: 'Error in Saving Personal Info!',
				message: invoiceError,
				status: NotificationStatus.ERROR
			});
		}
		if (invoiceData && !invoiceError) {
			queueNotification({
				header: 'Personal Info Saved!',
				status: NotificationStatus.SUCCESS
			});
			setActiveOrg((prev) => ({
				...prev,
				userFullName: senderName,
				country: countryName,
				state: stateName,
				city: cityName,
				postalCode,
				organisationAddress: residentialAddress,
				taxNumber
			}));
			onCancel();
		}
		setLoading(false);
		console.log('invoice data', invoiceData, invoiceError);
	};

	return (
		<Spin
			spinning={loading}
			indicator={<LoadingLottie message='Saving Personal Info' />}
		>
			<Form className='flex flex-col gap-y-5'>
				<div className='flex flex-col gap-y-3'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='name'
					>
						Organisation Image (Optional)
					</label>
					<div className='flex'>
						<span className='flex flex-col gap-y-4 items-center'>
							<Image
								width={100}
								height={100}
								className='rounded-full h-[100px] w-[100px]'
								src={orgImageUrl || emptyImage}
								alt='empty profile image'
							/>
							<Upload {...props}>
								<PrimaryButton loading={imageLoading}>Add an Image</PrimaryButton>
							</Upload>
						</span>
					</div>
				</div>

				<div className='flex flex-col gap-y-3'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='name'
					>
						Organisation Name*
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
							placeholder='Add a name'
							className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='name'
							onChange={(e) => setOrgName(e.target.value)}
							value={orgName}
							defaultValue={orgName}
						/>
					</Form.Item>
				</div>
				<div className='flex flex-col gap-y-3'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='full-name'
					>
						Your Full Name*
					</label>
					<Form.Item
						name='full-name'
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder='Full Name'
							className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='full-name'
							onChange={(e) => setSenderName(e.target.value)}
							value={senderName}
							defaultValue={senderName}
						/>
					</Form.Item>
				</div>
				<div className='flex items-center gap-x-3 justify-between'>
					<div className='flex flex-col gap-y-3'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='country'
						>
							Country
						</label>
						<Form.Item
							name='country'
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='Country'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='country'
								onChange={(e) => setCountryName(e.target.value)}
								value={countryName}
								defaultValue={countryName}
							/>
						</Form.Item>
					</div>
					<div className='flex flex-col gap-y-3'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='state'
						>
							State
						</label>
						<Form.Item
							name='state'
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='State'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='state'
								onChange={(e) => setStateName(e.target.value)}
								value={stateName}
								defaultValue={stateName}
							/>
						</Form.Item>
					</div>
					<div className='flex flex-col gap-y-3'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='city'
						>
							City
						</label>
						<Form.Item
							name='city'
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='City'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='city'
								onChange={(e) => setCityName(e.target.value)}
								value={cityName}
								defaultValue={cityName}
							/>
						</Form.Item>
					</div>
				</div>
				<div className='flex items-center gap-x-3 justify-between'>
					<div className='flex flex-col gap-y-3'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='postal-code'
						>
							Postal Code
						</label>
						<Form.Item
							name='postal-code'
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='######'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='postal-code'
								onChange={(e) => setPostalCode(e.target.value)}
								value={postalCode}
								defaultValue={postalCode}
							/>
						</Form.Item>
					</div>
					<div className='flex flex-col gap-y-3 flex-1'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='address'
						>
							Address
						</label>
						<Form.Item
							name='address'
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='Address'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='address'
								onChange={(e) => setResidentialAddress(e.target.value)}
								value={residentialAddress}
								defaultValue={residentialAddress}
							/>
						</Form.Item>
					</div>
				</div>
				<div className='flex flex-col gap-y-3'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='tax-number'
					>
						Tax Number/GST
					</label>
					<Form.Item
						name='tax-number'
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder='Tax Number'
							className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='tax-number'
							onChange={(e) => setTaxNumber(e.target.value)}
							value={taxNumber}
							defaultValue={taxNumber}
						/>
					</Form.Item>
				</div>
				<div className='flex w-full justify-between mt-5'>
					<CancelBtn
						disabled={loading}
						onClick={onCancel}
					/>
					<PrimaryButton
						loading={loading}
						onClick={savePersonalInfo}
						icon={<CheckOutlined className='text-sm' />}
						size='large'
						className='min-w-[120px] flex justify-center'
					>
						Confirm
					</PrimaryButton>
				</div>
			</Form>
		</Spin>
	);
};

export default PersonalInfoForm;
