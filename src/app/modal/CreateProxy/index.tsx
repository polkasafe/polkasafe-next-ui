import { ETriggers, ETxType } from '@common/enum/substrate';
import { IGenericObject, IMultisig, IReviewTransaction, ISubstrateExecuteProps } from '@common/types/substrate';
import { ApiPromise } from '@polkadot/api';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import { useState } from 'react';
import { ERROR_MESSAGES, INFO_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { TRANSACTION_BUILDER } from '@substrate/app/global/utils/transactionBuilder';
import { useQueueAtom } from '@substrate/app/atoms/transaction/transactionAtom';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';
import { setSigner } from '@substrate/app/global/utils/setSigner';
import { executeTx } from '@substrate/app/global/utils/executeTransaction';
import { ReviewModal } from '@common/global-ui-components/ReviewModal';
import { sendNotification } from '@sdk/polkasafe-sdk/src';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { AddBoxIcon } from '@common/global-ui-components/Icons';
interface ICreateProxyModal {
	multisig: IMultisig;
	buttonClassName?: string;
	iconClassName?: string;
	disabled?: boolean;
}

export const CreateProxyModal = ({ multisig, buttonClassName, iconClassName, disabled }: ICreateProxyModal) => {
	const [user] = useUser();
	const notification = useNotification();
	const [queueTransaction, setQueueTransactions] = useQueueAtom();
	const [executableTransaction, setExecutableTransaction] = useState<ISubstrateExecuteProps | null>(null);
	const [reviewTransaction, setReviewTransaction] = useState<IReviewTransaction | null>(null);

	const { getApi } = useAllAPI();
	const api = getApi(multisig.network)?.api;

	const buildTransaction = async () => {
		const onSuccess = ({ newTransaction }: IGenericObject) => {
			try {
				if (!queueTransaction) {
					return;
				}
				if (!user?.address || !user?.signature) {
					return;
				}
				const payload = [newTransaction, ...(queueTransaction?.transactions || [])];
				const { callHash, network, multisigAddress } = newTransaction;
				setQueueTransactions({ ...queueTransaction, transactions: payload });
				notification(SUCCESS_MESSAGES.TRANSACTION_SUCCESS);
				sendNotification({
					address: user?.address,
					signature: user?.signature,
					args: {
						address: user?.address,
						addresses:
							multisig?.signatories.filter(
								(signatory) => getSubstrateAddress(signatory) !== getSubstrateAddress(user?.address || '')
							) || [],
						callHash,
						multisigAddress,
						network
					},
					trigger: ETriggers.CREATED_PROXY
				});
			} catch (error) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: error || error.message });
			}
		};
		try {
			if (!api || !api.isReady) {
				notification({ ...ERROR_MESSAGES.API_NOT_CONNECTED });
				return { error: true };
			}
			if (!user) {
				notification({ ...ERROR_MESSAGES.INVALID_TRANSACTION });
				return { error: true };
			}

			const transaction = await TRANSACTION_BUILDER[ETxType.CREATE_PROXY]({
				api: api as ApiPromise,
				multisig,
				sender: user.address,
				onSuccess,
				onFailed: () => {}
			});
			if (!transaction) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
				return { error: true };
			}

			const fee = (await transaction.tx.paymentInfo(user.address)).partialFee;
			console.log(fee.toString());
			const formattedFee = formatBalance(
				fee.toString(),
				{
					numberAfterComma: 3,
					withThousandDelimitor: false
				},
				multisig.network
			);

			const reviewData = {
				tx: transaction.tx.method.toJSON(),
				from: multisig.address,
				txCost: formattedFee.toString(),
				network: multisig.network,
				name: multisig.name,
				createAt: new Date().toISOString()
			};
			setExecutableTransaction(transaction);
			setReviewTransaction(reviewData);
			return { error: false };
		} catch (error) {
			notification(ERROR_MESSAGES.CREATE_MULTISIG_FAILED);
			return { error: true };
		}
	};

	const signTransaction = async () => {
		try {
			if (!executableTransaction) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
				return { error: true };
			}
			await setSigner(executableTransaction.api, executableTransaction.network);
			await executeTx(executableTransaction);
			notification({ ...INFO_MESSAGES.TRANSACTION_IN_BLOCK });
			return { error: false };
		} catch (e) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: e || e.message });
			return { error: true };
		}
	};

	return (
		<div className='w-full'>
			<ReviewModal
				buildTransaction={buildTransaction}
				signTransaction={signTransaction}
				reviewTransaction={reviewTransaction}
				className={buttonClassName || 'text-label'}
				buttonIcon={<AddBoxIcon className={iconClassName || 'text-label'} />}
				api={api || undefined}
				isCreateProxyTx
				disabled={disabled}
			>
				Create Proxy
			</ReviewModal>
		</div>
	);
};
