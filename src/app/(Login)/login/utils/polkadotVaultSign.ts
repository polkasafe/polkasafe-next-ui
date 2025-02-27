// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NotificationStatus } from '@common/enum/substrate';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { ApiPromise } from '@polkadot/api';
import { QrSigner } from '@common/utils/QrSigner';
import { QrState } from '@common/types/substrate';

import sendTxnWithSignature from '@common/utils/sendTxnWithSignature';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import { isHex } from '@polkadot/util';

interface IPolkadotVaultSign {
	api: any;
	token: string;
	setQrState: React.Dispatch<React.SetStateAction<QrState>>;
	substrateAddress: string;
	setOpenSignWithVaultModal: React.Dispatch<React.SetStateAction<boolean>>;
	vaultNetwork: string;
	setVaultTxnHash: React.Dispatch<React.SetStateAction<string>>;
}

export const polkadotVaultSign = async ({
	api,
	token,
	setQrState,
	substrateAddress,
	setOpenSignWithVaultModal,
	vaultNetwork,
	setVaultTxnHash
}: IPolkadotVaultSign): Promise<string> => {
	if (!api) return '';

	const tx = (api as ApiPromise).tx.system.remark(`${token}`);

	const signer = new QrSigner(api.registry, setQrState);

	const tip = api.registry.createType('Compact<Balance>', 0).toHex();
	const result = await tx.signAsync(substrateAddress, { nonce: -1, signer, tip });
	setOpenSignWithVaultModal(false);
	console.log('results', result.signature.toHex());
	if (result && result.signature && isHex(result.signature.toHex())) {
		const s = result.signature.toHex();
		const txHash = await sendTxnWithSignature({
			api,
			network: vaultNetwork,
			setTxnHash: setVaultTxnHash,
			tx
		});

		if (txHash) {
			const checkTxnRes = await fetch(`https://${vaultNetwork}.api.subscan.io/api/scan/extrinsic`, {
				body: JSON.stringify({
					events_limit: 1,
					hash: txHash,
					only_extrinsic_event: true
				}),
				headers: SUBSCAN_API_HEADERS,
				method: 'POST'
			});

			const txData = await checkTxnRes.json();

			const txParams = (txData.data.params || []) as any[];

			const remarkExists = txParams.find((paramObj) => {
				return paramObj.name === 'remark' && paramObj.value === token;
			});

			if (!remarkExists) {
				console.log('error in login');
				queueNotification({
					header: 'Error in Login',
					status: NotificationStatus.ERROR
				});
				return '';
			}
			return s;
		}
	}
	return '';
};
