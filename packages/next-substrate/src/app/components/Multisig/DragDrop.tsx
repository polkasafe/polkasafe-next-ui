// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, UploadProps, message, Upload } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { CopyIcon, UploadBoxIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import ModalComponent from '@next-common/ui-components/ModalComponent';

const { Dragger } = Upload;

const DragDrop = ({ setSignatories }: { setSignatories: React.Dispatch<React.SetStateAction<string[]>> }) => {
	const { network } = useGlobalApiContext();
	const { address } = useGlobalUserDetailsContext();
	const [showSignatories, setShowSignatories] = useState<boolean>(false);
	const [uploaded, setUploaded] = useState<string[]>([]);

	const props: UploadProps = {
		accept: '.json',
		beforeUpload: (file) => {
			const reader = new FileReader();

			// eslint-disable-next-line consistent-return
			reader.onload = (e) => {
				console.log(e.target?.result);
				const fileContent = e.target?.result as string;
				if (!Array.isArray(JSON.parse(fileContent))) {
					message.error('Please upload file in correct format.');
					return false;
				}
				// eslint-disable-next-line consistent-return
				JSON.parse(fileContent).forEach((a: string) => {
					const substrateAddress = getSubstrateAddress(a);
					if (!substrateAddress) {
						message.error(`${a} is Invalid.`);
						return false;
					}
				});
				const uploadedSignatories = JSON.parse(fileContent)?.map((item: string) => getSubstrateAddress(item));
				setUploaded(uploadedSignatories);
				if (uploadedSignatories.includes(address)) {
					setSignatories(uploadedSignatories);
				} else {
					setSignatories([address, ...uploadedSignatories]);
				}
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
		},
		onRemove() {
			setUploaded([]);
			setSignatories([address]);
		}
	};

	return (
		<div className='flex flex-col'>
			<ModalComponent
				title={<h3 className='text-white mb-6 text-lg font-semibold md:font-bold md:text-xl'>Signatories</h3>}
				onCancel={() => setShowSignatories(false)}
				open={showSignatories}
			>
				<>
					{uploaded.map((item, i) => (
						<div
							key={i}
							className=' flex justify-between text-sm mb-3 font-normal leading-[15px] outline-0 p-3 border-2 border-dashed border-[#505050] rounded-lg text-white'
						>
							{item}
							<button
								className='text-primary'
								onClick={() => copyText(item, true, network)}
							>
								<CopyIcon className='w-5' />
							</button>
						</div>
					))}
				</>
			</ModalComponent>
			<div className='flex justify-between mb-1'>
				<h1 className='text-primary'>Signatories List</h1>
				{uploaded.length > 0 && (
					<Button
						onClick={() => setShowSignatories(true)}
						className='bg-primary border-none outline-none text-white w-fit'
					>
						<p className='font-normal text-sm'>Show Signatories</p>
					</Button>
				)}
			</div>
			<Dragger
				// eslint-disable-next-line react/jsx-props-no-spreading
				{...props}
				className='w-[45vw] bg-bg-secondary rounded-md p-4 my-3'
			>
				<p className='ant-upload-drag-icon'>
					<UploadBoxIcon className='my-2' />
				</p>
				<p className='ant-upload-text text-white'>Drag and Drop JSON file to upload</p>
				<p className='text-text_secondary'>OR</p>
				<Button className='mt-3 bg-primary text-primary border-none bg-opacity-10'>Browse</Button>
			</Dragger>
		</div>
	);
};

export default DragDrop;
