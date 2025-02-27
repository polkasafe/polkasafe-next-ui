import { ResponseMessages } from '@common/constants/responseMessage';
import { USER_COLLECTION } from '@common/db/collections';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { headers } = req;
		const address = headers.get('x-address');
		const signature = headers.get('x-signature');

		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress || !signature) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });
		const { channel } = await req.json();

		if (!channel) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const token = uuidv4();

		USER_COLLECTION.doc(substrateAddress).update({
			['notification_preferences.channelPreferences']: {
				[channel]: {
					verification_token: token
				}
			}
		});

		return NextResponse.json({ data: token, error: null }, { status: 200 });
	} catch (err) {
		console.log('Error in sending email:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
