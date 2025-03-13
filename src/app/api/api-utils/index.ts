// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';

export const withErrorHandling = (handler: { (req: NextRequest, options?: any): Promise<NextResponse> }) => {
	return async (req: NextRequest, options: object) => {
		try {
			return await handler(req, options);
		} catch (error) {
			const err = error;
			console.log('Error in API call : ', req.nextUrl);
			return NextResponse.json({ ...err, message: err.message }, { status: err.status });
		}
	};
};
