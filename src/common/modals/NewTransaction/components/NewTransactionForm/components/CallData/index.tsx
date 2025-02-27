// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useDashboardContext } from '@common/context/DashboarcContext';
import { ENetwork, ETransactionCreationType } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import Input from '@common/global-ui-components/Input';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { MultisigDropdown } from '@common/global-ui-components/MultisigDropdown';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { IMultisig, ITxnCategory } from '@common/types/substrate';
import { findMultisig } from '@common/utils/findMultisig';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { Form, FormInstance, Spin } from 'antd';
import { useState } from 'react';
// only import this here because Call Data will not be in treasurease.xyz
import { ApiPromise } from '@polkadot/api';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';

const CallData = ({ onClose, form }: { onClose: () => void; form: FormInstance }) => {
	const { getApi } = useAllAPI();
	const { multisigs, buildTransaction, assets, transactionFields } = useDashboardContext();
	const notification = useNotification();

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

	const [loading, setLoading] = useState(false);

	const handleSubmit = async (values: { callData: string }) => {
		try {
			const multisigId = `${selectedMultisigDetails.address}_${selectedMultisigDetails.network}`;
			const payload = {
				callData: values.callData,
				sender: findMultisig(multisigs, multisigId) as IMultisig,
				proxyAddress: selectedMultisigDetails.proxy,
				type: ETransactionCreationType.CALL_DATA,
				transactionFields: transactionFieldsObject
			};

			setLoading(true);
			await buildTransaction(payload);
		} catch (error) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: error || error.message });
			console.error(error);
		} finally {
			setLoading(false);
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
				onFinish={handleSubmit}
			>
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

				<section className='w-full'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Call Data*</label>
					<div className='flex items-center gap-x-[10px]'>
						<article className='w-full'>
							<Form.Item
								className='border-0 outline-0 my-0 p-0'
								name='callData'
								rules={[
									{ message: 'Required', required: true },
									() => ({
										validator(_, value) {
											try {
												if (getApi(selectedMultisigDetails.network) === undefined) {
													return Promise.reject(new Error('API not found'));
												}
												const allApi = getApi(selectedMultisigDetails.network);
												const api = allApi?.api;
												if (!api) {
													return Promise.reject(new Error('API not found'));
												}
												(api as ApiPromise).createType('Call', value);
												return Promise.resolve();
											} catch (error) {
												return Promise.reject(new Error('Invalid Call Data'));
											}
										}
									})
								]}
							>
								<div className='flex items-center h-[50px]'>
									<Input placeholder='John' />
								</div>
							</Form.Item>
						</article>
					</div>
				</section>

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
							disabled={form.getFieldsError().filter(({ errors }) => errors.length).length > 0}
							fullWidth
							htmlType='submit'
							size='large'
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

export default CallData;
