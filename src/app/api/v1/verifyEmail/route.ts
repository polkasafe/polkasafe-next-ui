import { ResponseMessages } from '@common/constants/responseMessage';
import { ETriggers } from '@common/enum/substrate';
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
		if (!substrateAddress || !signature) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const verifyEmailRes = await axios.post(
			`${FIREBASE_FUNCTIONS_URL}/notify`,
			{
				args: {
					address,
					email
				},
				trigger: ETriggers.VERIFY_EMAIL
			},
			{ headers: firebaseFunctionsHeader(substrateAddress, signature) }
		);
		
		const { data: verifyEmailUpdate } = verifyEmailRes;
		if (!verifyEmailUpdate) {
			return NextResponse.json({ error: verifyEmailUpdate.error }, { status: 400 });
		}
		if (verifyEmailUpdate.error) {
			return NextResponse.json({ error: verifyEmailUpdate.error }, { status: 400 });
		}
		if (verifyEmailUpdate.status !== 200) {
			return NextResponse.json({ error: verifyEmailUpdate.data }, { status: verifyEmailUpdate.status });
		}

		return NextResponse.json({ data: 'Success', error: null });
	} catch (err) {
		console.log('Error in sending email:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
