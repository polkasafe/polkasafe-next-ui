/* eslint-disable @typescript-eslint/no-shadow */

'use client';

import Button from '@common/global-ui-components/Button';
import React, { useEffect, useState } from 'react';
import Modal from '@common/global-ui-components/Modal';
import { EditForm } from '@common/modals/EditOrganisation/components/EditForm';
import { ICreateOrganisationDetails, IMultisig, IOrganisation } from '@common/types/substrate';
import { updateOrganisation } from '@sdk/polkasafe-sdk/src/create-organisation';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { ENetwork } from '@common/enum/substrate';
import { getMultisigsByAddress } from '@sdk/polkasafe-sdk/src/get-all-multisig-by-address';
import { createMultisig } from '@sdk/polkasafe-sdk/src/create-multisig';
import { useWalletAccounts } from '@substrate/app/global/hooks/useWalletAccounts';
import { EditIcon } from '@common/global-ui-components/Icons';
import { useNotification } from '@common/utils/notification';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';

export const EditOrganisation = () => {
	const [openModal, setOpenModal] = useState(false);
	const availableSignatories = useWalletAccounts();
	const [user] = useUser();
	const [organisation, setOrgananisation] = useOrganisation();
	const notification = useNotification();

	const [multisigs, setMultisigs] = useState<Array<IMultisig>>([]);
	const [linkedMultisigs, setLinkedMultisigs] = useState<Array<IMultisig>>(organisation?.multisigs || []);

	const [updateLoading, setUpdateLoading] = useState<boolean>(false);

	useEffect(() => {
		if (organisation) {
			setLinkedMultisigs(organisation.multisigs);
		}
	}, [organisation]);

	const onOrganisationEdit = async (organisationDetails: ICreateOrganisationDetails) => {
		if (!organisation || !user) return;
		setUpdateLoading(true);

		const payload = {
			name: organisationDetails.name || organisation.name,
			description: organisationDetails.description || '',
			image: organisationDetails.image || organisation.image,
			organisationAddress: organisationDetails.organisationAddress || organisation.address,
			city: organisationDetails.city || organisation.city,
			country: organisationDetails.country || organisation.country,
			postalCode: organisationDetails.postalCode || organisation.postalCode,
			state: organisationDetails.state || organisation.state,
			taxNumber: organisationDetails.taxNumber || organisation.taxNumber,
			addressBook: organisation.addressBook,
			transactionFields: organisation.transactionFields,
			address: user.address,
			signature: user.signature,
			organisationId: organisation.id,
			multisigs: [...linkedMultisigs]
		};

		const { data, error } = (await updateOrganisation(payload as any)) as { data: IOrganisation; error: string };

		if (data && !error) {
			console.log('response', data);
			setOrgananisation({ ...organisation, ...data });
			notification(SUCCESS_MESSAGES.UPDATE_ORGANISATION_SUCCESS);
			setOpenModal(false);
		} else {
			console.log('error', error);
			notification(ERROR_MESSAGES.UPDATE_ORGANISATION_FAILED);
		}
		setUpdateLoading(false);
	};

	const updateMultisig = async () => {
		if (!user || !organisation) return;

		const payload = {
			addressBook: organisation.addressBook,
			transactionFields: organisation.transactionFields,
			multisigs: [...organisation.multisigs, ...linkedMultisigs],
			address: user.address,
			signature: user.signature
		};

		const response = await updateOrganisation(payload as any);

		if (response) {
			console.log('response', response);
		}
		setOpenModal(false);
	};

	const onCreateMultisigSubmit = async ({
		signatories,
		name,
		threshold,
		network
	}: {
		signatories: Array<string>;
		name: string;
		threshold: number;
		network: ENetwork;
	}) => {
		const multisig = {
			name,
			signatories,
			threshold,
			network
		};
		try {
			const newMultisig = (await createMultisig(multisig)) as { data: IMultisig };
			console.log('newMultisigs', newMultisig?.data);
			setLinkedMultisigs([...linkedMultisigs, newMultisig?.data]);
		} catch (e) {
			console.error('error', e);
		}
	};

	const onLinkedMultisig = async (multisig: IMultisig) => {
		const payload = multisigs.filter((m) => m.address !== multisig.address);
		setMultisigs(payload);
		setLinkedMultisigs([...linkedMultisigs, multisig]);
	};

	const onRemoveMultisig = async (multisig: IMultisig) => {
		const payload = linkedMultisigs.filter((m) => m.address !== multisig.address);
		setLinkedMultisigs(payload);
		setMultisigs([...multisigs, multisig]);
	};

	const fetchMultisig = async (network: ENetwork) => {
		console.log('fetchMultisig', network, user);
		if (!user) return;
		const data = (await getMultisigsByAddress({ address: user.address, network })) as { data: Array<IMultisig> };

		const leftMultisig = (data?.data || []).filter(
			(multisig) =>
				!linkedMultisigs.find((linked) => linked.address === multisig.address && linked.network === multisig.network)
		);
		setMultisigs(leftMultisig);
	};

	if (!user || !organisation) return null;

	return (
		<>
			<Button
				icon={<EditIcon />}
				onClick={() => setOpenModal(true)}
				size='large'
				className='outline-none border-none text-sm bg-transparent p-0 m-0 text-primary'
			>
				Edit Details
			</Button>
			<Modal
				open={openModal}
				onCancel={() => {
					setOpenModal(false);
				}}
				title='Edit Organisation'
			>
				<EditForm
					onSubmit={onOrganisationEdit}
					onMultisigUpdate={updateMultisig}
					onCreateMultisigSubmit={onCreateMultisigSubmit}
					fetchMultisig={fetchMultisig}
					multisigs={multisigs}
					availableSignatories={availableSignatories}
					networks={Object.values(ENetwork)}
					linkedMultisig={linkedMultisigs}
					onLinkedMultisig={onLinkedMultisig}
					onRemoveMultisig={onRemoveMultisig}
					userAddress={user.address}
					onCancel={() => setOpenModal(false)}
					prevLinked={organisation.multisigs || []}
					organisation={organisation}
					updateLoading={updateLoading}
				/>
			</Modal>
		</>
	);
};
