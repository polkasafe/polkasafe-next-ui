// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, UploadProps, message, Upload } from 'antd';
import React from 'react';
import { IAddressBookItem } from '@next-common/types';
import { UploadBoxIcon } from '@next-common/ui-components/CustomIcons';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';

const { Dragger } = Upload;

const DragDrop = ({ setAddresses }: { setAddresses: React.Dispatch<React.SetStateAction<IAddressBookItem[]>> }) => {
	const props: UploadProps = {
		accept: '.json, .csv',
		beforeUpload: (file) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				console.log(e.target?.result);
				const fileContent = e.target?.result as string;
				if (!Array.isArray(JSON.parse(fileContent))) {
					message.error('Please upload file in correct format.');
					return false;
				}
				// eslint-disable-next-line consistent-return
				JSON.parse(fileContent).forEach((item: IAddressBookItem) => {
					const substrateAddress = getSubstrateAddress(item.address);
					if (!substrateAddress) {
						message.error(`${item.address} is Invalid.`);
						return false;
					}
				});
				setAddresses(JSON.parse(fileContent));
				return true;
			};
			console.log(file);
			reader.readAsText(file);

			// Prevent upload
			return true;
		},
		customRequest: ({ file, onSuccess }) => {
			setTimeout(() => {
				if (onSuccess) {
					onSuccess(file);
				}
			}, 0);
		},
		multiple: false,
		name: 'file',
		onChange(info) {
			const { status } = info.file;
			if (status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (status === 'done') {
				message.success(`${info.file.name} file uploaded successfully.`);
			} else if (status === 'error') {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		}
	};

	return (
		<Dragger {...props}>
			<p className='ant-upload-drag-icon'>
				<UploadBoxIcon className='my-2' />
			</p>
			<p className='ant-upload-text text-white text-base'>Drag and Drop CSV file to upload</p>
			<p className='text-text_secondary text-sm'>OR</p>
			<Button className='mt-3 bg-primary text-primary border-none bg-opacity-10'>Browse</Button>
		</Dragger>
	);
};

export default DragDrop;
