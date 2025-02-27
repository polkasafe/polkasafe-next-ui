import { ResponseMessages } from '@common/constants/responseMessage';
import { ORGANISATION_COLLECTION } from '@common/db/collections';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const {
			name,
			address: addressToAdd,
			roles = [],
			email = '',
			discord = '',
			telegram = '',
			nickName = '',
			organisationId
		} = await req.json();

		if (!name || !addressToAdd || !organisationId) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		const organisationRef = await ORGANISATION_COLLECTION.doc(organisationId);
		const organisationDoc = await organisationRef.get();
		if (!organisationDoc.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANIZATION }, { status: 400 });
		}

		const members = organisationDoc.data()?.members || [];

		if (members.map((m: any) => getSubstrateAddress(m)).indexOf(substrateAddress) === -1) {
			return NextResponse.json({ error: ResponseMessages.UNAUTHORIZED }, { status: 400 });
		}

		const organisationData = organisationDoc.data();
		const addressBook = organisationData?.addressBook || [];

		const addressIndex = addressBook.findIndex(
			(a: any) => getSubstrateAddress(a.address) == getSubstrateAddress(addressToAdd)
		);
		if (addressIndex > -1) {
			addressBook[addressIndex] = {
				name,
				address: getSubstrateAddress(addressToAdd),
				roles,
				email,
				discord,
				telegram,
				nickName
			};
			await organisationRef.set({ addressBook }, { merge: true });
			return NextResponse.json({ data: { addressBook }, error: null });
		}

		const newAddressBook = [
			...addressBook,
			{
				name,
				address: getSubstrateAddress(addressToAdd),
				roles,
				email,
				discord,
				telegram,
				nickName
			}
		];

		await organisationRef.set({ addressBook: newAddressBook }, { merge: true });

		return NextResponse.json({ data: { addressBook: newAddressBook }, error: null });
	} catch (err: unknown) {
		console.log('Error in Adding Address:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const { address: addressToRemove, organisationId } = await req.json();

		if (!addressToRemove || !organisationId) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const organisationRef = await ORGANISATION_COLLECTION.doc(organisationId);
		const organisationDoc = await organisationRef.get();
		if (!organisationDoc.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANIZATION }, { status: 400 });
		}
		const members = organisationDoc.data()?.members || [];

		if (members.map((m: any) => getSubstrateAddress(m)).indexOf(substrateAddress) === -1) {
			return NextResponse.json({ error: ResponseMessages.UNAUTHORIZED }, { status: 400 });
		}

		const organisationData = organisationDoc.data();
		const addressBook = organisationData?.addressBook || [];

		const newAddressBook = addressBook.filter(
			(a: any) => getSubstrateAddress(a.address) !== getSubstrateAddress(addressToRemove)
		);

		await organisationRef.set({ addressBook: newAddressBook }, { merge: true });

		return NextResponse.json({ data: { addressBook: newAddressBook }, error: null });
	} catch (err: unknown) {
		console.log('Error in Deleting Address:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
