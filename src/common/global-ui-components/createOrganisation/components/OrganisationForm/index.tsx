/* eslint-disable react/jsx-props-no-spreading */
import { useOrganisationContext } from '@common/context/CreateOrganisationContext';
import { CreateOrganisationActionButtons } from '@common/global-ui-components/createOrganisation/components/CreateOrganisationActionButtons';
import { organisationDetailsFormFields } from '@common/global-ui-components/createOrganisation/utils/form';
import { Form, Upload, UploadProps } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import emptyImage from '@common/assets/icons/empty-image.png';
import Button from '@common/global-ui-components/Button';
import { useOrgStepsContext } from '@common/context/CreateOrgStepsContext';
import { ECreateOrganisationSteps, NotificationStatus } from '@common/enum/substrate';
import { useRouter } from 'next/navigation';
import { queueNotification } from '@common/global-ui-components/QueueNotification';

export const OrganisationDetailForm = () => {
	const { onChangeOrganisationDetails } = useOrganisationContext();
	const { setStep } = useOrgStepsContext();

	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);

	const [orgImageUrl, setOrgImageUrl] = useState<string>('');

	const IMGBB_KEY = process.env.NEXT_PUBLIC_IMBB_KEY;

	const props: UploadProps = {
		name: 'file',
		headers: {
			authorization: 'authorization-text'
		},
		beforeUpload(file) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-async-promise-executor
			return new Promise(async (resolve) => {
				setLoading(true);
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
		<div>
			<p className='text-lg font-bold mb-2 text-white'>Create Organisation</p>
			<p className='text-sm text-text-secondary mb-5'>
				Give details about your organisation to help customise experience better{' '}
			</p>
			<Form
				layout='vertical'
				className='rounded-xl p-6 bg-bg-main flex flex-col'
				onFinish={(values) => {
					onChangeOrganisationDetails({ name: values.name, description: values.description, image: orgImageUrl });
					setStep(ECreateOrganisationSteps.ADD_MULTISIG);
				}}
			>
				<Form.Item
					name='image'
					className='flex flex-col gap-y-3'
				>
					<label className='text-label text-xs font-normal'>Organisation Image (Optional)</label>
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
								<Button loading={loading}>Add an Image</Button>
							</Upload>
						</span>
					</div>
				</Form.Item>
				{organisationDetailsFormFields.map((field) => (
					<Form.Item
						key={field.name}
						label={<label className='text-label text-xs font-normal'>{field.label}</label>}
						name={field.name}
						rules={field.rules}
					>
						{field.input}
					</Form.Item>
				))}
				<CreateOrganisationActionButtons
					onCancelClick={() => router.back()}
					loading={false}
				/>
			</Form>
		</div>
	);
};
