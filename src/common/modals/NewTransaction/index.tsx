'use client';

import Modal from '@common/global-ui-components/Modal';
import { NewTransactionForm } from '@common/modals/NewTransaction/components/NewTransactionForm';
import { useDashboardContext } from '@common/context/DashboarcContext';
import { ENetwork, ETransactionCreationType, ETransactionState } from '@common/enum/substrate';
import { ReviewTransaction } from '@common/global-ui-components/ReviewTransaction';
import { Form } from 'antd';
import { IReviewTransaction } from '@common/types/substrate';
import TransactionSuccessScreen from '@common/global-ui-components/TransactionSuccessScreen';
import BN from 'bn.js';
import TransactionFailedScreen from '@common/global-ui-components/TransactionFailedScreen';

function NewTransaction({
	transactionType,
	openModal,
	setOpenModal
}: {
	transactionType: ETransactionCreationType;
	openModal: boolean;
	setOpenModal: (open: boolean) => void;
}) {
	const { transactionState, setTransactionState, signTransaction, reviewTransaction } = useDashboardContext();
	const [form] = Form.useForm();

	return (
		<Modal
			open={openModal}
			onCancel={() => {
				setTransactionState(ETransactionState.BUILD);
				setOpenModal(false);
				form.resetFields();
			}}
			title={transactionType}
		>
			{transactionState === ETransactionState.BUILD && (
				<div className='flex flex-col gap-5'>
					<NewTransactionForm
						onClose={() => setOpenModal(false)}
						form={form}
						type={transactionType}
					/>
				</div>
			)}
			{transactionState === ETransactionState.REVIEW && (
				<ReviewTransaction
					onSubmit={signTransaction}
					onClose={() => setTransactionState(ETransactionState.BUILD)}
					reviewTransaction={reviewTransaction as IReviewTransaction}
				/>
			)}
			{transactionState === ETransactionState.CONFIRM && (
				<TransactionSuccessScreen
					network={reviewTransaction?.network || ENetwork.POLKADOT}
					successMessage='Transaction in Progress!'
					waitMessage='All Threshold Signatories need to Approve the Transaction.'
					amount={new BN(0)}
					txnHash=''
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
	);
}

export default NewTransaction;
