// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useState } from 'react';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import AddCustomField from './AddCustomField';
import SubfieldsList from './SubfieldsList';

const TransactionFields = () => {
	const { address: userAddress } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { transactionFields } = activeOrg;
	const [openAddCustomFieldModal, setOpenAddCustomFieldModal] = useState(false);
	const [category, setCategory] = useState<string>(Object.keys(transactionFields)[0] || 'none');

	return (
		<div>
			<ModalComponent
				onCancel={() => setOpenAddCustomFieldModal(false)}
				title={
					<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl capitalize'>Add Category</h3>
				}
				open={openAddCustomFieldModal}
			>
				<AddCustomField
					setCatgory={setCategory}
					onCancel={() => setOpenAddCustomFieldModal(false)}
				/>
			</ModalComponent>
			{!userAddress ? (
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>Looks like you are not Logged in. Please Log in to use our Features.</p>
				</section>
			) : (
				<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>
					<section className='mb-2'>
						<p className='text-white text-lg'>Categories</p>
					</section>
					<section className='mb-4 text-sm w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
						<p>
							Categories enable your team to organize payments and transactions with context, such as tags, dates,
							attachments, etc. They generate financial reports, offer insights, and facilitate filtering, sorting, and
							searching of financial data. You can customize category names and data types to suit your
							organization&apos;s needs.
						</p>
					</section>
					<section className='flex items-center justify-between flex-col gap-5 md:flex-row mb-6'>
						<div className='flex-1 flex items-center gap-x-3'>
							{Object.keys(transactionFields)
								.filter((field) => field !== 'none')
								.map((field) => (
									<Button
										onClick={() => setCategory(field)}
										className={` border border-solid ${
											category === field
												? 'border-primary text-primary bg-highlight'
												: 'text-text_secondary border-text_secondary'
										} rounded-xl px-[10px] py-1`}
										key='field'
									>
										{transactionFields[field].fieldName}
									</Button>
								))}
							<Button
								onClick={() => setCategory('none')}
								className={` border border-solid ${
									category === 'none'
										? 'border-primary text-primary bg-highlight'
										: 'text-text_secondary border-text_secondary'
								} rounded-xl px-[10px] py-1`}
								key='field'
							>
								{transactionFields.none.fieldName}
							</Button>
						</div>
						<Button
							onClick={() => setOpenAddCustomFieldModal(true)}
							size='large'
							className='outline-none border-none text-xs md:text-sm font-medium bg-primary text-white rounded-md md:rounded-lg flex items-center gap-x-3'
						>
							<PlusCircleOutlined />
							<span>Add New Category</span>
						</Button>
					</section>
					<section>
						<SubfieldsList category={category} />
					</section>
				</div>
			)}
		</div>
	);
};

export default TransactionFields;
