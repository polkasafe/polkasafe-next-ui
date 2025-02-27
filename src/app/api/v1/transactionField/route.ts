import { ResponseMessages } from '@common/constants/responseMessage';
import { ORGANISATION_COLLECTION } from '@common/db/collections';
import { ITransactionFields } from '@common/types/substrate';
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

		const { transactionFields, organisationId } = (await req.json()) as {
			transactionFields: ITransactionFields;
			organisationId: string;
		};

		if (!transactionFields || typeof transactionFields !== 'object') {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		const orgDoc = ORGANISATION_COLLECTION.doc(organisationId);
		const data = await orgDoc.get();
		const orgData = data.data();
		if (!orgData) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 400 });
		}
		const members = orgData.members.map((member: string) => getSubstrateAddress(member));
		if (!members.includes(substrateAddress)) {
			return NextResponse.json({ error: ResponseMessages.UNAUTHORIZED }, { status: 400 });
		}

		orgDoc.update({ ['transactionFields']: transactionFields });
		return NextResponse.json({ data: 'success', error: null });
	} catch (err) {
		console.log('Error in getAssets:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
