import { ResponseMessages } from '@common/constants/responseMessage';
import { USER_COLLECTION } from '@common/db/collections';
import { IChannelPreferences, ITriggerPreferences } from '@common/types/substrate';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { headers } = req;
		const address = headers.get('x-address');
		const signature = headers.get('x-signature');

		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });
		const { triggerPreferences, channelPreferences } = (await req.json()) as {
			triggerPreferences: {
				[index: string]: ITriggerPreferences;
			};
			channelPreferences: {
				[index: string]: IChannelPreferences;
			};
		};

		if (!triggerPreferences && !channelPreferences) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		if (triggerPreferences && typeof triggerPreferences !== 'object') {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS }, { status: 400 });
		}

		if (channelPreferences && typeof channelPreferences !== 'object') {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS }, { status: 400 });
		}

		const userDoc = USER_COLLECTION.doc(substrateAddress);
		if (triggerPreferences) {
			await userDoc.update({
				['notification_preferences.triggerPreferences']: triggerPreferences
			});
		}
		if (channelPreferences) {
			await userDoc.update({
				['notification_preferences.channelPreferences']: channelPreferences
			});
		}

		const payload = (await userDoc.get()).data()?.notification_preferences;

		return NextResponse.json({ data: payload, error: null });
	} catch (err) {
		console.log('Error in getAssets:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	try {
		const { headers } = req;
		const address = headers.get('x-address');
		const signature = headers.get('x-signature');

		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const userDoc = await USER_COLLECTION.doc(substrateAddress).get();
		const data = userDoc.data();
		const notificationPreferences = data?.notification_preferences || {};

		return NextResponse.json({ data: notificationPreferences, error: null });
	} catch (err) {
		console.log('Error in getAssets:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
