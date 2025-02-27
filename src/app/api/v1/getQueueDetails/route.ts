import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { ResponseMessages } from '@common/constants/responseMessage';
import { onChainQueueDetails } from '@substrate/app/api/api-utils/onchainData';

export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { extrinsicId, network } = await req.json();
		if (!extrinsicId || !network) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const { data: tx, error } = await onChainQueueDetails(extrinsicId, network);
		if (error) {
			return NextResponse.json({ error: error, data: null }, { status: 400 });
		}

		return NextResponse.json(
			{
				data: tx,
				error: null
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL, data: null }, { status: 500 });
	}
});
