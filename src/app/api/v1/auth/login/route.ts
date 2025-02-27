// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { INotificationPreferences, IUser, IUserResponse } from '@common/types/substrate';
import { ECHANNEL, EUserType } from '@common/enum/substrate';
import { ResponseMessages } from '@common/constants/responseMessage';
import { isValidRequest } from '@common/utils/isValidRequest';
import { ORGANISATION_COLLECTION, USER_COLLECTION } from '@common/db/collections';

const getOrganisations = async (address: string) => {
	const organisations = await ORGANISATION_COLLECTION.where('members', 'array-contains', address).limit(1).get();
	return organisations.docs.map((doc) => doc.id as string);
};

const checkValidOrg = async (id: string) => {
	const organisations = await ORGANISATION_COLLECTION.doc(id).get();
	return organisations.exists;
};

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	console.log('address::', address);
	console.log('signature::', signature);
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });
		const { currentOrganisation = null } = await req.json();

		// default notification preferences
		const DEFAULT_NOTIFICATION_PREFERENCES: INotificationPreferences = {
			channelPreferences: {
				[ECHANNEL.IN_APP]: {
					name: ECHANNEL.IN_APP,
					enabled: true,
					handle: String(address || ''),
					verified: true
				}
			},
			triggerPreferences: {}
		};

		const userRef = USER_COLLECTION.doc(String(substrateAddress));
		const doc = await userRef.get();

		const userOrgIds = await getOrganisations(substrateAddress);

		// check if address doc already exists
		if (doc.exists) {
			const data = doc.data();
			if (data && data.created_at) {
				let orgId = currentOrganisation;
				if (userOrgIds.includes(currentOrganisation)) {
					orgId = currentOrganisation;
				} else {
					orgId = userOrgIds[0];
				}

				const resUser: IUserResponse = {
					address: data?.address?.[0] || substrateAddress,
					type: EUserType.SUBSTRATE,
					signature: signature as string,
					currentOrganisation: orgId
				};

				console.log('resUser', resUser);

				if (!data.notification_preferences) {
					doc.ref.update({
						notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES
					});
				}

				const response = NextResponse.json({ data: resUser }, { status: 200 });
				response.cookies.set('__session', JSON.stringify(resUser), {
					httpOnly: false,
					secure: true,
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 365,
					path: '/'
				});

				return response;
			}
		}

		// else create a new user document
		const newUser: IUser = {
			userId: substrateAddress,
			address: [String(substrateAddress)],
			created_at: new Date(),
			email: null,
			notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES,
			// multisigSettings: generateMultisigSettings(), // todo: update this
			multisigAddresses: [],
			type: EUserType.SUBSTRATE
		};
		const newUserResponse: IUserResponse = {
			address: substrateAddress,
			type: EUserType.SUBSTRATE,
			signature: (signature as string) || '0x',
			currentOrganisation: userOrgIds[0]
		};
		console.log('newUserResponse', newUserResponse);

		await USER_COLLECTION.doc(substrateAddress).set(newUser, { merge: true });
		const response = NextResponse.json({ data: newUserResponse }, { status: 200 });
		response.cookies.set('__session', JSON.stringify(newUserResponse), {
			httpOnly: false,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 365,
			path: '/'
		});

		return response;
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
