'use client';

import { useDashboardContext } from '@common/context/DashboarcContext';
import { ENetwork, ETransactionState } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { WalletIcon } from '@common/global-ui-components/Icons';
import Modal from '@common/global-ui-components/Modal';
import { ReviewTransaction } from '@common/global-ui-components/ReviewTransaction';
import TransactionSuccessScreen from '@common/global-ui-components/TransactionSuccessScreen';
import { FundMultisigForm } from '@common/modals/FundMultisig/components/FundMultisigForm';
import { IReviewTransaction } from '@common/types/substrate';
import React, { useState } from 'react';
import BN from 'bn.js';
import TransactionFailedScreen from '@common/global-ui-components/TransactionFailedScreen';

function FundMultisig() {
	const [openModal, setOpenModal] = useState(false);
	const { transactionState, setTransactionState, signTransaction, reviewTransaction } = useDashboardContext();
	return (
		<div className='w-full'>
			<Button
				onClick={() => setOpenModal(true)}
				variant={EButtonVariant.SECONDARY}
				icon={<WalletIcon fill='#8AB9FF' />}
				size='large'
				className='text-sm bg-highlight text-label'
				fullWidth
			>
				Fund Multisig
			</Button>
			<Modal
				open={openModal}
				onCancel={() => setOpenModal(false)}
				title='Fund Multisig'
			>
				{transactionState === ETransactionState.BUILD && <FundMultisigForm />}
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
		</div>
	);
}

export default FundMultisig;
