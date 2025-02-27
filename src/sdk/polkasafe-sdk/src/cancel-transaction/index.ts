import { networkConstants } from "@common/constants/substrateNetworkConstant";
import { responseMessages } from "../utils/constants/response_messages";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { cancelTransactionForWallet } from "./cancelTrasaction";
import { CancelTransactionPayloadType } from "./types";
import { ENetwork } from "@common/enum/substrate";
type Props = {
	address: string,
	network: string,
	data: CancelTransactionPayloadType
}

export async function cancelTransaction({
	address,
	network,
	data
}: Props) {

	const { injector, multisig, callHash, statusGrabber } = data;

	if (!injector || !multisig || !callHash) {
		return { status: 400, error: responseMessages.invalid_params };
	}

	try {
		if (!Object.keys(networkConstants).includes(network)) {
			return { status: 500, error: responseMessages.internal };
		}

		const provider = new WsProvider(networkConstants[network as ENetwork].rpcEndpoint);
		const api = new ApiPromise({ provider });
		await api.isReady;
		if (!api || !api.isReady) {
			return { status: 500, error: responseMessages.internal };
		}

		const otherSignatories = multisig.signatories.sort().filter((signatory: string) => signatory !== address);

		const info = await api.query.multisig.multisigs(multisig.address, callHash);
		// @ts-ignore: 
		const when = info.unwrap().when;
		const payload = {
			api,
			senderAddress: address,
			injector,
			network,
			multisig,
			otherSignatories,
			when,
			callHash,
			statusGrabber
		}

		const response = await cancelTransactionForWallet(payload)
		if (!response.message) {
			return { status: 400, error: response.error };
		}
		return { status: 200, message: 'Transaction Cancel Successful' };

	} catch (err: unknown) {
		return { status: 500, error: responseMessages.internal };
	}
}