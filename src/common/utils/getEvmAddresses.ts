export const getEvmAddress = async (wallet: any) => {
	try {
		const accounts: string[] = (await wallet.request({ method: 'eth_requestAccounts' })) || [];
		// Enable SubWallet
		// const injectedWindow = window as Window & InjectedWindow;

		return accounts;
	} catch (error) {
		console.error('Error fetching EVM address:', error);
		return [];
	}
};
