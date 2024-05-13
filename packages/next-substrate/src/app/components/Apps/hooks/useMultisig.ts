import { IMultisigAddress } from '@next-common/types';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';

type ItemType = {
	key: string;
	label: { address: string; isMultisig: boolean; network: string; showNetworkBadge: boolean; withBadge: boolean };
};

export default function useMultisig() {
	const { activeOrg } = useActiveOrgContext();

	const multisigOptionsWithProxy: IMultisigAddress[] = [];

	activeOrg?.multisigs?.forEach((item) => {
		if (item.proxy) {
			if (typeof item.proxy === 'string') {
				multisigOptionsWithProxy.push({ ...item, proxy: item.proxy });
			} else {
				item.proxy.map((mp) =>
					multisigOptionsWithProxy.push({ ...item, name: mp.name || item.name, proxy: mp.address })
				);
			}
		}
	});

	const multisigOptions: ItemType[] = multisigOptionsWithProxy?.map((item) => ({
		key: JSON.stringify({ ...item, isProxy: true }),
		label: {
			address: item.proxy as string,
			isMultisig: true,
			isProxy: true,
			network: item.network,
			showNetworkBadge: true,
			withBadge: false
		}
	}));

	activeOrg?.multisigs?.forEach((item) => {
		multisigOptions.push({
			key: JSON.stringify({ ...item, isProxy: false }),
			label: {
				address: item.address,
				isMultisig: true,
				network: item.network,
				showNetworkBadge: true,
				withBadge: false
			}
		});
	});
	return multisigOptions;
}
