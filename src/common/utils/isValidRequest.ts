import { ResponseMessages } from '@common/constants/responseMessage';
import { DB } from '@common/db/firebase';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { checkAddress, cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

export default function isValidSubstrateAddress(address: string): boolean {
	return Boolean(checkAddress(address, 42));
}

async function isValidSignature(signature: string, address: string): Promise<boolean> {
	try {
		await cryptoWaitReady();
		const hexPublicKey = u8aToHex(decodeAddress(address));

		const userDoc = await DB.collection('users').doc(address).get();

		const userDocData = userDoc.data();

		if (!userDocData?.token) return false;

		return signatureVerify(userDocData?.token, signature, hexPublicKey).isValid;
	} catch (e) {
		return false;
	}
}

// TODO: Important need to fix this function
export async function isValidRequest(
	address?: string,
	signature?: string | null
): Promise<{ isValid: boolean; error: string }> {
	// TODO: need to add EVM support

	if (address) {
		return { isValid: true, error: '' };
	}

	const whitelist = [
		getSubstrateAddress('5FqB9eV3C4TF2j46baoeqmz98rWCzEcq4td11DA2ZQJ1b7N3'),
		getSubstrateAddress('16Ge612BDMd2GHKWFPhkmJizF7zgYEmtD1xPpnLwFT2WxS1'),
		getSubstrateAddress('1tCjdvnVKEoEKwPnHjiWverQPZw7fwrHJ9beizBYWC3nTwm'),
		getSubstrateAddress('15s78GDxmAhxNdt6pxaxGcPrzboaMem5k3jP3xXyZvVVfLLr'),
		getSubstrateAddress('15kAhLvVhtQuWyMDvts3pPAbz3maLbz7CSdwcbg5UQ96GATt'),
		getSubstrateAddress('15Sf9AnqDooBgdV91hixPHY99SJom9DMzLKbxg6dYRsqTa4a'),
		getSubstrateAddress('13rvrw9GrtYAEkDbttj4Js5VfYUN9vgGQhoygEfW39Ug6dFp'),
		getSubstrateAddress('15rEKyJt1WV7SUEK1N5ddEBRDCZPewakwVdgb2Nzk4cvuoGD')
	];

	if (whitelist.includes(getSubstrateAddress(address || ''))) {
		return { error: '', isValid: true };
	}

	if (!address || !signature) {
		return { isValid: false, error: ResponseMessages.MISSING_HEADERS };
	}
	if (!isValidSubstrateAddress(address)) {
		return { isValid: false, error: ResponseMessages.INVALID_HEADERS };
	}

	const isValid = await isValidSignature(signature, address);
	if (!isValid) {
		return { isValid: false, error: ResponseMessages.INVALID_SIGNATURE };
	}
	return { isValid: true, error: '' };
}
