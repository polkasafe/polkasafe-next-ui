// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextResponse, NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
	if (request.method === 'OPTIONS') NextResponse.json({}, { status: 200 });
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: '/api/:function*'
};
