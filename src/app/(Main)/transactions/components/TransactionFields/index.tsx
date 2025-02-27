'use client';

import './style.css';

import { Divider, Dropdown, Input, Tooltip } from 'antd';
import React, { useState } from 'react';
import EditTransactionFieldsModal from './EditTransactionFieldsModal';
import { IOrganisation, ITransactionFields, ITxnCategory } from '@common/types/substrate';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { NotificationStatus } from '@common/enum/substrate';
import Modal from '@common/global-ui-components/Modal';
import Loader from '@common/global-ui-components/Loder';
import { ArrowRightCircle, CircleArrowDownIcon, WarningCircleIcon } from '@common/global-ui-components/Icons';
import { addNewCategory } from '@sdk/polkasafe-sdk/src/add-new-category';
import { updateTransaction } from '@sdk/polkasafe-sdk/src/transaction/callhash';

export const generateCategoryKey = (category: string) => {
	if (!category) return '';
	return category.toLowerCase().split(' ').join('_');
};

export const checkCategoryNeededSubfields = (
	userTransactionFields: ITransactionFields,
	txnCategoryfields: ITxnCategory
) => {
	const category = generateCategoryKey(txnCategoryfields.category);
	return (
		userTransactionFields[category]?.subfields &&
		Object.keys(userTransactionFields[category].subfields).length > 0 &&
		Object.keys(txnCategoryfields.subfields).length === 0
	);
};

const TransactionFields = ({
	category,
	callHash,
	setCategory,
	transactionFieldsObject,
	setTransactionFieldsObject,
	network,
	initiator,
	maxWidth
}: {
	category: string;
	callHash: string;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	transactionFieldsObject: ITxnCategory;
	setTransactionFieldsObject: React.Dispatch<React.SetStateAction<ITxnCategory>>;
	network: string;
	initiator: boolean;
	maxWidth?: number;
}) => {
	const [user] = useUser();
	const [organisation, setOrgananisation] = useOrganisation();

	const userTransactionFields = organisation?.transactionFields || {};

	const [loadingCategoryChange, setLoadingCategoryChange] = useState(false);

	const [openUpdateTransactionCategoryModal, setOpenUpdateTransactionCategoryModal] = useState<boolean>(false);

	const [newCategory, setNewCategory] = useState<string>('');

	const updateOrgTransactionFields = async (c: string) => {
		try {
			if (!user || !organisation?.id || !userTransactionFields || Object.keys(userTransactionFields).includes(generateCategoryKey(c))) {
				console.log('ERROR');
			} else {
				const { data } = (await addNewCategory({ address: user.address, signature: user.signature, organisationId: organisation.id, 
					transactionFields: {
						...userTransactionFields,
						[generateCategoryKey(c)]: {
							fieldDesc: '',
							fieldName: c,
							subfields: {}
						}
					}
				})) as { data: string };

				// if (updateTransactionFieldsError) {
				// 	queueNotification({
				// 		header: 'Error!',
				// 		message: 'There was some problem adding custom category to Organisation',
				// 		status: NotificationStatus.ERROR
				// 	});
				// 	return;
				// }

				if (data) {
					setOrgananisation({
						...organisation,
						transactionFields: {
							...organisation.transactionFields,
							[generateCategoryKey(c)]: {
								fieldDesc: '',
								fieldName: c,
								subfields: {}
							}
						}
					});
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Transaction Fields.',
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleUpdateTransactionCategory = async (c: string, newCat?: boolean) => {
		try {
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!user || !category || category === generateCategoryKey(c)) {
				console.log('ERROR');
				return;
			}
			setLoadingCategoryChange(true);

			const { data } = (await updateTransaction({ address: user.address, signature: user.signature, callhash: callHash,
				transaction: { transactionFields: { category: c, subfields: {} } }
			})) as { data: string };

			// if (updateTransactionFieldsError) {
			// 	queueNotification({
			// 		header: 'Failed!',
			// 		message: updateTransactionFieldsError,
			// 		status: NotificationStatus.ERROR
			// 	});
			// 	setLoadingCategoryChange(false);
			// 	return;
			// }

			if (data) {
				setCategory(generateCategoryKey(c));
				setNewCategory('');
				queueNotification({
					header: 'Success!',
					message: 'Transaction Fields Updated.',
					status: NotificationStatus.SUCCESS
				});
				if (newCat) {
					await updateOrgTransactionFields(c);
				}
				setLoadingCategoryChange(false);
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Transaction Fields.',
				status: NotificationStatus.ERROR
			});
			setLoadingCategoryChange(false);
		}
	};

	return (
		<div>
			<Modal
				title='Update Transaction Category'
				open={openUpdateTransactionCategoryModal}
				onCancel={() => setOpenUpdateTransactionCategoryModal(false)}
			>
				<EditTransactionFieldsModal
					userAddress={user?.address || ''}
					userSignature={user?.signature || ''}
					organisation={organisation || {} as IOrganisation}
					onCancel={() => setOpenUpdateTransactionCategoryModal(false)}
					callHash={callHash}
					defaultCategory={category}
					defaultTransactionFields={{
						...transactionFieldsObject,
						category: generateCategoryKey(transactionFieldsObject?.category)
					}}
					setTransactionFields={setTransactionFieldsObject}
				/>
			</Modal>
			{initiator ? (
				<div className='flex gap-x-2 items-center'>
					<Dropdown
						disabled={loadingCategoryChange}
						trigger={['click']}
						destroyPopupOnHide
						menu={{
							items: [
								...Object.keys(userTransactionFields)
									.filter((c) => c !== 'none')
									.filter((c) =>
										newCategory
											? userTransactionFields[c].fieldName.toLowerCase().includes(newCategory.toLowerCase(), 0)
											: true
									)
									.filter((_, i) => i <= 4)
									.map((c) => {
										return {
											disabled: userTransactionFields[c]?.fieldName === transactionFieldsObject?.category,
											key: userTransactionFields[c]?.fieldName,
											label: (
												<span
													className={`flex justify-between gap-x-2 items-center ${
														userTransactionFields[c]?.fieldName === transactionFieldsObject?.category
															? 'text-label'
															: 'text-white'
													}`}
												>
													{userTransactionFields[c]?.fieldName}{' '}
												</span>
											)
										};
									})
							],
							onClick: (e) => {
								setTransactionFieldsObject({
									category: e.key,
									subfields: {}
								});
								handleUpdateTransactionCategory(e.key);
							}
						}}
						// eslint-disable-next-line react/no-unstable-nested-components
						dropdownRender={(menu) => (
							<div className='custom-dropdown border border-primary rounded-xl bg-bg-secondary'>
								{newCategory &&
								!Object.keys(userTransactionFields).some((c) =>
									userTransactionFields[c].fieldName.toLowerCase().includes(newCategory.toLowerCase(), 0)
								) ? (
									<div className='text-primary p-3 text-sm font-medium truncate'>+ {newCategory}</div>
								) : (
									React.cloneElement(menu as React.ReactElement)
								)}
								<Divider className='m-0 border-text_secondary' />
								<div className='p-2'>
									<Input
										placeholder='Add new category'
										disabled={loadingCategoryChange}
										className='w-full text-sm font-normal leading-[15px] border-none outline-none p-2 placeholder:text-[#505050] bg-bg-main rounded-lg text-white resize-none'
										value={newCategory}
										onKeyUp={(e) => {
											e.stopPropagation();
											if (e.key === 'Enter' && newCategory) {
												setTransactionFieldsObject({
													category: newCategory,
													subfields: {}
												});
												handleUpdateTransactionCategory(newCategory, true);
											}
										}}
										onChange={(e) => {
											setNewCategory(e.target.value);
										}}
									/>
								</div>
							</div>
						)}
					>
						<div className={'flex'}>
							<div
								className={`${maxWidth ? `max-w-[${maxWidth}px]` : ''} border-[0.5px] ${
									!transactionFieldsObject?.category || transactionFieldsObject?.category === 'none'
										? 'border-light-red text-failure'
										: 'border-waiting text-waiting'
								} rounded-2xl p-2 bg-bg-secondary cursor-pointer flex items-center gap-x-3`}
							>
								<span className='truncate text-xs capitalize'>
									{!transactionFieldsObject?.category || transactionFieldsObject?.category === 'none'
										? 'Category'
										: transactionFieldsObject?.category}
								</span>
								{loadingCategoryChange ? <Loader size={'small' as any} /> : <CircleArrowDownIcon />}
							</div>
						</div>
					</Dropdown>
					{checkCategoryNeededSubfields(userTransactionFields, transactionFieldsObject) && (
						<Tooltip
							title={
								<div className='text-text_secondary text-xs flex gap-x-2 items-center'>
									<div>Subcategory Needed</div>
									<div
										className='text-primary cursor-pointer'
										onClick={() => setOpenUpdateTransactionCategoryModal(true)}
									>
										<ArrowRightCircle className='text-xs' />
									</div>
								</div>
							}
						>
							<WarningCircleIcon className='text-base' />
						</Tooltip>
					)}
				</div>
			) : (
				!transactionFieldsObject?.category || transactionFieldsObject?.category === 'none' ? null :
				<div className='flex gap-x-2'>
					<div
						className={`${maxWidth ? `max-w-[${maxWidth}px]` : ''} border-[0.5px] ${
							!transactionFieldsObject?.category || transactionFieldsObject?.category === 'none'
								? 'border-light-red text-failure'
								: 'border-waiting text-waiting'
						} rounded-2xl p-2 bg-bg-secondary flex items-center gap-x-3`}
					>
						<span className='truncate text-xs capitalize'>
							{!transactionFieldsObject?.category || transactionFieldsObject?.category === 'none'
								? 'Category'
								: transactionFieldsObject?.category}
						</span>
					</div>
					<Tooltip
						title={<span className='text-text-secondary text-xs flex gap-x-2 items-center'>You are not the Owner</span>}
					>
						<WarningCircleIcon className='text-base' />
					</Tooltip>
				</div>
			)}
		</div>
	);
};

export default TransactionFields;
