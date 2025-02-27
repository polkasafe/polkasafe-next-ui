import Button from '@common/global-ui-components/Button';
import { EditIcon } from '@common/global-ui-components/Icons';
import React, { useState } from 'react';
import { Tooltip } from 'antd';
import Modal from '@common/global-ui-components/Modal';
import { AddAddressForm } from '@common/modals/AddressBook/AddAddress/components/AddAddressForm';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { IAddressBook } from '@common/types/substrate';
import { addToAddressBook } from '@sdk/polkasafe-sdk/src/add-to-address-book';

const EditAddressName = ({ address }: { address: string }) => {
	const [openModal, setOpenModal] = useState<boolean>(false);

	const [user] = useUser();
	const [organisation, setOrganisation] = useOrganisation();
	const addressBook = organisation?.addressBook;

	const addressBookDetails = addressBook?.find(
		(item) => getSubstrateAddress(address) === getSubstrateAddress(item.address)
	);

	const handleAddressBook = async (value: IAddressBook) => {
		if (!user) {
			throw new Error('User not found');
		}

		if (!organisation || !organisation.id) {
			throw new Error('Organisation not found');
		}
		const payload = {
			address: user.address,
			signature: user.signature,
			name: value.name,
			addressToAdd: value.address,
			email: value.email,
			discord: value.discord,
			telegram: value.telegram,
			nickName: value.nickName,
			organisationId: organisation.id
		};
		const { data } = (await addToAddressBook(payload)) as { data: { addressBook: Array<IAddressBook> } };
		if (data.addressBook) {
			setOrganisation({ ...organisation, addressBook: data.addressBook });
		}
	};
	return (
		<>
			<Modal
				open={openModal}
				onCancel={() => setOpenModal(false)}
				title='Add Address to Address Book'
			>
				<AddAddressForm
					initialValue={{
						address,
						name: addressBookDetails?.name || '',
						email: addressBookDetails?.email || '',
						discord: addressBookDetails?.discord || '',
						telegram: addressBookDetails?.telegram || ''
					}}
					onSubmit={async (values: IAddressBook) => {
						await handleAddressBook(values);
						setOpenModal(false);
					}}
				/>
			</Modal>
			<div>
				<Button
					className='bg-transparent p-0 border-none text-text-secondary text-xs'
					onClick={(e) => {
						e.preventDefault();
						setOpenModal(true);
					}}
				>
					<Tooltip title='Edit Name'>
						<EditIcon />
					</Tooltip>
				</Button>
			</div>
		</>
	);
};

export default EditAddressName;
