import AddressComponent from '@next-common/ui-components/AddressComponent';
import Balance from '@next-common/ui-components/Balance';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { Button, Dropdown, Form, Input } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import React from 'react';
import { InboxOutlined } from '@ant-design/icons';

interface ICreateCollectionForm {
	handleSubmit: any;
	onFileChange: any;
	loading: boolean;
	selectedMultisig: string;
	setSelectedMultisig: any;
	setIsProxy: any;
	setSelectedProxyName: any;
	setMultisigBalance: any;
	isProxy: boolean;
	selectedProxyName: string;
	network: string;
	multisigOptions: any[];
	apis: any;
	collection: Array<any>;
}

function CreateCollectionForm({
	handleSubmit,
	collection,
	onFileChange,
	loading,
	selectedMultisig,
	setSelectedMultisig,
	setIsProxy,
	setSelectedProxyName,
	setMultisigBalance,
	isProxy,
	selectedProxyName,
	network,
	multisigOptions,
	apis
}: ICreateCollectionForm) {
	return (
		<>
			{collection.length === 0 && (
				<p className='text-red-500 text-xs p-0 m-0'>
					You don&apos;t have any collection, Collection is mandatory to create NFY
				</p>
			)}
			<Form
				className='flex flex-col gap-4'
				layout='vertical'
				onFinish={handleSubmit}
			>
				<div className='flex items-center gap-x-[10px] mt-[14px] max-sm:flex-col'>
					<article className='w-full max-sm:w-full'>
						<p className='text-primary font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'>
							Creating from
							<Balance
								api={apis?.[network]?.api}
								apiReady={apis?.[network]?.apiReady || false}
								network={network}
								onChange={setMultisigBalance}
								address={selectedMultisig}
							/>
						</p>
						<Dropdown
							trigger={['click']}
							className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer max-sm:w-full'
							menu={{
								items: multisigOptions,
								onClick: (e) => {
									const data = JSON.parse(e.key);
									setSelectedMultisig(data?.isProxy ? data?.proxy : data?.address);
									setIsProxy(data?.isProxy);
									setSelectedProxyName(data.name);
								}
							}}
						>
							<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
								<AddressComponent
									isMultisig
									isProxy={isProxy}
									name={selectedProxyName}
									showNetworkBadge
									network={network}
									withBadge={false}
									address={selectedMultisig}
								/>
								<CircleArrowDownIcon className='text-primary' />
							</div>
						</Dropdown>
					</article>
				</div>

				<article className='w-full'>
					<Form.Item
						className='border-0 outline-0 my-0 p-0'
						name='name'
						rules={[{ message: 'Please input the name of the NFT!', required: true }]}
					>
						<div className='items-center'>
							<label className='text-primary font-normal text-xs block mb-2'>Collection Name</label>
							<Input
								placeholder='Enter NFT name'
								className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
							/>
						</div>
					</Form.Item>
				</article>
				<article className='w-full'>
					<Form.Item
						name='description'
						rules={[]}
						className='border-0 outline-0 my-0 p-0'
					>
						<label className='text-primary font-normal text-xs block mb-2'>Collection Description</label>
						<div className='flex items-center h-[40px]'>
							<Input.TextArea
								placeholder='Description'
								className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
								id='Description'
								rows={2}
							/>
						</div>
					</Form.Item>
				</article>

				<Form.Item>
					<label className='text-primary font-normal text-xs block mb-4'>Collection Image</label>
					<Dragger
						multiple={false}
						beforeUpload={() => false}
						onChange={onFileChange}
					>
						<div className='w-full p-2'>
							<p className='ant-upload-drag-icon'>
								<InboxOutlined />
							</p>
							<p className='ant-upload-text text-text_main'>Click or drag file to this area to upload</p>
							<p className='ant-upload-hint text-text_placeholder'>
								Support for a single upload. Strictly prohibit from uploading company data or other band files
							</p>
						</div>
					</Dragger>
				</Form.Item>
				<Button
					htmlType='submit'
					className='flex items-center justify-center gap-x-[10.83px] border-none outline-none text-sm bg-primary text-white rounded-lg min-w-[120px]'
					disabled={loading}
				>
					Create NFT
				</Button>
			</Form>
		</>
	);
}

export default CreateCollectionForm;
