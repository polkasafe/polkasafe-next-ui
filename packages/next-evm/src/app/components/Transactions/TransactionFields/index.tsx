import './style.css';

import { ITransactionFields, ITxnCategory, NotificationStatus } from '@next-common/types';
import { ArrowRightCircle, CircleArrowDownIcon, WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { Divider, Dropdown, Input, Tooltip } from 'antd';
import React, { useState } from 'react';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { useWallets } from '@privy-io/react-auth';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { NETWORK } from '@next-common/global/evm-network-constants';
import EditTransactionFieldsModal from './EditTransactionFieldsModal';

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
	multisigAddress,
	network,
	setCategory,
	transactionFieldsObject,
	setTransactionFieldsObject
}: {
	category: string;
	callHash: string;
	multisigAddress: string;
	network: NETWORK;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	transactionFieldsObject: ITxnCategory;
	setTransactionFieldsObject: React.Dispatch<React.SetStateAction<ITxnCategory>>;
}) => {
	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const { userID } = useGlobalUserDetailsContext();
	const { activeOrg, setActiveOrg } = useActiveOrgContext();
	const { transactionFields: userTransactionFields } = activeOrg;
	const [loadingCategoryChange, setLoadingCategoryChange] = useState(false);

	const [openUpdateTransactionCategoryModal, setOpenUpdateTransactionCategoryModal] = useState<boolean>(false);

	const [newCategory, setNewCategory] = useState<string>('');

	const updateOrgTransactionFields = async (c: string) => {
		try {
			if (!userID || !activeOrg?.id) {
				console.log('ERROR');
			} else {
				const updateTransactionFieldsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransactionFieldsEth`, {
					body: JSON.stringify({
						organisationId: activeOrg.id,
						transactionFields: {
							...userTransactionFields,
							[generateCategoryKey(c)]: {
								fieldDesc: '',
								fieldName: c,
								subfields: {}
							}
						}
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: updateTransactionFieldsData, error: updateTransactionFieldsError } =
					(await updateTransactionFieldsRes.json()) as {
						data: string;
						error: string;
					};

				if (updateTransactionFieldsError) {
					queueNotification({
						header: 'Error!',
						message: 'There was some problem adding custom category to Organisation',
						status: NotificationStatus.ERROR
					});
					return;
				}

				if (updateTransactionFieldsData) {
					setActiveOrg((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[generateCategoryKey(c)]: {
								fieldDesc: '',
								fieldName: c,
								subfields: {}
							}
						}
					}));
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

			if (!userID || !category || category === generateCategoryKey(c) || !connectedWallet) {
				console.log('ERROR');
				return;
			}
			setLoadingCategoryChange(true);

			const updateTransactionFieldsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransactionCategoriesEth`, {
				body: JSON.stringify({
					callHash,
					multisigAddress,
					network,
					transactionFields: { category: c, subfields: {} }
				}),
				headers: firebaseFunctionsHeader(connectedWallet.address),
				method: 'POST'
			});
			const { data: updateTransactionFieldsData, error: updateTransactionFieldsError } =
				(await updateTransactionFieldsRes.json()) as {
					data: string;
					error: string;
				};

			if (updateTransactionFieldsError) {
				queueNotification({
					header: 'Failed!',
					message: updateTransactionFieldsError,
					status: NotificationStatus.ERROR
				});
				setLoadingCategoryChange(false);
				return;
			}

			if (updateTransactionFieldsData) {
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
		<div
			onKeyDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
			className='flex gap-x-2 items-center'
		>
			<ModalComponent
				title='Update Transaction Category'
				open={openUpdateTransactionCategoryModal}
				onCancel={() => setOpenUpdateTransactionCategoryModal(false)}
			>
				<EditTransactionFieldsModal
					onCancel={() => setOpenUpdateTransactionCategoryModal(false)}
					multisigAddress={multisigAddress}
					network={network}
					callHash={callHash}
					defaultCategory={category}
					defaultTransactionFields={{
						...transactionFieldsObject,
						category: generateCategoryKey(transactionFieldsObject?.category)
					}}
					setTransactionFields={setTransactionFieldsObject}
				/>
			</ModalComponent>
			<Dropdown
				disabled={loadingCategoryChange}
				trigger={['click']}
				menu={{
					items: [
						...Object.keys(userTransactionFields)
							.filter((c) => c !== 'none')
							.map((c) => ({
								disabled:
									userTransactionFields[c]?.fieldName === transactionFieldsObject?.category || loadingCategoryChange,
								key: userTransactionFields[c]?.fieldName,
								label: (
									<span
										className={`flex justify-between gap-x-2 items-center ${
											userTransactionFields[c]?.fieldName === transactionFieldsObject?.category || loadingCategoryChange
												? 'text-text_placeholder'
												: 'text-white'
										}`}
									>
										{userTransactionFields[c]?.fieldName}{' '}
									</span>
								)
							}))
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
						{React.cloneElement(menu as React.ReactElement)}
						<Divider className='m-0 border-text_secondary' />
						<div className='p-2'>
							<Input
								disabled={loadingCategoryChange}
								placeholder='Add new category'
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
				<div className='flex max-w-full'>
					<div
						className={`border-x-[0.5px] border-y-[0.5px] ${
							!transactionFieldsObject?.category || transactionFieldsObject?.category === 'none'
								? 'border-failure text-failure'
								: 'border-waiting text-waiting'
						} rounded-[20px] p-2 bg-bg-secondary cursor-pointer flex items-center gap-x-3 max-w-full`}
					>
						<span className='truncate'>
							{!transactionFieldsObject?.category || transactionFieldsObject?.category === 'none'
								? 'Category'
								: transactionFieldsObject?.category}
						</span>
						{loadingCategoryChange ? <Loader size='small' /> : <CircleArrowDownIcon />}
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
	);
};

export default TransactionFields;
