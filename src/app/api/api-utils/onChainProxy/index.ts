import { IGenericObject } from '@common/types/substrate';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import axios from 'axios';

// this will only call when newly proxy just created
export const onChainProxy = async (multisigAddress: string, network: string) => {
	try {
		const res = await axios.post(
			`https://${network}.api.subscan.io/api/v2/scan/events`,
			{
				row: 1,
				page: 0,
				module: 'proxy',
				event_id: 'PureCreated',
				address: multisigAddress
			},
			{ headers: SUBSCAN_API_HEADERS }
		);

		const response = res.data;
		if (response.data?.count === 0) {
			return null;
		}
		const eventIndex = response.data?.events[0]?.event_index;
		if (!eventIndex) {
			return null;
		}

		const proxyRes = await axios.post(
			`https://${network}.api.subscan.io/api/scan/event`,
			{
				event_index: eventIndex
			},
			{ headers: SUBSCAN_API_HEADERS }
		);

		const proxyEvent = proxyRes.data;
		const params = proxyEvent.data?.params as Array<IGenericObject>;
		return params.find((param) => param.name === 'pure')?.value || null;
	} catch (err) {
		console.log('Error in getAccountOnChainMultisigs:', err);
		return null;
	}
};
