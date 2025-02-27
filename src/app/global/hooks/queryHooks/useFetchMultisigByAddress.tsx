import { ENetwork } from '@common/enum/substrate';
import { getMultisigsByAddress } from '@sdk/polkasafe-sdk/src/get-all-multisig-by-address';
import { useQuery } from '@tanstack/react-query';

export const useFetchMultisigByAddress = ({ address, network }: { address: string; network: ENetwork }) => {
	return useQuery({
		queryKey: [`fetchMultisigByAddress${JSON.stringify({ address, network })}`],
		queryFn: () => getMultisigsByAddress({ address, network })
	});
};
