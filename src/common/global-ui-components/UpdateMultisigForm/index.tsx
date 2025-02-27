import { IAddressBook, IMultisig } from '@common/types/substrate';
import { Form, Spin } from 'antd';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { useState } from 'react';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import Address from '@common/global-ui-components/Address';
import { DeleteIcon } from '@common/global-ui-components/Icons';
import { useNotification } from '@common/utils/notification';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import ActionButton from '@common/global-ui-components/ActionButton';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import Input from '@common/global-ui-components/Input';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';

interface IUpdateMultisigForm {
	multisig: IMultisig;
	proxyAddress: string;
	onSubmit: (value: { signatories: Array<string>; threshold: number; proxyAddress: string }) => Promise<void>;
	addresses: Array<IAddressBook>;
}

export const UpdateMultisigForm = ({
	multisig,
	proxyAddress,
	onSubmit,
	addresses: addressesOptions
}: IUpdateMultisigForm) => {
	const [addresses, setAddresses] = useState<Array<string>>([...multisig.signatories.map((signatory) => signatory)]);
	const [loading, setLoading] = useState(false);
	const notification = useNotification();

	const [form] = Form.useForm();

	const handleSubmit = async () => {
		const values = form.getFieldsValue();
		const signatories = addresses;
		const { threshold } = values;
		try {
			setLoading(true);
			await onSubmit({
				signatories,
				threshold,
				proxyAddress
			});
		} catch (e) {
			// do nothing
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
					message={'Creating Your Transaction'}
				/>
			}
		>
			<div className='flex flex-col gap-2 mb-6'>
				<Typography
					variant={ETypographyVariants.h1}
					className='text-lg'
				>
					Signatories
				</Typography>

				{addresses.map((address) => (
					<div className='flex justify-between'>
						<Address
							address={address}
							network={multisig.network}
							name={multisig.name || DEFAULT_ADDRESS_NAME}
						/>
						<div className='flex justify-center gap-2'>
							{/* <Button
								size='small'
								variant={EButtonVariant.DANGER}
								onClick={() => {
									form.setFieldsValue({ address });
									setAddresses(addresses.filter((addr) => addr !== address));
								}}
								className='bg-bg-secondary text-white'
							>
								<EditIcon />
							</Button> */}
							<Button
								size='small'
								variant={EButtonVariant.DANGER}
								onClick={() => {
									if (addresses.length === 2) {
										notification({
											...ERROR_MESSAGES.INVALID_ADDRESS,
											description: 'Cannot remove the last 2 signatories'
										});
										return;
									}
									setAddresses(addresses.filter((addr) => addr !== address));
								}}
							>
								<DeleteIcon />
							</Button>
						</div>
					</div>
				))}
			</div>
			<Form
				layout='vertical'
				form={form}
				onFinish={handleSubmit}
			>
				<Form.Item
					label='New Signatory Address'
					name='address'
					rules={[
						() => ({
							validator(_, value) {
								if (getSubstrateAddress(value) === null) {
									return Promise.reject(new Error('Enter a valid address'));
								}
								if (addresses.includes(value)) {
									return Promise.reject(new Error('Address already exists'));
								}
								return Promise.resolve();
							}
						})
					]}
				>
					<div className='flex gap-2 justify-center items-center'>
						<Input
							placeholder='Enter address'
							name='address'
						/>
						<Button
							variant={EButtonVariant.SECONDARY}
							className='px-8 py-2 bg-primary'
							onClick={() => {
								const value = form.getFieldsValue();
								const address = getEncodedAddress(value.address, multisig.network);
								if (!address) {
									notification({
										...ERROR_MESSAGES.INVALID_ADDRESS,
										description: 'Please enter a valid address'
									});
									return;
								}
								if (addresses.includes(address)) {
									notification({
										...ERROR_MESSAGES.INVALID_ADDRESS,
										description: 'Address already exists'
									});
									return;
								}
								const payload = [...addresses, address];
								setAddresses(payload);
								form.resetFields();
							}}
							disabled={form.getFieldError('address')?.length > 0}
						>
							Add
						</Button>
					</div>
				</Form.Item>
				<Form.Item
					label='Threshold'
					name='threshold'
					initialValue={multisig.threshold}
					rules={[
						{ required: true, message: 'Threshold is required' },
						() => ({
							validator(_, value) {
								if (value < 2) {
									return Promise.reject(new Error('Threshold must be greater than 2'));
								}
								return Promise.resolve();
							}
						}),
						() => ({
							validator(_, value) {
								if (Number.isNaN(value)) {
									return Promise.reject(new Error('Enter a valid number'));
								}
								if (Number(value) > addresses.length) {
									return Promise.reject(new Error('Threshold cannot be greater than the number of signatories'));
								}
								return Promise.resolve();
							}
						})
					]}
				>
					<Input
						placeholder='Enter new threshold'
						name='threshold'
					/>
				</Form.Item>
				<ActionButton
					label='Submit'
					disabled={addresses.length < 2 || form.getFieldError('threshold')?.length > 0}
					loading={loading}
				/>
			</Form>
		</Spin>
	);
};
