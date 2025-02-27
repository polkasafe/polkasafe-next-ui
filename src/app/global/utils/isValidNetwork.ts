import { ENetwork } from '@common/enum/substrate';

export const isValidNetwork = (network: string | ENetwork) => {
	return Object.values(ENetwork).includes(network as ENetwork);
};
