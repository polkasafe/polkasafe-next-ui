import { networks } from '@next-common/global/networkConstants';

const checkAvailNetwork = (network: string) => {
	return [networks.AVAIL, networks.TURING].includes(network);
};

export default checkAvailNetwork;
