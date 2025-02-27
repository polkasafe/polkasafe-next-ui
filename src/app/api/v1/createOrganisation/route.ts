// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { MULTISIG_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';
import { IDBMultisig, IDBOrganisation, IUserResponse } from '@common/types/substrate';
import { EUserType } from '@common/enum/substrate';
import { isValidRequest } from '@common/utils/isValidRequest';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { DEFAULT_MULTISIG_NAME } from '@common/constants/defaults';
import getEncodedAddress from '@common/utils/getEncodedAddress';

const updateDB = async (organisation: IDBOrganisation, multisigs: Array<IDBMultisig>) => {
	try {
		const orgRef = ORGANISATION_COLLECTION.doc();
		console.log('orgRef', orgRef.id);
		await orgRef.set(organisation);
		console.log('orgRef set the data');
		await Promise.all(
			multisigs.map(async (multisig) => {
				console.log('multisig', multisig);
				const docId = `${multisig.address}_${multisig.network}`;
				const multisigRef = MULTISIG_COLLECTION.doc(docId);
				await multisigRef.set(multisig, { merge: true });
				return docId;
			})
		);
		console.log('orgRef setting done');
		return orgRef.id;
	} catch (err: unknown) {
		console.log('Error in updateDB:', err);
	}
};

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

		const {
			name,
			multisigs: allMultisigs,
			imageURI = '',
			country = '',
			state = '',
			city = '',
			postalCode = '',
			organisationAddress = '',
			taxNumber = '',
			description = ''
		} = await req.json();

		if (!allMultisigs || !name) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		if (allMultisigs.length < 1) {
			return NextResponse.json({ error: ResponseMessages.INVALID_THRESHOLD }, { status: 400 });
		}

		const oldMultisigData = (await MULTISIG_COLLECTION.where('signatories', 'array-contains', address).get()).docs.map(
			(oldData) => oldData.data()
		);

		const multisigs = allMultisigs.map((multisig: IDBMultisig) => ({
			...multisig,
			address: getEncodedAddress(multisig.address, multisig.network),
			signatories: multisig.signatories.map((signatory) => getSubstrateAddress(signatory))
		}));

		const getMultisigName = (address: string) => {
			oldMultisigData.forEach((a) => {
				if (a.address === address) {
					return a.name;
				}
			});
			return DEFAULT_MULTISIG_NAME;
		};

		const multisigPayload = (multisigs as Array<IDBMultisig>).map((multisig) => {
			return {
				name: getMultisigName(multisig.address),
				signatories: multisig.signatories,
				network: multisig.network,
				address: multisig.address,
				threshold: multisig.threshold,
				type: EUserType.SUBSTRATE,
				proxy: multisig.proxy || [],
				description,
				created_at: new Date(),
				updated_at: new Date()
			};
		});
		const members = multisigPayload
			.map((multisig) => multisig.signatories)
			.flat()
			.map((signatory) => (signatory ? getSubstrateAddress(signatory) : signatory)) as Array<string>;

		const newOrganisation: IDBOrganisation = {
			name: String(name),
			multisigs: multisigPayload.map((multisig) => `${multisig.address}_${multisig.network}`),
			imageURI,
			country,
			state,
			city,
			postal_code: postalCode,
			organisation_address: organisationAddress,
			tax_number: taxNumber,
			members,
			created_at: new Date(),
			updated_at: new Date(),
			addressBook: []
		};
		console.log('newOrganisation', multisigPayload, newOrganisation);
		const docId = await updateDB(newOrganisation, multisigPayload);
		return NextResponse.json({ data: { ...newOrganisation, id: docId }, error: null });
	} catch (err: unknown) {
		console.log('Error in create organisation:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

const updateOrganisationDB = async (
	organisationId: string,
	organisation: IDBOrganisation,
	multisigs: Array<IDBMultisig>
) => {
	try {
		const orgRef = ORGANISATION_COLLECTION.doc(organisationId);
		console.log('orgRef', orgRef.id);
		await orgRef.set(organisation);
		console.log('orgRef set the data');
		await Promise.all(
			multisigs.map(async (multisig) => {
				console.log('multisig', multisig);
				const docId = `${multisig.address}_${multisig.network}`;
				const multisigRef = MULTISIG_COLLECTION.doc(docId);
				await multisigRef.set(multisig, { merge: true });
				return docId;
			})
		);
		console.log('orgRef setting done');
		return orgRef.id;
	} catch (err: unknown) {
		console.log('Error in updateDB:', err);
	}
};

export const PUT = withErrorHandling(async (req: NextRequest) => {
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

		const {
			name,
			multisigs: allMultisigs = [],
			imageURI = '',
			country = '',
			state = '',
			city = '',
			postalCode = '',
			organisationAddress = '',
			taxNumber = '',
			description = '',
			organisationId
		} = await req.json();

		if (!organisationId) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const oldOrganisationDoc = await ORGANISATION_COLLECTION.doc(organisationId).get();
		if (!oldOrganisationDoc.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 400 });
		}

		const oldOrganisation = oldOrganisationDoc.data() as IDBOrganisation;

		const multisigPayload = (allMultisigs as Array<IDBMultisig>).map((multisig) => {
			return {
				name: multisig.name,
				signatories: multisig.signatories.map((signatory) =>
					signatory ? getSubstrateAddress(signatory) : signatory
				) as Array<string>,
				network: multisig.network,
				address: getEncodedAddress(multisig.address, multisig.network) || multisig.address,
				threshold: multisig.threshold,
				type: EUserType.SUBSTRATE,
				proxy: multisig.proxy || [],
				description,
				created_at: new Date(),
				updated_at: new Date()
			};
		});
		const members = multisigPayload
			.map((multisig) => multisig.signatories)
			.flat()
			.map((signatory) => (signatory ? getSubstrateAddress(signatory) : signatory)) as Array<string>;

		const newOrganisation: IDBOrganisation = {
			...oldOrganisation,
			name: String(name),
			multisigs: [...multisigPayload.map((multisig) => `${multisig.address}_${multisig.network}`)],
			imageURI,
			country,
			state,
			city,
			postal_code: postalCode,
			organisation_address: organisationAddress,
			tax_number: taxNumber,
			members,
			updated_at: new Date()
		};
		console.log('newOrganisation', multisigPayload, newOrganisation);
		const docId = await updateOrganisationDB(organisationId, newOrganisation, multisigPayload);
		const response = NextResponse.json({
			data: { ...newOrganisation, multisigs: multisigPayload, id: docId, image: imageURI },
			error: null
		});
		const userResponse: IUserResponse = {
			address: substrateAddress,
			type: EUserType.SUBSTRATE,
			signature: signature as string,
			currentOrganisation: docId
		};
		response.cookies.set('__session', JSON.stringify(userResponse), {
			httpOnly: false,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 365,
			path: '/'
		});
		return response;
	} catch (err: unknown) {
		console.log('Error in create organisation:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
