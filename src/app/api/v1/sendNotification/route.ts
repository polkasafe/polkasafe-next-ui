import { ResponseMessages } from '@common/constants/responseMessage';
import { ETriggers } from '@common/enum/substrate';
import { ITriggerPreferences } from '@common/types/substrate';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { FIREBASE_FUNCTIONS_URL, firebaseFunctionsHeader } from '@substrate/app/global/lib/cloudFunction';
import axios from 'axios';
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

		const { trigger, args } = (await req.json()) as {
			trigger: ETriggers;
			args: ITriggerPreferences;
		};

		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const res = await axios.post(
			`${FIREBASE_FUNCTIONS_URL}/notify`,
			{
				args,
				trigger
			},
			{
				headers: firebaseFunctionsHeader(substrateAddress, signature || '')
			}
		);
		if (res.status !== 200) {
			return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
		}

		return NextResponse.json({ data: 'success', error: null }, { status: 200 });
	} catch (err) {
		console.log('Error in getAssets:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
