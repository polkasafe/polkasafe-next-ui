import { encodeAddress } from '@polkadot/util-crypto';
import { SUBSCAN_API_HEADERS } from '../utils/constants/subscan_consts';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { handleMultisigCreate } from './handleMultisigCreate';
import { ENetwork } from '@common/enum/substrate';

export const fetchProxyData = async (
	multisig: any,
	signature: string,
	address: string,
	network: string,
	statusGrabber: any
) => {
	const response = await fetch(`https://${network}.api.subscan.io/api/scan/events`, {
		body: JSON.stringify({
			row: 1,
			page: 0,
			module: 'proxy',
			call: 'PureCreated',
			address: multisig.address
		}),
		headers: SUBSCAN_API_HEADERS,
		method: 'POST'
	});

	const responseJSON = await response.json();
	if (responseJSON.data.count === 0) {
		return false;
	}
	const params = JSON.parse(responseJSON.data?.events[0]?.params);
	const proxyAddress = params[0].value.startsWith('0x') ? params[0].value : encodeAddress(params[0].value, networkConstants[network as ENetwork].ss58Format);
	await handleMultisigCreate(multisig, proxyAddress, signature, address, network, statusGrabber);
};
