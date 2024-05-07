// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React from 'react';

import AddressDropdown from '../AddressDropdown';
import styles from './styles.module.css';

interface IAccountSelectionFormProps {
	accounts: InjectedAccount[];
	address: string;
	onAccountChange: (address: string) => void;
	title?: string;
	disabled?: boolean;
	className?: string;
}

const AccountSelectionForm = ({
	accounts,
	address,
	onAccountChange,
	title,
	disabled,
	className
}: IAccountSelectionFormProps) => {
	return (
		<article className={`${styles.box} ${className}`}>
			{title && <h3 className='text-primary text-xs font-normal'>{title}</h3>}
			<AddressDropdown
				disabled={disabled}
				accounts={accounts}
				defaultAddress={address}
				onAccountChange={onAccountChange}
			/>
		</article>
	);
};

export default AccountSelectionForm;
