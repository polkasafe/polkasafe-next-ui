// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { useState } from 'react';

import { ITransactionCategorySubfields, ITransactionFields } from '@common/types/substrate';
import AddCategorySubfield from '@common/modals/AddCategorySubfield';
import { ETransactionFieldsUpdateType } from '@common/enum/substrate';
import { ConfirmationModal } from '@common/modals/ConfirmationModal';
import { DeleteIcon } from '@common/global-ui-components/Icons';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';

const DeleteFieldModal = ({
	className,
	subfield,
	category,
    handleRemove
}: {
	className?: string;
	subfield: string;
	category: string;
    handleRemove: (onCancel: () => void) => void
}) => {
	const [openDeleteFieldModal, setOpenDeleteFieldModal] = useState(false);
    const onCancel = () => setOpenDeleteFieldModal(false);
	return (
		<>
			<Button
				onClick={() => setOpenDeleteFieldModal(true)}
                variant={EButtonVariant.DANGER}
                size='middle'
                className='px-2'
			>
				<DeleteIcon />
			</Button>
			<ConfirmationModal
				openModal={openDeleteFieldModal}
				setOpenModal={setOpenDeleteFieldModal}
				title='Delete Sub-field'
				message={`Are you sure you want to delete ${subfield}`}
				onSubmit={() => handleRemove(onCancel)}
			/>
		</>
	);
};

const SubfieldsList = ({ className, category, transactionFields, loading, onSave }: { className?: string; category: string, transactionFields: ITransactionFields; loading: boolean; onSave: (updateType: ETransactionFieldsUpdateType, fieldName: string, fieldDesc: string, subfields?: ITransactionCategorySubfields, onCancel?: () => void) => Promise<void> }) => {
	return (
		<div className='text-sm font-medium leading-[15px] flex flex-col flex-1 overflow-y-auto'>
			<article className='grid grid-cols-5 gap-x-5 bg-bg-secondary text-text-secondary py-5 px-4 rounded-lg'>
				<span className='col-span-2'>Sub-Field Name</span>
				<span className='col-span-2'>Sub-Field Type</span>
				<span className='col-span-1'>Action</span>
			</article>
            <div className='flex-1 overflow-y-auto'>
                {category === 'none' ? (
                    <section className='my-4 text-sm w-full text-white font-normal flex justify-center'>
                        This Category cannot be Customized.
                    </section>
                ) : transactionFields[category] && !Object.keys(transactionFields[category].subfields).length ? (
                    <section className='my-4 text-sm w-full text-white font-normal flex justify-center'>
                        Please add Sub-Fields to this Category.
                    </section>
                ) : (
                    transactionFields[category] &&
                    transactionFields[category].subfields &&
                    Object.keys(transactionFields[category].subfields).map((subfield, index) => {
                        const subfieldObject = transactionFields[category].subfields[subfield];
                        return (
                            <article key={index}>
                                <div className='grid grid-cols-5 gap-x-5 py-6 px-4 text-white'>
                                    <div className='sm:w-auto overflow-hidden text-ellipsis col-span-2 flex items-center text-base'>
                                        {subfieldObject.subfieldName}
                                    </div>
                                    <div className='col-span-2 flex items-center gap-x-[10px]'>{subfieldObject.subfieldType}</div>
                                    <div className='col-span-1 flex items-center gap-x-[10px]'>
									<DeleteFieldModal
										category={category}
										subfield={subfield}
										className={className}
                                        handleRemove={(onCancel) => {
                                            const newTransactionFields = { ...transactionFields };
                                            const newSubfields = { ...newTransactionFields[category].subfields };
                                            delete newSubfields[subfield];

                                            onSave(ETransactionFieldsUpdateType.DELETE_SUBFIELD, '', '', newSubfields, onCancel);
                                        }}
									/>
								</div>
                                </div>
                                {Object.keys(transactionFields[category].subfields).length - 1 !== index ? (
                                    <Divider className='my-0' />
                                ) : null}
                            </article>
                        );
                    })
                )}
                {category !== 'none' && (
                    <AddCategorySubfield loading={loading} onSave={onSave} />
                )}
            </div>
		</div>
	);
};

export default SubfieldsList;
