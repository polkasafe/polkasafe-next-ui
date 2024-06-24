import { chainProperties, Network, networkMappingObject, networks } from '@next-common/global/networkConstants';
import { Builder, TDestination } from '@paraspell/sdk';
import { ApiPromise } from '@polkadot/api';

interface ISendXCMTransferProps {
	api: ApiPromise;
	fromChain: any;
	toChain: any;
	currency?: string;
	amount: string;
	destinationAddress: string;
}

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
	} else if (
		toChain === networks.POLKADOT ||
		toChain === networks.KUSAMA ||
		toChain === networks.ROCOCO ||
		toChain === networks.WESTEND
	) {
		return Builder(api).from(networkMappingObject[fromChain]).amount(amount).address(destinationAddress).build();
	} else {
		return Builder(api)
			.from(networkMappingObject[fromChain])
			.to(networkMappingObject[toChain])
			.currency(currency)
			.amount(amount)
			.address(destinationAddress)
			.build();
	}
};
