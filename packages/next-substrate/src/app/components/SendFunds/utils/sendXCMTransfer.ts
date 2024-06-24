import { networkMappingObject, networks } from '@next-common/global/networkConstants';
import { Builder } from '@paraspell/sdk';
import { ApiPromise } from '@polkadot/api';

interface ISendXCMTransferProps {
	api: ApiPromise;
	fromChain: any;
	toChain: any;
	currency?: string;
	amount: string;
	destinationAddress: string;
}

// eslint-disable-next-line import/prefer-default-export
export const sendXCMTransfer = async ({
	api,
	fromChain,
	toChain,
	currency,
	amount,
	destinationAddress
}: ISendXCMTransferProps) => {
	if (
		fromChain === networks.POLKADOT ||
		fromChain === networks.KUSAMA ||
		fromChain === networks.ROCOCO ||
		fromChain === networks.WESTEND
	) {
		return Builder(api).to(networkMappingObject[toChain]).amount(amount).address(destinationAddress).build();
	}
	if (
		toChain === networks.POLKADOT ||
		toChain === networks.KUSAMA ||
		toChain === networks.ROCOCO ||
		toChain === networks.WESTEND
	) {
		return Builder(api).from(networkMappingObject[fromChain]).amount(amount).address(destinationAddress).build();
	}
	return Builder(api)
		.from(networkMappingObject[fromChain])
		.to(networkMappingObject[toChain])
		.currency(currency)
		.amount(amount)
		.address(destinationAddress)
		.build();
};
