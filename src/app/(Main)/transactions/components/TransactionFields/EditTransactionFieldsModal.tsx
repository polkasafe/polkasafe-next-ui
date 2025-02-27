import { Dropdown, Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { updateTransaction } from '@sdk/polkasafe-sdk/src/transaction/callhash';
import { EFieldType, IOrganisation, ITxnCategory, IUser } from '@common/types/substrate';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { NotificationStatus } from '@common/enum/substrate';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { ActionButtons } from '@common/global-ui-components/ActionButtons';
import ActionButton from '@common/global-ui-components/ActionButton';

const EditTransactionFieldsModal = ({
	defaultCategory,
	defaultTransactionFields,
	setTransactionFields,
	callHash,
	onCancel,
	userAddress,
	userSignature,
	organisation
}: {
	onCancel: () => void;
	callHash: string;
	defaultCategory: string;
	defaultTransactionFields?: ITxnCategory;
	organisation: IOrganisation,
	userAddress: string;
	userSignature: string;
	setTransactionFields: React.Dispatch<
		React.SetStateAction<{
			category: string;
			subfields: {
				[subfield: string]: {
					name: string;
					value: string;
				};
			};
		}>
	>;
}) => {
	const transactionFields = organisation.transactionFields || {};

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<{
		category: string;
		subfields: { [subfield: string]: { name: string; value: string } };
	}>(defaultTransactionFields || { category: defaultCategory || 'none', subfields: {} });

	const [category, setCategory] = useState<string>(defaultCategory || 'none');

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (category !== defaultTransactionFields?.category) {
			setTransactionFieldsObject({ category, subfields: {} });
		} else {
			setTransactionFieldsObject(defaultTransactionFields);
		}
	}, [category, defaultTransactionFields]);

	const handleUpdateTransactionCategory = async () => {
		try {
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
			} else {
				setLoading(true);

				const { data } = (await updateTransaction({ address: userAddress, signature: userSignature, callhash: callHash,
					transaction: {
						transactionFields: transactionFieldsObject
					}
				})) as { data: string };

				// if (updateTransactionFieldsError) {
				// 	queueNotification({
				// 		header: 'Failed!',
				// 		message: updateTransactionFieldsError,
				// 		status: NotificationStatus.ERROR
				// 	});
				// 	setLoading(false);
				// 	return;
				// }

				if (data) {
					queueNotification({
						header: 'Success!',
						message: 'Transaction Fields Updated.',
						status: NotificationStatus.SUCCESS
					});
					setTransactionFields(transactionFieldsObject);
					setLoading(false);
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
		<Form>
			<section className='mt-[15px] w-[500px]'>
				<label className='text-primary font-normal text-xs block mb-[5px]'>Category*</label>
				<Form.Item
					name='category'
					rules={[{ message: 'Required', required: true }]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
						menu={{
							items: [
								...Object.keys(transactionFields)
									.filter((c) => c !== 'none')
									.map((c) => ({
										key: c,
										label: <span className='text-white'>{transactionFields[c]?.fieldName}</span>
									})),
								{
									key: 'none',
									label: <span className='text-white'>Other</span>
								}
							],
							onClick: (e) => setCategory(e.key)
						}}
					>
						<div className='flex justify-between items-center text-white'>
							{transactionFields[category]?.fieldName}
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</Form.Item>
			</section>

			{transactionFields[category] &&
				transactionFields[category].subfields &&
				Object.keys(transactionFields[category].subfields).map((subfield) => {
					const subfieldObject = transactionFields[category].subfields[subfield];
					return (
						<section
							key={subfield}
							className='mt-[15px]'
						>
							<label className='text-primary font-normal text-xs block mb-[5px]'>
								{subfieldObject.subfieldName}
							</label>
							<div className=''>
								<article className='w-[500px]'>
									{subfieldObject.subfieldType === EFieldType.SINGLE_SELECT && subfieldObject.dropdownOptions ? (
										<Form.Item
											name={`${subfieldObject.subfieldName}`}
											className='border-0 outline-0 my-0 p-0'
											// help={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required && `${subfieldObject.subfieldName} is Required.`}
											// validateStatus={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required ? 'error' : 'success'}
										>
											<Dropdown
												trigger={['click']}
												className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
												menu={{
													items: subfieldObject.dropdownOptions
														?.filter((item) => !item.archieved)
														.map((item) => ({
															key: item.optionName,
															label: <span className='text-white'>{item.optionName}</span>
														})),
													onClick: (e) => {
														setTransactionFieldsObject((prev) => ({
															category: transactionFields[category].fieldName,
															subfields: {
																...prev.subfields,
																[subfield]: {
																	name: subfieldObject.subfieldName,
																	value: e.key
																}
															}
														}));
													}
												}}
											>
												<div className='flex justify-between items-center text-white'>
													{transactionFieldsObject.subfields[subfield]?.value ? (
														transactionFieldsObject.subfields[subfield]?.value
													) : (
														<span className='text-text_secondary'>Select {subfieldObject.subfieldName}</span>
													)}
													<CircleArrowDownIcon className='text-primary' />
												</div>
											</Dropdown>
										</Form.Item>
									) : (
										<Form.Item
											name={subfield}
											className='border-0 outline-0 my-0 p-0'
										>
											<div className='flex items-center h-[40px]'>
												<Input
													placeholder={`${subfieldObject.subfieldName}`}
													className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
													id={subfield}
													value={transactionFieldsObject.subfields[subfield]?.value}
													onChange={(e) =>
														setTransactionFieldsObject((prev) => ({
															category: transactionFields[category].fieldName,
															subfields: {
																...prev.subfields,
																[subfield]: {
																	name: subfieldObject.subfieldName,
																	value: e.target.value
																}
															}
														}))
													}
												/>
											</div>
										</Form.Item>
									)}
								</article>
							</div>
						</section>
					);
				})}

			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<ActionButton onClick={handleUpdateTransactionCategory} loading={loading} disabled={
						JSON.stringify(defaultTransactionFields) === JSON.stringify(transactionFieldsObject)
					} label='Add' />
			</div>
		</Form>
	);
};

export default EditTransactionFieldsModal;
