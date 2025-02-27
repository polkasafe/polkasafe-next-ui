// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { SubstrateLoginForm } from '@substrate/app/(Login)/login/components/SubstrateLoginForm';
import ConnectWalletImg from '@common/assets/icons/connect-wallet.svg';

function Web3Login() {
	return (
		<div className='flex flex-col items-center justify-center h-full'>
			<div className='mb-4 mt-1'>
				<ConnectWalletImg />
			</div>
			<SubstrateLoginForm />
		</div>
	);
}

export default Web3Login;
