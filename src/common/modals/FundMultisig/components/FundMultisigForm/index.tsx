import React, { useState } from 'react';
import { Form, Spin } from 'antd';
import ActionButton from '@common/global-ui-components/ActionButton';
import { useDashboardContext } from '@common/context/DashboarcContext';
import { ERROR_MESSAGES } from '@common/utils/messages';
// import { fundFormFields } from '@common/modals/FundMultisig/utils/form';
import { MultisigDropdown } from '@common/global-ui-components/MultisigDropdown';
import { ENetwork } from '@common/enum/substrate';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { useNotification } from '@common/utils/notification';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { IMultisig } from '@common/types/substrate';
import BalanceInput from '@common/global-ui-components/BalanceInput';
import Address from '@common/global-ui-components/Address';
import { DEFAULT_USER_ADDRESS_NAME } from '@common/constants/defaults';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import BN from 'bn.js';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import Balance from '@common/global-ui-components/Balance';

export function FundMultisigForm() {
	const { multisigs, onFundMultisig, assets } = useDashboardContext();
	const network = multisigs[0].network || ENetwork.POLKADOT; 
	const [user] = useUser();
	const { getApi } = useAllAPI();
	const api = getApi(network);
	const notification = useNotification();

	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState<BN>(new BN(0));
	const [userBalance, setUserBalance] = useState<BN>(new BN(0));

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

	const handleSubmit = async () => {
		try {
			console.log('values', selectedMultisigDetails);
			const payload = {
				amount,
				multisig: selectedMultisigDetails as unknown as IMultisig,
				selectedProxy: selectedMultisigDetails.proxy
			};
			setLoading(true);
			await onFundMultisig(payload);
		} catch (e) {
			console.log(e);
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: e || e.message });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='w-full h-full flex flex-col justify-center items-center'>
			<Spin
				spinning={loading}
				indicator={
					<LoadingLottie
						width={200}
						message='Sending Funds To Multisig'
					/>
				}
			>
				<Form
					layout='vertical'
					onFinish={handleSubmit}
				>
					<div className='flex flex-col gap-4 mb-4'>
						<div>
							<Typography
								variant={ETypographyVariants.p}
								className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
							>
								Sending From
							</Typography>
							<div className='border border-dashed border-text-disabled rounded-lg p-2 bg-bg-secondary w-full max-sm:w-full text-white text-base flex items-center justify-between'>
								<Address
									name={DEFAULT_USER_ADDRESS_NAME}
									address={user?.address || ''}
								/>
								{api?.api && 
									<Balance onChange={(balance) => setUserBalance(new BN(balance))} address={user?.address || ''} network={network} api={api?.api} apiReady={api?.apiReady}  />
								}
							</div>
						</div>
						<div>
							<Typography
								variant={ETypographyVariants.p}
								className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
							>
								Sending To
							</Typography>
							<MultisigDropdown
								multisigs={multisigs}
								onChange={(value: { address: string; network: ENetwork; name: string; proxy?: string }) =>
									setSelectedMultisigDetails(value)
								}
								assets={assets}
							/>
						</div>
						<div>
							<BalanceInput
								network={selectedMultisigDetails.network}
								label='Amount*'
								onChange={(balance) => setAmount(balance)}
								formName='amount'
								required
							/>
							{!amount.isZero() && amount.gt(userBalance) && <span className='text-failure text-xs'>Insufficient Balance in Sender Account!</span>}
						</div>

						{/* {fundFormFields.map((field) => (
							<Form.Item
								label={field.label}
								name={field.name}
								rules={[...field.rules, { type: 'number' }]}
								key={field.name}
							>
								{field.input}
							</Form.Item>
						))} */}
					</div>
					<ActionButton
						disabled={!amount || amount.isZero() || amount.gt(userBalance)}
						loading={loading}
						label='Fund Multisig'
					/>
				</Form>
			</Spin>
		</div>
	);
}
