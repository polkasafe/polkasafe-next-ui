import { ENetwork, ETransactionState } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import Modal from '@common/global-ui-components/Modal';
import { IReviewTransaction } from '@common/types/substrate';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { ReviewTransaction } from '@common/global-ui-components/ReviewTransaction';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import TransactionSuccessScreen from '@common/global-ui-components/TransactionSuccessScreen';
import TransactionFailedScreen from '@common/global-ui-components/TransactionFailedScreen';
import BN from 'bn.js';
import { ApiPromise } from '@polkadot/api';
import { ApiPromise as AvailApiPromise } from 'avail-js-sdk';
import formatBnBalance from '@common/utils/formatBnBalance';
import InfoBox from '@common/global-ui-components/InfoBox';

interface IReviewModal {
	buildTransaction: () => Promise<{ error: boolean }>;
	signTransaction: () => Promise<{ error: boolean }>;
	className?: string;
	size?: SizeType;
	reviewTransaction: IReviewTransaction | null;
	buttonIcon?: ReactNode;
	isCreateProxyTx?: boolean;
	api?: ApiPromise | AvailApiPromise;
	disabled?: boolean;
}

export const ReviewModal = ({
	buildTransaction,
	signTransaction,
	reviewTransaction,
	className,
	children,
	buttonIcon,
	size,
	isCreateProxyTx,
	api,
	disabled
}: PropsWithChildren<IReviewModal>) => {
	const [openModal, setOpenModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [transactionState, setTransactionState] = useState(ETransactionState.BUILD);

	const [multisigBalance, setMultisigBalance] = useState<BN>(new BN(0));
	const [reservedProxyDeposit, setReservedProxyDeposit] = useState<BN>(new BN(0));
	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));

	const multisigAddress = reviewTransaction?.from || '';
	const network = reviewTransaction?.network || ENetwork.POLKADOT;

	useEffect(() => {
		if (!api || !multisigAddress) return;

		const depositBase = api.consts.multisig.depositBase.toString();
		const depositFactor = api.consts.multisig.depositFactor.toString();
		setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));

		api.query?.system
			?.account(multisigAddress)
			.then((res: any) => {
				const balanceStr = res?.data?.free;
				setMultisigBalance(balanceStr);
			})
			.catch((e) => console.error(e));

		if (isCreateProxyTx) {
			setReservedProxyDeposit(
				(api.consts.proxy.proxyDepositFactor as unknown as BN)
					.muln(1)
					.iadd(api.consts.proxy.proxyDepositBase as unknown as BN)
					.add((api.consts.balances.existentialDeposit as unknown as BN).muln(2))
			);
		}
	}, [api, isCreateProxyTx, multisigAddress]);

	const infoMessage = isCreateProxyTx
		? `A Small Deposit of ${formatBnBalance(reservedProxyDeposit, { numberAfterComma: 3, withUnit: true }, network)} should be present in your Multisig account to Create a Proxy and ${formatBnBalance(totalDeposit, { numberAfterComma: 3, withUnit: true }, network)} should be present in the Initiator's account.`
		: `${formatBnBalance(totalDeposit, { numberAfterComma: 3, withUnit: true }, network)} should be present in the Initiator's account to create the Transaction.`;

	const actionClicked = async () => {
		setLoading(true);
		const { error } = await buildTransaction();
		if (error) {
			setTransactionState(ETransactionState.FAILED);
			setOpenModal(true);
			setLoading(false);
			return;
		}
		setTransactionState(ETransactionState.REVIEW);

		setOpenModal(true);
		setLoading(false);
	};

	const modalClicked = async () => {
		const { error } = await signTransaction();
		if (error) {
			setTransactionState(ETransactionState.FAILED);
		} else {
			setTransactionState(ETransactionState.CONFIRM);
		}
	};

	return (
		<div className='w-full'>
			<Button
				onClick={actionClicked}
				variant={EButtonVariant.SECONDARY}
				fullWidth
				loading={loading}
				className={className}
				size={size || 'large'}
				icon={buttonIcon}
				disabled={disabled}
			>
				{children}
			</Button>
			<Modal
				open={openModal}
				onCancel={() => setOpenModal(false)}
				title='Review Transaction'
			>
				{transactionState === ETransactionState.REVIEW && (
					<div>
						{api && (
							<InfoBox
								message={infoMessage}
								className='max-w-[500px]'
							/>
						)}
						<ReviewTransaction
							onSubmit={modalClicked}
							onClose={() => {
								setTransactionState(ETransactionState.BUILD);
								setOpenModal(false);
							}}
							reviewTransaction={reviewTransaction as IReviewTransaction}
							disabled={isCreateProxyTx && multisigBalance.lt(reservedProxyDeposit)}
						/>
					</div>
				)}
				{transactionState === ETransactionState.CONFIRM && (
					<TransactionSuccessScreen
						network={reviewTransaction?.network || ENetwork.POLKADOT}
						successMessage='Transaction in Progress!'
						waitMessage='All Threshold Signatories need to Approve the Transaction.'
						txnHash=''
						amount={new BN(0)}
						created_at={new Date()}
						sender={reviewTransaction?.from || ''}
						recipients={[reviewTransaction?.to || '']}
						onDone={() => {
							setTransactionState(ETransactionState.BUILD);
							setOpenModal(false);
						}}
					/>
				)}
				{transactionState === ETransactionState.FAILED && (
					<TransactionFailedScreen
						onDone={() => {
							setTransactionState(ETransactionState.BUILD);
							setOpenModal(false);
						}}
						txnHash=''
						sender={reviewTransaction?.from || ''}
						failedMessage='Oh no! Something went wrong.'
						waitMessage='Your transaction has failed due to some technical error. Please try again...Details of the transaction are included below'
						created_at={new Date()}
					/>
				)}
			</Modal>
		</div>
	);
};
