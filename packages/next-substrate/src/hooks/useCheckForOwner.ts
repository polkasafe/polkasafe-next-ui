'use client';

import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';

export default function useCheckForOwner(multisigAddress?: string) {
	const { activeOrg } = useActiveOrgContext();

	const { address, activeMultisig } = useGlobalUserDetailsContext();

	const multisigData = activeOrg?.multisigs.find(
		(item) => getSubstrateAddress(item.address) === getSubstrateAddress(multisigAddress || activeMultisig)
	);

	const substrateSignatories = multisigData?.signatories.map((a) => getSubstrateAddress(a));

	const isOwnerOfMultisig = substrateSignatories?.includes(getSubstrateAddress(address));

	return { isOwnerOfMultisig, owners: substrateSignatories };
}
