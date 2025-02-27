import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import Secure from '@substrate/app/(Main)/Secure';
import SubstrateCreateOrganisation from '@substrate/app/(Organisation)/create-organisation/components/SubstrateCreateOrganisation';
import { IConnectedUser, ICookieUser } from '@common/types/substrate';
import { Metadata } from 'next';

export const metadata: Metadata = {
	description: 'User friendly Multisig for Polkadot & Kusama ecosystem',
	title: 'Polkasafe',
	viewport: {
		height: 'device-height',
		initialScale: 1,
		maximumScale: 1,
		minimumScale: 1,
		width: 'device-width'
	}
};

export default function CreateOrganisation() {
	const user = getUserFromCookie();

	return (
		<Secure>
			<SubstrateCreateOrganisation user={user as ICookieUser} />
		</Secure>
	);
}
