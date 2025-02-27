// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Form, Spin, Button } from 'antd';
import React, { useState } from 'react';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import Input from '@common/global-ui-components/Input';
import { ActionButtons } from '@common/global-ui-components/ActionButtons';
import { EFieldType, ITransactionCategorySubfields } from '@common/types/substrate';
import { ETransactionFieldsUpdateType } from '@common/enum/substrate';
import { Dropdown } from '@common/global-ui-components/Dropdown';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';

const AddCategorySubfieldForm = ({
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

    const [subfields, setSubfields] = useState<{ name: string; subfieldType: EFieldType }[]>([
		{ name: '', subfieldType: EFieldType.SINGLE_SELECT }
	]);

	const fieldTypeOptions = Object.values(EFieldType)
		.filter((key) => key !== EFieldType.ATTACHMENT)
		.map((key) => ({
			key,
			label: <span className='text-white'>{key}</span>
		}));

	const onSubfieldNameChange = (value: string, i: number) => {
		setSubfields((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.name = value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onSubfieldTypeChange = (type: EFieldType, i: number) => {
		setSubfields((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.subfieldType = type;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddSubfield = () => {
		setSubfields((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ name: '', subfieldType: EFieldType.SINGLE_SELECT });
			return copyOptionsArray;
		});
	};

	const onRemoveSubfield = (i: number) => {
		const copyOptionsArray = [...subfields];
		copyOptionsArray.splice(i, 1);
		setSubfields(copyOptionsArray);
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={200}
					message={`Updating Your Category Subfields`}
				/>
			}
		>
			<div className={className}>
            <Form disabled={loading}>
					<section className='max-h-[75vh] overflow-y-auto'>
						{subfields &&
							subfields.map((subfield, i) => (
								<div
									key={i}
									className='flex flex-col gap-y-3'
								>
									{i !== 0 && (
										<div className='flex items-center justify-between'>
											<span className='text-white text-sm'>Sub-Field Details</span>
											<Button
												icon={<MinusCircleOutlined className='text-primary' />}
												className='bg-transparent p-0 border-none shadow-none outline-none text-primary text-sm flex items-center'
												onClick={() => onRemoveSubfield(i)}
											>
												Remove Sub-Field
											</Button>
										</div>
									)}
									<div className='flex flex-col gap-y-3 mb-4'>
										<label
											className='text-primary text-xs leading-[13px] font-normal'
											htmlFor='name'
										>
											Sub-Field Name*
										</label>
										<Form.Item
											name={`sub-field-add-${i + 1}`}
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
												id={`sub-field-add-${i + 1}`}
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
											<div className='flex justify-between items-center text-white'>
												{subfield.subfieldType}
												<CircleArrowDownIcon className='text-primary' />
											</div>
										</Dropdown>
									</div>
								</div>
							))}
						<Button
							icon={<PlusCircleOutlined className='text-primary' />}
							className='bg-transparent shadow-none p-0 border-none outline-none text-primary text-sm flex items-center'
							onClick={onAddSubfield}
						>
							Add Sub-Field
						</Button>
					</section>

                    <section className='mt-10'>
						<ActionButtons label='Save' loading={loading} onClick={() => {
                            const subfieldsObject: ITransactionCategorySubfields = {};
                            if (subfields) {
                                subfields.forEach((item) => {
                                    subfieldsObject[`${item.name.toLowerCase().split(' ').join('_')}`] = {
                                        subfieldName: item.name,
                                        subfieldType: item.subfieldType
                                    };
                                });
                            }
                            onSave(ETransactionFieldsUpdateType.ADD_SUBFIELD, '', '', subfieldsObject, onCancel)
                        }} onCancel={onCancel} disabled={!subfields}  />
					</section>
				</Form>
			</div>
		</Spin>
	);
};

export default AddCategorySubfieldForm;
