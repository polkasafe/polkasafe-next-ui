'use client';

import { ENetwork } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import SelectSignatories from '@common/global-ui-components/CreateMultisig/SelectSignatories';
import { createMultisigFormFields } from '@common/global-ui-components/CreateMultisig/utils/form';
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import InfoBox from '@common/global-ui-components/InfoBox';
import Input from '@common/global-ui-components/Input';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { SelectNetwork } from '@common/global-ui-components/SelectNetwork';
import { ICreateMultisig } from '@common/types/substrate';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { Form, Spin } from 'antd';
import { useState } from 'react';

// use availableSignatories to populate the select options
export const CreateMultisig = ({ networks, availableSignatories, onSubmit, userAddress, onClose }: ICreateMultisig) => {
	const [loading, setLoading] = useState(false);
	const [selectedNetwork, setSelectedNetwork] = useState<ENetwork>(ENetwork.ROOT);
	const notification = useNotification();

	const [signatories, setSignatories] = useState<string[]>([userAddress]);
	const [threshold, setThreshold] = useState<number>(0);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const signatoriesOptions = availableSignatories?.map((signatory) => ({
		label: <p>{signatory.name || signatory.address}</p>,
		value: signatory.address
	}));

	const handleSubmit = async (values: { name: string; signatories: Array<string>; network: ENetwork }) => {
		try {
			const { name } = values;
			if (!signatories) {
				notification({ ...ERROR_MESSAGES.CREATE_MULTISIG_FAILED, description: 'Please select signatories' });
				return;
			}
			if (signatories.length < 2) {
				notification({
					...ERROR_MESSAGES.CREATE_MULTISIG_FAILED,
					description: 'Please select at least 2 signatories'
				});
				return;
			}
			if (!threshold || threshold < 2 || threshold > signatories.length) {
				notification({
					...ERROR_MESSAGES.CREATE_MULTISIG_FAILED,
					description: 'Threshold is Incorrect'
				});
				return;
			}
			if (!name) {
				notification({ ...ERROR_MESSAGES.CREATE_MULTISIG_FAILED, description: 'Please enter a name' });
				return;
			}
			if (!selectedNetwork) {
				notification({ ...ERROR_MESSAGES.CREATE_MULTISIG_FAILED, description: 'Please select a network' });
				return;
			}
			setLoading(true);
			await onSubmit({
				name,
				signatories,
				network: selectedNetwork,
				threshold
			});
			notification(SUCCESS_MESSAGES.CREATE_MULTISIG_SUCCESS);
		} catch (e) {
			notification({ ...ERROR_MESSAGES.CREATE_MULTISIG_FAILED, description: e instanceof Error ? e.message : String(e) });
		} finally {
			setLoading(false);
			onClose?.();
		}
	};
	return (
		<div className='w-[600px] h-full flex flex-col justify-center items-center'>
			<Spin
				spinning={loading}
				indicator={
					<LoadingLottie
						width={200}
						message='Creating Your Multisig'
					/>
				}
			>
				<Form
					layout='vertical'
					onFinish={handleSubmit}
				>
					{createMultisigFormFields.map((field) => (
						<Form.Item
							label={field.label}
							name={field.name}
							rules={field.rules}
							key={field.name}
						>
							{field.input}
						</Form.Item>
					))}

					<h1 className='text-label mb-2 max-sm:text-xs'>Select Network</h1>
					<SelectNetwork
						networks={networks}
						selectedNetwork={selectedNetwork}
						onChange={(network) => setSelectedNetwork(network)}
					/>

					<SelectSignatories
						network={selectedNetwork}
						signatories={signatories}
						setSignatories={setSignatories}
						userAddress={userAddress}
					/>
					<Form.Item
						label='Threshold'
						name='threshold'
						key='threshold'
						rules={[
							{
								required: true,
								message: 'Please input the threshold!'
							}
						]}
						validateStatus={threshold < 2 || threshold > signatories.length ? 'error' : ''}
						help={
							threshold && threshold < 2
								? 'Threshold Must Be More Than 1.'
								: threshold > signatories.length && signatories.length > 1
									? 'Threshold Must Be Less Than Or Equal To Selected Signatories.'
									: ''
						}
					>
						<Input
							max={signatories.length}
							min={2}
							placeholder='2'
							onChange={(e) => {
								if (!Number.isNaN(Number(e.target.value))) {
									setThreshold(Number(e.target.value));
								}
							}}
							value={threshold}
						/>
					</Form.Item>
					{/* {availableSignatories && (
							<Form.Item
								label='Signatories'
								name='signatories'
								rules={[{ required: true, message: 'Please select signatories' }]}
							>
								<Checkbox.Group options={signatoriesOptions} />
							</Form.Item>
						)} */}
					<InfoBox message='The address balance should be greater than the existential deposit for successful creation of Multisig on-chain' />
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
								htmlType='submit'
								fullWidth
								size='large'
								variant={EButtonVariant.PRIMARY}
								disabled={signatories.length < 2 || threshold < 2 || threshold > signatories.length}
							>
								Create
							</Button>
						</div>
					</div>
				</Form>
			</Spin>
		</div>
	);
};
