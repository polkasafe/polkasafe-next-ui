import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { MULTISIG_COLLECTION } from '@common/db/collections';

export const dbProxyData = async (multisigId: string) => {
	const multisig = await MULTISIG_COLLECTION.doc(String(multisigId)).get();
	if (!multisig.exists) {
		return null;
	}
	const proxy = multisig.data()?.proxy;
	if (typeof proxy === 'string') {
		return [{ address: proxy, name: DEFAULT_ADDRESS_NAME }];
	}
	return proxy || [];
};
