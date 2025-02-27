import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { Wallet } from '@common/enum/substrate';
import { IAddressBook } from '@common/types/substrate';
import { getWalletAccounts } from '@substrate/app/global/utils/getWalletAccounts';
import { useEffect, useState } from 'react';

export const useWalletAccounts = () => {
	const [availableSignatories, setAvailableSignatories] = useState<Array<IAddressBook>>([]);

	const getAvailableSignatories = async () => {
		const wallet = localStorage.getItem('logged_in_wallet') || Wallet.POLKADOT;
		const { accounts } = await getWalletAccounts(wallet as Wallet);
		return accounts.map((account) => ({ address: account.address, name: account.name || DEFAULT_ADDRESS_NAME }));
	};

	useEffect(() => {
		getAvailableSignatories().then((signatories) => {
			setAvailableSignatories(signatories);
		});
	}, []);

	return availableSignatories;
};
