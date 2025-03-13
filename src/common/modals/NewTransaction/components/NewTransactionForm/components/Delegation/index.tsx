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
import { Form, FormInstance, Select, Spin } from 'antd';
import { useState } from 'react';

// proxy option Any NonTransfer Governance Staking

const proxyOption = [
	{ value: 'Any', label: <span>Any</span> },
	{ value: 'NonTransfer', label: <span>NonTransfer</span> },
	{ value: 'Governance', label: <span>Governance</span> },
	{ value: 'Staking', label: <span>Staking</span> }
];

export const Delegation = ({ onClose, form }: { onClose: () => void; form: FormInstance }) => {
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

	const handleSubmit = async ({ proxyAddress, proxyType }: { proxyAddress: string; proxyType: string }) => {
		try {
			const multisigId = `${selectedMultisigDetails.address}_${selectedMultisigDetails.network}`;
			const payload = {
				proxyAddress,
				proxyType,
				sender: findMultisig(multisigs, multisigId) as IMultisig,
				type: ETransactionCreationType.DELEGATE
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
				className='flex flex-col gap-y-2'
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

				<section className='mt-[15px] w-full'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Display Name*</label>
					<div className='flex items-center gap-x-[10px]'>
						<article className='w-full'>
							<Form.Item
								className='border-0 outline-0 my-0 p-0'
								name='proxyAddress'
								rules={[{ message: 'Required', required: true }]}
							>
								<div className='flex items-center h-[50px]'>
									<Input placeholder='ProxyAddress' />
								</div>
							</Form.Item>
						</article>
					</div>
				</section>

				<section className='mt-[15px] w-full'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Proxy Type*</label>
					<div className='flex items-center gap-x-[10px]'>
						<article className='w-full'>
							<Form.Item
								className='border-0 outline-0 my-0 p-0'
								name='proxyType'
							>
								<div className='flex items-center'>
									<Select
										onChange={(value) => form.setFieldsValue({ proxyType: value })}
										options={proxyOption}
										className='w-full bg-bg-main [&_.ant-select-selection-search]:bg-bg-secondary [&_.ant-select-selection-search]:rounded-lg'
										defaultValue={[proxyOption[0].value]}
									/>
								</div>
							</Form.Item>
						</article>
					</div>
				</section>

				<div className='flex items-center gap-x-4 w-full mt-4'>
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
