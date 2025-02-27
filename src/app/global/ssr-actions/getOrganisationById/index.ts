import { IOrganisation } from '@common/types/substrate';
import { getOrganisationById } from '@sdk/polkasafe-sdk/src/get-organisation-by-id';
import { ERROR_MESSAGES } from '@substrate/app/global/genericErrors';

export const getOrganisationData = async (organisationId: string, address?: string, signature?: string) => {
	if (!address || !signature) {
		return { error: ERROR_MESSAGES.USER_NOT_LOGGED_IN };
	}
	const organisationPromise = getOrganisationById({
		address,
		signature,
		organisationId
	}) as Promise<{ data: IOrganisation }>;

	const [organisationData] = await Promise.all([organisationPromise]);

	return { organisationData: organisationData.data };
};
