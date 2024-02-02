/* eslint-disable sort-keys */
/* eslint-disable react/jsx-props-no-spreading */
import { Form, Input, Upload, UploadProps } from 'antd';
import Image from 'next/image';
import React, { useState } from 'react';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NotificationStatus } from '@next-common/types';

const OrgNameAndImageStep = ({
	orgName,
	setOrgName,
	orgDesc,
	setOrgDesc,
	orgImageUrl,
	setOrgImageUrl
}: {
	orgName: string;
	setOrgName: React.Dispatch<React.SetStateAction<string>>;
	orgDesc: string;
	setOrgDesc: React.Dispatch<React.SetStateAction<string>>;
	orgImageUrl: string;
	setOrgImageUrl: React.Dispatch<React.SetStateAction<string>>;
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const IMGBB_KEY = '8ce9959fc4824951a0236e753775328d';
	const props: UploadProps = {
		name: 'file',
		// eslint-disable-next-line sort-keys
		headers: {
			authorization: 'authorization-text'
		},
		beforeUpload(file) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-async-promise-executor
			return new Promise(async (resolve) => {
				setLoading(true);
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
					setLoading(false);
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
					setLoading(false);
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
	return (
		<Form className='rounded-xl p-6 bg-bg-main flex flex-col gap-y-5'>
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
							<PrimaryButton loading={loading}>Add an Image</PrimaryButton>
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
			<div className='flex flex-col gap-y-3 mb-5'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='desc'
				>
					Organisation Desc (Optional)
				</label>
				<Form.Item
					name='desc'
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder='Add a description to your organisation'
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						id='desc'
						onChange={(e) => setOrgDesc(e.target.value)}
						value={orgDesc}
						defaultValue={orgDesc}
					/>
				</Form.Item>
			</div>
		</Form>
	);
};

export default OrgNameAndImageStep;
