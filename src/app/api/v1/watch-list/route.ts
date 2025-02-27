import { ResponseMessages } from '@common/constants/responseMessage';
import { USER_COLLECTION } from '@common/db/collections';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withErrorHandling(async (req: NextRequest) => {
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

		const user = await USER_COLLECTION.doc(substrateAddress).get();
		if (!user.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_USER }, { status: 400 });
		}
		const userData = user.data();
		const watchlists = userData?.watchlists;

		return NextResponse.json({ data: watchlists, error: null });
	} catch (err: unknown) {
		console.log('Error in Getting Address:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

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

		const { address: addressToAdd, name, network } = await req.json();

		if (!name || !addressToAdd || !network) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		const user = await USER_COLLECTION.doc(substrateAddress).get();
		if (!user.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_USER }, { status: 400 });
		}
		const userData = user.data();
		const watchlists = userData?.watchlists || {};
		const newWatchlist = {
			address: addressToAdd,
			name,
			network
		};
		watchlists[`${addressToAdd}_${network}`] = newWatchlist;
		await user.ref.set({ watchlists }, { merge: true });

		return NextResponse.json({ data: watchlists, error: null });
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

		const { watchlistId } = await req.json();

		if (!watchlistId) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const userRef = USER_COLLECTION.doc(substrateAddress);
		const userDoc = await userRef.get();
		if (!userDoc.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_USER }, { status: 400 });
		}
		const userData = userDoc.data();
		const watchlists = userData?.watchlists || {};

		if (!watchlists[watchlistId]) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS }, { status: 400 });
		}

		delete watchlists[watchlistId];
		await userRef.set({ watchlists }, { merge: true });

		return NextResponse.json({ data: watchlists, error: null });
	} catch (err: unknown) {
		console.log('Error in Deleting Address:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
