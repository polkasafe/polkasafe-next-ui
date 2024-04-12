// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import Home from '@next-evm/app/components/Home';
import AddMultisigModal from '@next-evm/app/components/Multisig/AddMultisigModal';

const HomePage: React.FC = () => {
	return (
		<>
			<AddMultisigModal />
			<Home />
		</>
	);
};

export default HomePage;
