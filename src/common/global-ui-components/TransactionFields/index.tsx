// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import ModalComponent from '@next-common/ui-components/ModalComponent';
// import AddCustomField from './AddCustomField';
import { ITransactionCategorySubfields, ITransactionFields } from '@common/types/substrate';
import AddNewCategory from '@common/modals/AddNewCategory';
import SubfieldList from '@common/global-ui-components/TransactionFields/SubfieldList';
import { ETransactionFieldsUpdateType } from '@common/enum/substrate';
import { Button } from 'antd';

const TransactionFields = ({
	transactionFields,
	onSave,
	loading,
	category,
	setCategory
}: {
	category: string;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	loading: boolean;
	transactionFields: ITransactionFields;
	onSave: (
		updateType: ETransactionFieldsUpdateType,
		fieldName: string,
		fieldDesc: string,
		subfields?: ITransactionCategorySubfields,
		onCancel?: () => void
	) => Promise<void>;
}) => {
	return (
		<div className='px-4 flex flex-col flex-1 overflow-y-hidden'>
			<section className='flex items-center justify-between flex-col gap-5 md:flex-row mb-6'>
				<div className='flex-1 flex items-center gap-3 flex-wrap'>
					{Object.keys(transactionFields)
						.filter((field) => field !== 'none')
						.map((field) => (
							<Button
								onClick={() => setCategory(field)}
								className={`text-xs border border-solid ${
									category === field
										? 'border-primary text-primary bg-highlight'
										: 'text-text-secondary border-text-secondary'
								} rounded-xl px-[10px] py-1`}
								key='field'
							>
								{transactionFields[field].fieldName}
							</Button>
						))}
					<Button
						onClick={() => setCategory('none')}
						className={`text-xs border border-solid ${
							category === 'none'
								? 'border-primary text-primary bg-highlight'
								: 'text-text-secondary border-text-secondary'
						} rounded-xl px-[10px] py-1`}
						key='field'
					>
						{transactionFields.none.fieldName}
					</Button>
				</div>
				<AddNewCategory
					loading={loading}
					onSave={onSave}
				/>
			</section>
			<section className='flex flex-col flex-1 overflow-y-hidden'>
				<SubfieldList
					loading={loading}
					onSave={onSave}
					transactionFields={transactionFields}
					category={category}
				/>
			</section>
		</div>
	);
};

export default TransactionFields;
