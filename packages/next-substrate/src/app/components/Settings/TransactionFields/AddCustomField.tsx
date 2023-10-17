// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input, Spin } from 'antd';
import React, { useState } from 'react';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import ModalBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';

const AddCustomField = ({
	className,
	onCancel,
	setCatgory
}: {
	className?: string;
	onCancel: () => void;
	setCatgory: React.Dispatch<React.SetStateAction<string>>;
}) => {
	const [loading, setLoading] = useState(false);

	const [fieldName, setFieldName] = useState<string>('');
	const [fieldDesc, setFieldDesc] = useState<string>('');
	const { setUserDetailsContextState, transactionFields } = useGlobalUserDetailsContext();

	const handleSave = async () => {
		try {
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
			} else {
				setLoading(true);

				const { data: updateTransactionFieldsData, error: updateTransactionFieldsError } =
					await nextApiClientFetch<string>(`${SUBSTRATE_API_URL}/updateTransactionFields`, {
						transactionFields: {
							...transactionFields,
							[fieldName.toLowerCase().split(' ').join('_')]: {
								fieldDesc,
								fieldName,
								subfields: {}
							}
						}
					});

				if (updateTransactionFieldsError) {
					queueNotification({
						header: 'Failed!',
						message: updateTransactionFieldsError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if (updateTransactionFieldsData) {
					queueNotification({
						header: 'Success!',
						message: 'Transaction Fields Updated.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[fieldName.toLowerCase().split(' ').join('_')]: {
								fieldDesc,
								fieldName,
								subfields: {}
							}
						}
					}));
					setLoading(false);
					setCatgory(fieldName.toLowerCase().split(' ').join('_'));
					onCancel();
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Transaction Fields.',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={200}
					message={`Updating your ${fieldName} field...`}
				/>
			}
		>
			<div className={className}>
				<Form disabled={loading}>
					<section className='max-h-[75vh] overflow-y-auto'>
						<div className='flex flex-col gap-y-3 mb-4'>
							<label
								className='text-primary text-xs leading-[13px] font-normal'
								htmlFor='name'
							>
								Category Name*
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
									onChange={(e) => setFieldName(e.target.value)}
									value={fieldName}
								/>
							</Form.Item>
						</div>
						<div className='flex flex-col gap-y-3 mb-4'>
							<label
								className='text-primary text-xs leading-[13px] font-normal'
								htmlFor='description'
							>
								Category Description
							</label>
							<Form.Item
								name='description'
								className='border-0 outline-0 my-0 p-0'
							>
								<Input
									placeholder='Give the address a name'
									className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
									id='description'
									onChange={(e) => setFieldDesc(e.target.value)}
									value={fieldDesc}
								/>
							</Form.Item>
						</div>

						{/* {subfields && subfields.map((subfield, i) => (
								<div key={i} className='flex flex-col gap-y-3'>
									<div className='flex items-center justify-between'>
										<span className='text-white text-sm' >Sub-Field Details</span>
										<Button icon={<MinusCircleOutlined className='text-primary' />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center' onClick={() => onRemoveSubfield(i)} >Remove Sub-Field</Button>
									</div>
									<div className="flex flex-col gap-y-3 mb-4">
										<label
											className="text-primary text-xs leading-[13px] font-normal"
											htmlFor="name"
										>
										Sub-Field Name*
										</label>
										<Form.Item
											name={`sub-field-${i+1}`}
											rules={[
												{
													message: 'Required',
													required: true
												}
											]}
											className='border-0 outline-0 my-0 p-0'
										>
											<Input
												placeholder="Give the address a name"
												className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
												id={`sub-field-${i+1}`}
												onChange={(e) => onSubfieldNameChange(e.target.value, i)}
												value={subfield.name}
											/>
										</Form.Item>
									</div>
									<div className='flex flex-col gap-y-3 mb-4'>
										<p className='text-primary font-normal text-xs leading-[13px]'>Sub-Field Type</p>
										<Dropdown
											trigger={['click']}
											className={`border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer ${className}`}
											menu={{
												items: fieldTypeOptions,
												onClick: (e) => {
													onSubfieldTypeChange(e.key as any, i);
												}
											}}
										>
											<div className="flex justify-between items-center text-white">
												{subfield.subfieldType}
												<CircleArrowDownIcon className='text-primary' />
											</div>
										</Dropdown>
									</div>
									<div className='mb-4 flex items-center gap-x-2'>
										<p className='text-primary font-normal text-xs leading-[13px]'>Required</p>
										<Switch size='small' className='w-auto' checked={subfield.required} onChange={(checked) => onSubfieldRequiredChange(checked, i)} />
									</div>
								</div>
							))} */}
						{/* <Button icon={<PlusCircleOutlined className='text-primary' />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center' onClick={onAddSubfield} >Add Sub-Field</Button> */}
					</section>

					<section className='flex items-center gap-x-5 justify-between mt-10'>
						<CancelBtn
							loading={loading}
							className='w-[200px]'
							onClick={onCancel}
						/>
						<ModalBtn
							disabled={!fieldName}
							loading={loading}
							onClick={handleSave}
							className='w-[200px]'
							title='Save'
						/>
					</section>
				</Form>
			</div>
		</Spin>
	);
};

export default AddCustomField;
