import { ENetwork } from '@common/enum/substrate';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { BN } from '@polkadot/util';
import { IApiAtom } from '@substrate/app/atoms/api/apiAtom';

export const getReviewTxCallData = ({
	multisigDetails,
	recipientAndAmount,
	getApi
}: {
	multisigDetails: { address: string; network: ENetwork; name: string; proxy?: string };
	recipientAndAmount: { recipient: string; amount: BN }[];
	getApi: (network: ENetwork) => IApiAtom | null;
}): string => {
	if (
		!getApi ||
		!Boolean(multisigDetails) ||
		!Boolean(getApi(multisigDetails.network)) ||
		!Boolean(getApi(multisigDetails.network)?.apiReady) ||
		!Boolean(getApi(multisigDetails.network)?.api) ||
		!recipientAndAmount ||
		recipientAndAmount.some((item) => item.recipient === '' || item.amount.isZero())
	)
		return '';

	const { network } = multisigDetails;

	const batch = getApi(network)?.api?.tx.utility.batchAll(
		recipientAndAmount.map((item) =>
			getApi(network)?.api?.tx.balances.transferKeepAlive(item.recipient, item.amount.toString())
		)
	) as SubmittableExtrinsic<'promise'>;
	let tx: SubmittableExtrinsic<'promise'>;
	if (multisigDetails.proxy) {
		tx = getApi(network)?.api?.tx.proxy.proxy(multisigDetails.proxy, null, batch) as SubmittableExtrinsic<'promise'>;
		return tx.method.toHex();
	} else {
		return batch.method.toHex();
	}
};
