import { ENetwork } from '@common/enum/substrate';

const getIdentityRegistrarIndex = (network: ENetwork) => {
	switch (network) {
		case ENetwork.POLKADOT:
			return 3;
		case ENetwork.KUSAMA:
			return 5;
		default:
			return null;
	}
};

export default getIdentityRegistrarIndex;
