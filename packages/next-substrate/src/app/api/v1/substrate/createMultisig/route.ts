// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { headers } from 'next/headers';
import { encodeAddress } from '@polkadot/util-crypto';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { chainProperties } from '@next-common/global/networkConstants';
import _createMultisig from '@next-substrate/utils/_createMultisig';
import { IMultisigAddress, IMultisigSettings, ISharedAddressBookRecord, ISharedAddressBooks } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { signatories, threshold, multisigName, proxyAddress, disabled, addressBook } = await req.json();
	if (!signatories || !threshold || !multisigName) {
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	}

	if (!Array.isArray(signatories) || signatories.length < 2)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	if (Number.isNaN(threshold) || Number(threshold) > signatories.length) {
		return NextResponse.json({ data: null, error: responseMessages.invalid_threshold }, { status: 400 });
	}

	const substrateProxyAddress = proxyAddress ? getSubstrateAddress(proxyAddress) : '';

	// cannot send proxy address if disabled is true
	if (substrateProxyAddress && disabled)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	// check if signatories contain duplicate addresses
	if (new Set(signatories).size !== signatories.length)
		return NextResponse.json({ data: null, error: responseMessages.duplicate_signatories }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));
		let oldProxyMultisigRef = null;

		if (proxyAddress) {
			const proxyMultisigQuery = await firestoreDB
				.collection('multisigAddresses')
				.where('proxy', '==', proxyAddress)
				.limit(1)
				.get();
			if (!proxyMultisigQuery.empty) {
				// check if the multisig linked to this proxy has this user as a signatory.
				const multisigDoc = proxyMultisigQuery.docs[0];
				const multisigData = multisigDoc.data();
				oldProxyMultisigRef = multisigDoc.ref;
				if (!multisigData.signatories.includes(substrateAddress))
					return NextResponse.json({ data: null, error: responseMessages.unauthorised }, { status: 400 });
			}
		}

		const substrateSignatories = signatories.map((signatory) => getSubstrateAddress(String(signatory))).sort();

		// check if substrateSignatories contains the address of the user (not if creating a new proxy)
		if (!proxyAddress && !substrateSignatories.includes(substrateAddress))
			return NextResponse.json({ data: null, error: responseMessages.missing_user_signatory }, { status: 400 });

		const { multisigAddress, error: createMultiErr } = _createMultisig(
			substrateSignatories,
			Number(threshold),
			chainProperties[network].ss58Format
		);
		if (createMultiErr || !multisigAddress)
			return NextResponse.json(
				{ data: null, error: createMultiErr || responseMessages.multisig_create_error },
				{ status: 400 }
			);

		const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);

		// change user's multisig settings to deleted: false and set the name
		const newMultisigSettings: IMultisigSettings = {
			deleted: false,
			name: multisigName
		};

		// check if the multisig exists in our db
		const multisigRef = firestoreDB.collection('multisigAddresses').doc(`${encodedMultisigAddress}_${network}`);
		const multisigDoc = await multisigRef.get();

		if (multisigDoc.exists) {
			const multisigDocData = multisigDoc.data();

			const resData: { [key: string]: any } = {
				...multisigDocData,
				name: multisigName,
				created_at: multisigDocData?.created_at?.toDate(),
				signatories: multisigDocData?.signatories?.map((signatory: string) =>
					encodeAddress(signatory, chainProperties[network].ss58Format)
				),
				updated_at: multisigDocData?.updated_at?.toDate() || multisigDocData?.created_at.toDate()
			};

			if (proxyAddress) {
				const batch = firestoreDB.batch();

				batch.update(multisigRef, {
					proxy: proxyAddress,
					disabled: false,
					updated_at: new Date()
				});

				if (oldProxyMultisigRef) {
					batch.update(oldProxyMultisigRef, {
						proxy: '',
						disabled: true,
						updated_at: new Date()
					});
				}

				await batch.commit();

				resData.proxy = proxyAddress;
				resData.disabled = false;
			}

			await firestoreDB
				.collection('addresses')
				.doc(substrateAddress)
				.set(
					{
						multisigSettings: {
							[`${encodedMultisigAddress}_${network}`]: newMultisigSettings
						}
					},
					{ merge: true }
				);

			return NextResponse.json({ data: resData, error: null }, { status: 200 });
		}

		const newDate = new Date();

		const newMultisig: IMultisigAddress = {
			address: encodedMultisigAddress,
			created_at: newDate,
			updated_at: newDate,
			disabled: disabled || false,
			name: multisigName,
			signatories: substrateSignatories,
			network: String(network).toLowerCase(),
			threshold: Number(threshold)
		};

		const newMultisigWithEncodedSignatories = {
			...newMultisig,
			signatories: newMultisig.signatories.map((signatory: string) =>
				encodeAddress(signatory, chainProperties[network].ss58Format)
			)
		};

		if (proxyAddress) {
			newMultisig.proxy = proxyAddress;
		}

		await multisigRef.set(newMultisig, { merge: true });

		console.info('New multisig created with an address of ', encodedMultisigAddress);
		if (oldProxyMultisigRef) {
			await oldProxyMultisigRef.update({
				proxy: '',
				disabled: true,
				updated_at: newDate
			});
		}

		await firestoreDB
			.collection('addresses')
			.doc(substrateAddress)
			.set(
				{
					multisigSettings: {
						[`${encodedMultisigAddress}_${network}`]: newMultisigSettings
					}
				},
				{ merge: true }
			);

		if (addressBook) {
			const addressBookRef = newMultisig.proxy
				? firestoreDB.collection('addressBooks').doc(`${substrateProxyAddress}_${network}`)
				: firestoreDB.collection('addressBooks').doc(`${multisigAddress}_${network}`);
			const records: { [address: string]: ISharedAddressBookRecord } = {} as any;
			substrateSignatories.forEach((signatory) => {
				records[signatory] = {
					name: addressBook[signatory]?.name || '',
					address: signatory,
					email: addressBook[signatory]?.email || '',
					discord: addressBook[signatory]?.discord || '',
					telegram: addressBook[signatory]?.telegram || '',
					roles: addressBook[signatory]?.roles || []
				};
			});
			const updatedAddressEntry: ISharedAddressBooks = {
				records,
				multisig: newMultisig.proxy ? proxyAddress : multisigAddress
			};

			await addressBookRef.set({ ...updatedAddressEntry }, { merge: true });
		}
		return NextResponse.json({ data: newMultisigWithEncodedSignatories, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in createMultisig :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 400 });
	}
}
