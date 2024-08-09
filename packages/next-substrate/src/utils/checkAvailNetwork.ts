import { networks } from '@next-common/global/networkConstants';

const checkAvailNetwork = (network: string) => {
	return [networks.AVAIL].includes(network);
};

export default checkAvailNetwork;
