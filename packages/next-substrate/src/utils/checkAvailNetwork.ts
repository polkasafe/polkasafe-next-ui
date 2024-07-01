import { networks } from '@next-common/global/networkConstants';

const checkAvailNetwork = (network: string) => {
	return [networks.TURING].includes(network);
};

export default checkAvailNetwork;
