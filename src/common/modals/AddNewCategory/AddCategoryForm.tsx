// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Spin } from 'antd';
import React, { useState } from 'react';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import Input from '@common/global-ui-components/Input';
import { ActionButtons } from '@common/global-ui-components/ActionButtons';
import { ITransactionCategorySubfields } from '@common/types/substrate';
import { ETransactionFieldsUpdateType } from '@common/enum/substrate';

const AddNewCategoryForm = ({
	className,
	onCancel,
    loading,
    onSave
}: {
	className?: string;
	onCancel: () => void;
    loading: boolean;
    onSave: (updateType: ETransactionFieldsUpdateType, fieldName: string, fieldDesc: string, subfields?: ITransactionCategorySubfields, onCancel?: () => void) => Promise<void>;
}) => {
	const [fieldName, setFieldName] = useState<string>('');
	const [fieldDesc, setFieldDesc] = useState<string>('');

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
					</section>

					<section className='mt-10'>
						<ActionButtons label='Save' loading={loading} onClick={() => onSave(ETransactionFieldsUpdateType.ADD_CATEGORY, fieldName, fieldDesc, undefined, onCancel)} onCancel={onCancel} disabled={!fieldName}  />
					</section>
				</Form>
			</div>
		</Spin>
	);
};

export default AddNewCategoryForm;
