import { EAfterExecute, ENetwork } from '@common/enum/substrate';
import { createProxy } from '@sdk/polkasafe-sdk/src/create-proxy';
import { editProxy as editProxyDB } from '@sdk/polkasafe-sdk/src/edit-proxy';

const linkProxy = async ({
	multisigAddress,
	network,
	address,
	signature
}: {
	multisigAddress: string;
	network: ENetwork;
	address: string;
	signature: string;
}) => {
	return createProxy({ multisigAddress, network, address, signature });
};

const editProxy = async ({
	organisationId,
	oldMultisigAddress,
	newMultisigAddress,
	proxyAddress,
	network,
	address,
	signature
}: {
	organisationId: string;
	oldMultisigAddress: string;
	newMultisigAddress: string;
	proxyAddress: ENetwork;
	network: ENetwork;
	address: string;
	signature: string;
}) => {
	editProxyDB({ organisationId, oldMultisigAddress, newMultisigAddress, proxyAddress, network, address, signature });
};

export const AFTER_EXECUTE = {
	[EAfterExecute.LINK_PROXY]: linkProxy,
	[EAfterExecute.EDIT_PROXY]: editProxy
};
