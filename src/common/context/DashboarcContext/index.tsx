import { ETransactionState } from '@common/enum/substrate';
import {
	IAddressBook,
	IFundMultisig,
	IMultisig,
	IMultisigAssets,
	IReviewTransaction,
	ISendTransaction,
	ISetIdentityTransaction,
	ITransactionFields
} from '@common/types/substrate';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo } from 'react';

interface IDashboardProvider extends PropsWithChildren {
	buildTransaction: (values: ISendTransaction | ISetIdentityTransaction) => Promise<void>;
	signTransaction: () => Promise<void>;
	onFundMultisig: (value: IFundMultisig) => Promise<void>;
	assets: Array<IMultisigAssets> | null;
	currency: string;
	multisigs: Array<IMultisig>;
	addressBook: IAddressBook[];
	allApi: any;
	transactionState: ETransactionState;
	setTransactionState: Dispatch<SetStateAction<ETransactionState>>;
	reviewTransaction: IReviewTransaction | null;
	transactionFields: ITransactionFields;
}

export const DashboardContext = createContext({} as IDashboardProvider);

export function DashboardProvider({
	buildTransaction,
	signTransaction,
	onFundMultisig,
	assets,
	currency,
	multisigs,
	children,
	addressBook,
	allApi,
	transactionState,
	setTransactionState,
	reviewTransaction,
	transactionFields
}: IDashboardProvider) {
	const value = useMemo(
		() => ({
			buildTransaction,
			signTransaction,
			onFundMultisig,
			assets,
			currency,
			multisigs,
			addressBook,
			allApi,
			transactionState,
			reviewTransaction,
			setTransactionState,
			transactionFields
		}),
		[
			setTransactionState,
			signTransaction,
			addressBook,
			allApi,
			assets,
			currency,
			multisigs,
			onFundMultisig,
			transactionState,
			buildTransaction,
			reviewTransaction,
			transactionFields
		]
	);
	return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboardContext = () => useContext(DashboardContext);
