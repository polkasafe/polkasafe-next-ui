import Modal from '@common/global-ui-components/Modal';
import React, { useState } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import AddCategorySubfieldForm from '@common/modals/AddCategorySubfield/AddCategorySubfieldForm';
import { ITransactionCategorySubfields } from '@common/types/substrate';
import { ETransactionFieldsUpdateType } from '@common/enum/substrate';
import { Button } from 'antd';

const AddCategorySubfield = ({
	loading,
	onSave
}: {
	loading: boolean;
	onSave: (
		updateType: ETransactionFieldsUpdateType,
		fieldName: string,
		fieldDesc: string,
		subfields?: ITransactionCategorySubfields,
		onCancel?: () => void
	) => Promise<void>;
}) => {
	const [openModal, setOpenModal] = useState(false);

	return (
		<div>
			<Button
				icon={<PlusCircleOutlined className='text-primary' />}
				className='my-2 bg-transparent p-0 border-none shadow-none outline-none text-primary text-sm flex items-center'
				onClick={() => setOpenModal(true)}
			>
				Add Sub-Field
			</Button>
			<Modal
				open={openModal}
				onCancel={() => {
					setOpenModal(false);
				}}
				title='Add Sub-Field'
			>
				<AddCategorySubfieldForm
					loading={loading}
					onSave={onSave}
					onCancel={() => setOpenModal(false)}
				/>
			</Modal>
		</div>
	);
};

export default AddCategorySubfield;
