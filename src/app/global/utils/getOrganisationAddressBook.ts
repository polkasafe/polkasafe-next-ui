import { IOrganisation } from '@common/types/substrate';

export const getOrganisationAddressBook = (organisation: IOrganisation) => {
	const addressBook = organisation?.addressBook;
	return addressBook;
};
