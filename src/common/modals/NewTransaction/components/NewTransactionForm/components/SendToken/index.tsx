import { useDashboardContext } from '@common/context/DashboarcContext';
import {
	ENetwork,
	ETransactionCreationType,
	ETransactionFieldsUpdateType,
	NotificationStatus
} from '@common/enum/substrate';
import Address from '@common/global-ui-components/Address';
import { MultisigDropdown } from '@common/global-ui-components/MultisigDropdown';
import { RecipientsInputs } from '@common/global-ui-components/RecipientsInputs';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { useNotification } from '@common/utils/notification';
import { useState } from 'react';
import { Form, FormInstance, Input, Spin } from 'antd';
import BN from 'bn.js';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { findMultisig } from '@common/utils/findMultisig';
import { IMultisig, ITransactionCategorySubfields, ITxnCategory } from '@common/types/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { addNewCategory } from '@sdk/polkasafe-sdk/src/add-new-category';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import AddNewCategory from '@common/modals/AddNewCategory';

export interface IRecipientAndAmount {
	recipient: string;
	amount: BN;
	currency: string;
}

export const SendTokens = ({ onClose, form }: { onClose: () => void; form: FormInstance }) => {
	const { multisigs, buildTransaction, addressBook = [], assets, transactionFields } = useDashboardContext();
	const notification = useNotification();

	const [user] = useUser();
	const [organisation, setOrganisation] = useOrganisation();

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<ITxnCategory>({
		category: 'none',
		subfields: {}
	});

	const [selectedMultisigDetails, setSelectedMultisigDetails] = useState<{
		address: string;
		network: ENetwork;
		name: string;
		proxy?: string;
	}>({
		address: multisigs[0].address,
		network: multisigs[0].network,
		name: multisigs[0].name
	});

	const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

	const [loading, setLoading] = useState(false);
	const [newCategoryLoading, setNewCategoryLoading] = useState(false);

	const autocompleteAddresses = addressBook.map((item) => ({
		label: (
			<Address
				network={selectedMultisigDetails.network}
				address={item.address}
			/>
		),
		value: item.address
	}));

	const handleSubmit = async () => {
		try {
			console.log('form', form.getFieldsValue());
			const multisigId = `${selectedMultisigDetails.address}_${selectedMultisigDetails.network}`;
			const tip = form.getFieldValue('tipBalance') as string;
			console.log('tip', tip);
			const recipientAndAmount: Array<IRecipientAndAmount> = form.getFieldValue('recipients') || [];
			const checkRecipient = recipientAndAmount.filter((item) => !item.recipient || item.amount.eq(new BN(0)));
			if (checkRecipient.length) {
				notification(ERROR_MESSAGES.NO_RECIPIENT);
				return;
			}
			const payload = {
				recipients: recipientAndAmount
					? recipientAndAmount.map((item) => ({
							address: item.recipient,
							amount: item.amount,
							currency: item.currency
						}))
					: [],
				sender: findMultisig(multisigs, multisigId) as IMultisig,
				selectedProxy: selectedMultisigDetails.proxy,
				tip: tip || '',
				type: ETransactionCreationType.SEND_TOKEN,
				transactionFields: transactionFieldsObject,
				note: form.getFieldValue('note') || ''
			};

			console.log({
				recipients: recipientAndAmount.map((item) => ({
					address: item.recipient,
					amount: item.amount.toString(),
					currency: item.currency
				})),
				sender: findMultisig(multisigs, multisigId) as IMultisig,
				selectedProxy: selectedMultisigDetails.proxy,
				tip,
				transactionFields: transactionFieldsObject,
				note: form.getFieldValue('note')
			});
			setLoading(true);
			await buildTransaction({ ...payload });
		} catch (error) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: error || error.message });
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddNewCategory = async (
		updateType: ETransactionFieldsUpdateType,
		fieldName: string,
		fieldDesc: string,
		subfields?: ITransactionCategorySubfields,
		onCancel?: () => void
	) => {
		try {
			if (!user) {
				// eslint-disable-next-line prettier/prettier
				throw new Error('User not found');
			}

			if (!organisation || !organisation.id) {
				throw new Error('Organisation not found');
			}

			setNewCategoryLoading(true);

			if (updateType === ETransactionFieldsUpdateType.ADD_CATEGORY) {
				const { data } = (await addNewCategory({
					address: user.address,
					signature: user.signature,
					organisationId: organisation.id,
					transactionFields: {
						...transactionFields,
						[fieldName.toLowerCase().split(' ').join('_')]: {
							fieldDesc,
							fieldName,
							subfields: {}
						}
					}
				})) as { data: string };
				if (data && data === 'success') {
					setNewCategoryLoading(false);
					queueNotification({
						header: 'Success!',
						message: 'Transaction Fields Updated.',
						status: NotificationStatus.SUCCESS
					});
					setOrganisation({
						...organisation,
						transactionFields: {
							...organisation.transactionFields,
							[fieldName.toLowerCase().split(' ').join('_')]: {
								fieldDesc,
								fieldName,
								subfields: {}
							}
						}
					});

					setTransactionFieldsObject({
						category: fieldName.toLowerCase().split(' ').join('_'),
						subfields: {}
					});
					onCancel?.();
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Transaction Fields.',
				status: NotificationStatus.ERROR
			});
			setNewCategoryLoading(false);
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={200}
					message='Creating Your Transaction'
				/>
			}
		>
			<Form
				layout='vertical'
				className='flex flex-col gap-y-6 max-w-[550px]'
				form={form}
			>
				<div className='flex flex-col gap-y-6'>
					<div>
						<Typography
							variant={ETypographyVariants.p}
							className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
						>
							Sending from
						</Typography>
						<MultisigDropdown
							multisigs={multisigs}
							onChange={(value: { address: string; network: ENetwork; name: string; proxy?: string }) =>
								setSelectedMultisigDetails(value)
							}
							assets={assets || null}
						/>
					</div>
					<div className='w-full'>
						<RecipientsInputs
							form={form}
							autocompleteAddresses={autocompleteAddresses}
							setDisableSubmit={setDisableSubmit}
							assets={assets || undefined}
							selectedMultisig={selectedMultisigDetails}
						/>
					</div>

					{/* <Form.Item
						name='tipBalance'
						rules={[
							{ required: true, message: 'Enter a valid amount' },
							() => ({
								validator(_, value) {
									if (Number.isNaN(Number(value))) {
										return Promise.reject(new Error('Enter a valid number'));
									}
									if (value) {
										const [, isValid] = inputToBn(value, selectedMultisigDetails.network, false);
										if (!isValid) {
											return Promise.reject(new Error('Enter a valid amount'));
										}
									}
									return Promise.resolve();
								}
							})
						]}
					>
						<label
							htmlFor='tipBalance'
							className='text-label mb-[5px] block text-xs font-normal leading-[13px]'
						>
							Tip
						</label>
						<div className='flex h-[50px] items-center'>
							<Input
								name='tipBalance'
								id='tipBalance'
								type='number'
								onChange={(e) => {
									const [value, isValid] = inputToBn(e.target.value, selectedMultisigDetails.network, false);
									form.setFieldsValue({ tipBalance: isValid ? value.toString() : '' });
								}}
								placeholder={networkConstants[selectedMultisigDetails.network]?.tokenSymbol || 'Tip'}
								className='bg-bg-secondary h-full w-full rounded-lg border-0 p-3 pr-0 text-sm font-normal leading-[15px] text-white outline-0 placeholder:text-[#505050]'
							/>
							<div className='absolute right-0 flex items-center justify-center gap-x-1 pr-3 text-white'>
								<ParachainTooltipIcon src={networkConstants[selectedMultisigDetails.network]?.logo} />
								<span>{networkConstants[selectedMultisigDetails.network]?.tokenSymbol}</span>
							</div>
						</div>
					</Form.Item> */}
					<Form.Item
						name='note'
						className='mb-0'
					>
						<label
							htmlFor='note'
							className='text-label mb-[5px] block text-xs font-normal leading-[13px]'
						>
							Note
						</label>
						<div className='flex h-[50px] items-center'>
							<Input
								name='note'
								id='note'
								type='text'
								onChange={(e) => {
									form.setFieldsValue({ note: e.target.value });
								}}
								placeholder='Enter a note'
								className='bg-bg-secondary h-full w-full rounded-lg border-0 p-3 pr-0 text-sm font-normal leading-[15px] text-white outline-0 placeholder:text-[#505050]'
							/>
						</div>
					</Form.Item>
					<div className='w-auto'>
						<Typography
							variant={ETypographyVariants.p}
							className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
						>
							Category
						</Typography>
						<div className='flex-1 flex items-center gap-2 flex-wrap'>
							{Object.keys(transactionFields)
								.filter((field) => field !== 'none')
								.map((field) => (
									<Button
										onClick={() =>
											setTransactionFieldsObject({
												category: field,
												subfields: {}
											})
										}
										className={`text-xs border border-solid ${
											transactionFieldsObject.category === field
												? 'border-primary text-primary bg-highlight'
												: 'text-text-secondary border-text-secondary'
										} rounded-2xl px-2 py-[1px]`}
										key='field'
									>
										{transactionFields[field].fieldName}
									</Button>
								))}
							<Button
								onClick={() =>
									setTransactionFieldsObject({
										category: 'none',
										subfields: {}
									})
								}
								className={`text-xs border border-solid ${
									transactionFieldsObject.category === 'none'
										? 'border-primary text-primary bg-highlight'
										: 'text-text-secondary border-text-secondary'
								} rounded-2xl px-2 py-[1px]`}
								key='field'
							>
								{transactionFields.none.fieldName}
							</Button>
							<AddNewCategory
								buttonSize='middle'
								buttonTitle='Add New'
								buttonClassName='text-xs border border-solid rounded-2xl px-2 py-[1px] text-text-secondary border-text-secondary bg-transparent'
								iconClassName='text-text-secondary'
								onSave={handleAddNewCategory}
								loading={newCategoryLoading}
							/>
						</div>
					</div>
				</div>
				<div className='flex items-center gap-x-4 w-full'>
					<div className='w-full'>
						<Button
							fullWidth
							size='large'
							onClick={onClose}
							variant={EButtonVariant.DANGER}
							icon={<OutlineCloseIcon className='text-failure' />}
						>
							Cancel
						</Button>
					</div>
					<div className='w-full'>
						<Button
							disabled={disableSubmit || form.getFieldsError().filter(({ errors }) => errors.length).length > 0}
							fullWidth
							size='large'
							onClick={handleSubmit}
							variant={EButtonVariant.PRIMARY}
						>
							Confirm
						</Button>
					</div>
				</div>
			</Form>
		</Spin>
	);
};
