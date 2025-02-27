// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IOrganisation } from '@common/types/substrate';
import InitializeAssets from '@substrate/app/Initializers/InializeAssets';
import InitializeAPI from '@substrate/app/Initializers/InitializeAPI';
import InitializeOrganisation from '@substrate/app/Initializers/InitializeOrganisation';
import InitializeTransaction from '@substrate/app/Initializers/initializeTransaction';
import InitializeUser from '@substrate/app/Initializers/InitializeUser';
import InitializeWalletConnect from '@substrate/app/Initializers/initializeWalletConnect';

interface IInitializer {
	userAddress: string;
	signature: string;
	organisations: Array<IOrganisation>;
}

function Initializers({ userAddress, signature, organisations }: IInitializer) {
	return (
		<>
			<InitializeUser
				userAddress={userAddress}
				signature={signature}
				organisations={organisations}
			/>
			<InitializeOrganisation />
			<InitializeAssets />
			<InitializeWalletConnect />
			<InitializeAPI />
			<InitializeTransaction />
		</>
	);
}

export default Initializers;
