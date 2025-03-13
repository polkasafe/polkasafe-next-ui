import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import axios from 'axios';

export const onChainMultisigsByAddress = async (address: string, network: string) => {
	const { data } = await axios.post(
		`https://${network}.api.subscan.io/api/v2/scan/search`,
		{
			row: 1,
			key: address
		},
		{
			headers: SUBSCAN_API_HEADERS
		}
	);
	if (data.message === 'Record Not Found') {
		return [];
	}

	return (data?.data?.account?.multisig?.multi_account || []).map((multiData: any) => multiData.address);
};
