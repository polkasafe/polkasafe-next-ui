import { networks } from '@next-common/global/networkConstants';

const checkAvailNetwork = (network: string) => {
	return [networks.TURING, networks.AVAIL].includes(network);
};

export default checkAvailNetwork;
