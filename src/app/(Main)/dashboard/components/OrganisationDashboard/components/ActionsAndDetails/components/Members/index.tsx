// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import Address from '@common/global-ui-components/Address';
import { AddAddress } from '@common/modals/AddressBook/AddAddress';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useSearchParams } from 'next/navigation';
import { IAddressBook } from '@common/types/substrate';
import { addToAddressBook } from '@sdk/polkasafe-sdk/src/add-to-address-book';

const columns = [
	{
		title: 'Name',
		variant: ETypographyVariants.p
	},
	{
		title: 'Address',
		variant: ETypographyVariants.p
	},
	{
		title: 'Action',
		variant: ETypographyVariants.p
	}
];

interface IMembers {
	members: Array<string>;
}

function Members({ members }: IMembers) {
	const [user] = useUser();
	const [organisation, setOrganisation] = useOrganisation();
	const organisationId = useSearchParams().get('_organisation');

	const getNameByAddress = (address: string) => {
		const entry = organisation?.addressBook?.find((item) => item.address === address);
		return entry ? entry.name : DEFAULT_ADDRESS_NAME;
	};

	const handleAddressBook = async (value: IAddressBook) => {
		if (!user) {
			throw new Error('User not found');
		}

		if (!organisationId || !organisation) {
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
			organisationId
		};
		const { data } = (await addToAddressBook(payload)) as { data: { addressBook: Array<IAddressBook> } };
		if (data.addressBook) {
			console.log(data.addressBook);
			setOrganisation({ ...organisation, addressBook: data.addressBook });
		}
	};

	return (
		<>
			<div className='flex bg-bg-secondary my-1 p-3 rounded-lg mr-1'>
				{columns.map((column) => (
					<Typography
						key={column.title}
						variant={column.variant}
						className='basis-2/6 text-base'
					>
						{column.title}
					</Typography>
				))}
			</div>
			<div className='max-h-72 overflow-x-hidden overflow-y-auto flex flex-col gap-3'>
				{members.map((item) => (
					<div className='border-b border-text-secondary p-3 mr-2 flex items-center'>
						<div className='basis-2/6'>{getNameByAddress(item)}</div>
						<div className='basis-2/6'>
							<Address
								address={item}
								onlyAddress
								isMultisig
								withBadge={false}
							/>
						</div>
						<div className='flex items-center justify-start gap-x-2'>
							<AddAddress
								title='Edit'
								onSubmit={handleAddressBook}
								addressBook={{ address: item, name: getNameByAddress(item) }}
								isUsedInsideTable={true}
							/>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

export default Members;
