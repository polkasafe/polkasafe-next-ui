// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork, ETransactionCreationType } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { SendTransaction } from '@substrate/app/(Main)/components/SendTransaction';
import NewTransaction from '@common/modals/NewTransaction';
import { useState } from 'react';

export function TransferByMultisig({
	address,
	network,
	proxyAddress,
	disabled
}: {
	address: string;
	proxyAddress: string;
	network?: ENetwork;
	disabled?: boolean;
}) {
	const [openModal, setOpenModal] = useState(false);
	return (
		<SendTransaction
			address={address}
			network={network}
			proxyAddress={proxyAddress}
		>
			<Button
				variant={EButtonVariant.PRIMARY}
				className='min-w-0 px-3 py-2'
				size='small'
				onClick={() => setOpenModal(true)}
				disabled={disabled}
			>
				Send
			</Button>
			<NewTransaction
				transactionType={ETransactionCreationType.SEND_TOKEN}
				openModal={openModal}
				setOpenModal={setOpenModal}
			/>
		</SendTransaction>
	);
}
