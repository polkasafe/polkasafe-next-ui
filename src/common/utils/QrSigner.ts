import { QrState } from '@common/types/substrate';
import type { Signer, SignerResult } from '@polkadot/api/types';
import type { Registry, SignerPayloadJSON } from '@polkadot/types/types';
import { blake2AsU8a } from '@polkadot/util-crypto';

// eslint-disable-next-line import/prefer-default-export
export class QrSigner implements Signer {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	readonly #registry: Registry;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	readonly #setState: (state: QrState) => void;

	constructor(registry: Registry, setState: (state: QrState) => void) {
		this.#registry = registry;
		this.#setState = setState;
	}

	public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
		return new Promise((resolve, reject): void => {
			// limit size of the transaction
			const isQrHashed = payload.method.length > 5000;
			const wrapper = this.#registry.createType('ExtrinsicPayload', payload, { version: payload.version });
			const qrPayload = isQrHashed ? blake2AsU8a(wrapper.toU8a(true)) : wrapper.toU8a();

			this.#setState({
				isQrHashed,
				qrAddress: payload.address,
				qrPayload,
				qrReject: reject,
				qrResolve: resolve
			});
		});
	}
}
