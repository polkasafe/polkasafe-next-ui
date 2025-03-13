import { useDashboardContext } from '@common/context/DashboarcContext';
import { ENetwork, ETransactionCreationType } from '@common/enum/substrate';
import BalanceInput from '@common/global-ui-components/BalanceInput';
import { MultisigDropdown } from '@common/global-ui-components/MultisigDropdown';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { useNotification } from '@common/utils/notification';
import { useState } from 'react';
import { Form, FormInstance, Spin } from 'antd';
import BN from 'bn.js';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { findMultisig } from '@common/utils/findMultisig';
import { IMultisig, ITeleportAssetTransaction } from '@common/types/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';

export interface IRecipientAndAmount {
	recipient: string;
	amount: BN;
	currency: string;
}

export const TeleportAssets = ({ onClose, form }: { onClose: () => void; form: FormInstance }) => {
	const { multisigs, buildTransaction, assets } = useDashboardContext();
	const notification = useNotification();

	const peopleMultisigs = multisigs.filter((item) => item.network === ENetwork.PEOPLE);

	const [selectedMultisigDetails, setSelectedMultisigDetails] = useState<{
		address: string;
		network: ENetwork;
		name: string;
		proxy?: string;
	}>({
		address: peopleMultisigs[0].address,
		network: peopleMultisigs[0].network,
		name: peopleMultisigs[0].name
	});

	const [selectedRecipientDetails, setSelectedRecipientDetails] = useState<{
		address: string;
		network: ENetwork;
		name: string;
		proxy?: string;
	}>({
		address: peopleMultisigs[0].address,
		network: peopleMultisigs[0].network,
		name: peopleMultisigs[0].name
	});

	const [amount, setAmount] = useState<BN>(new BN(0));

	const [disableSubmit] = useState<boolean>(false);

	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		try {
			console.log('form', form.getFieldsValue());
			const multisigId = `${selectedMultisigDetails.address}_${selectedMultisigDetails.network}`;
			// const amount = form.getFieldValue('amount') as string;
			const payload: ITeleportAssetTransaction = {
				recipientAddress: selectedRecipientDetails.address,
				recipientNetwork: selectedRecipientDetails.network,
				amount,
				sender: findMultisig(peopleMultisigs, multisigId) as IMultisig,
				selectedProxy: selectedMultisigDetails.proxy,
				type: ETransactionCreationType.TELEPORT
			};

			console.log({
				recipientAddress: selectedRecipientDetails.address,
				recipientNetwork: selectedRecipientDetails.network,
				amount,
				sender: findMultisig(peopleMultisigs, multisigId) as IMultisig,
				selectedProxy: selectedMultisigDetails.proxy
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
							multisigs={peopleMultisigs}
							onChange={(value: { address: string; network: ENetwork; name: string; proxy?: string }) =>
								setSelectedMultisigDetails(value)
							}
							assets={assets || null}
						/>
					</div>
					<div>
						<Typography
							variant={ETypographyVariants.p}
							className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
						>
							Sending To
						</Typography>
						<MultisigDropdown
							multisigs={peopleMultisigs}
							onChange={(value: { address: string; network: ENetwork; name: string; proxy?: string }) =>
								setSelectedRecipientDetails({ ...value, network: ENetwork.POLKADOT })
							}
							assets={assets || null}
						/>
					</div>

					<BalanceInput
						network={selectedMultisigDetails.network}
						label='Amount'
						onChange={(balance) => setAmount(balance)}
						formName='amount'
						required
					/>
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
