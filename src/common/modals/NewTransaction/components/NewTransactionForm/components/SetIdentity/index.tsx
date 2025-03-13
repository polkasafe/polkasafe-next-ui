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
import { IMultisig } from '@common/types/substrate';
import { findMultisig } from '@common/utils/findMultisig';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { Form, FormInstance, Spin } from 'antd';
import { useState } from 'react';
// import { ApiPromise } from '@polkadot/api';

const SetIdentity = ({ onClose, form }: { onClose: () => void; form: FormInstance }) => {
	const { multisigs, buildTransaction, assets } = useDashboardContext();
	const notification = useNotification();
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

	const handleSubmit = async (values: {
		displayName: string;
		legalName: string;
		element: string;
		website: string;
		twitter: string;
		email: string;
	}) => {
		try {
			const multisigId = `${selectedMultisigDetails.address}_${selectedMultisigDetails.network}`;
			const payload = {
				displayName: values.displayName,
				legalName: values.legalName,
				elementHandle: values.element,
				websiteUrl: values.website,
				twitterHandle: values.twitter,
				email: values.email,
				sender: findMultisig(multisigs, multisigId) as IMultisig,
				type: ETransactionCreationType.SET_IDENTITY
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
				className='flex flex-col gap-y-6'
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
				<div className='grid grid-cols-2 gap-4'>
					<section className='mt-[15px] w-full'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Display Name*</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									className='border-0 outline-0 my-0 p-0'
									name='displayName'
									rules={[{ message: 'Required', required: true }]}
								>
									<div className='flex items-center h-[50px]'>
										<Input placeholder='John' />
									</div>
								</Form.Item>
							</article>
						</div>
					</section>
					<section className='mt-[15px] w-full'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Legal Name</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									className='border-0 outline-0 my-0 p-0'
									name='legalName'
								>
									<div className='flex items-center h-[50px]'>
										<Input placeholder='John Doe' />
									</div>
								</Form.Item>
							</article>
						</div>
					</section>
					<section className='mt-[15px] w-full'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Element Handle</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									className='border-0 outline-0 my-0 p-0'
									name='element'
								>
									<div className='flex items-center h-[50px]'>
										<Input placeholder='@john:matrix.org' />
									</div>
								</Form.Item>
							</article>
						</div>
					</section>
					<section className='mt-[15px] w-full'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Website</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									className='border-0 outline-0 my-0 p-0'
									name='website'
								>
									<div className='flex items-center h-[50px]'>
										<Input placeholder='https://john.me' />
									</div>
								</Form.Item>
							</article>
						</div>
					</section>
					<section className='mt-[15px] w-full'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Twitter Handle</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									className='border-0 outline-0 my-0 p-0'
									name='twitter'
								>
									<div className='flex items-center h-[50px]'>
										<Input
											id='twitter'
											placeholder='@john'
										/>
									</div>
								</Form.Item>
							</article>
						</div>
					</section>
					<section className='mt-[15px] w-full'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Email</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									className='border-0 outline-0 my-0 p-0'
									name='email'
								>
									<div className='flex items-center h-[50px]'>
										<Input
											id='email'
											placeholder='johndoe123@email.com'
										/>
									</div>
								</Form.Item>
							</article>
						</div>
					</section>
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

export default SetIdentity;
