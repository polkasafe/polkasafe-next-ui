// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import dayjs from 'dayjs';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { EFieldType, IUser, Triggers, UserDetailsContextType, Wallet } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import logout from '@next-substrate/utils/logout';

import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import { useGlobalApiContext } from './ApiContext';

export const initialUserDetailsContext: UserDetailsContextType = {
	activeMultisig: (typeof window !== 'undefined' && localStorage.getItem('active_multisig')) || '',
	address: '',
	addressBook: [],
	createdAt: new Date(),
	isProxy: false,
	loggedInWallet: Wallet.POLKADOT,
	multisigAddresses: [],
	multisigSettings: {},
	notification_preferences: {
		channelPreferences: {},
		triggerPreferences: {
			[Triggers.CANCELLED_TRANSACTION]: {
				enabled: false,
				name: Triggers.CANCELLED_TRANSACTION
			},
			[Triggers.EXECUTED_TRANSACTION]: {
				enabled: false,
				name: Triggers.EXECUTED_TRANSACTION
			},
			[Triggers.EDIT_MULTISIG_USERS_EXECUTED]: {
				enabled: false,
				name: Triggers.EDIT_MULTISIG_USERS_EXECUTED
			},
			[Triggers.EXECUTED_PROXY]: {
				enabled: false,
				name: Triggers.EXECUTED_PROXY
			},
			[Triggers.INIT_MULTISIG_TRANSFER]: {
				enabled: false,
				name: Triggers.INIT_MULTISIG_TRANSFER
			},
			[Triggers.CREATED_PROXY]: {
				enabled: false,
				name: Triggers.CREATED_PROXY
			},
			[Triggers.EDIT_MULTISIG_USERS_START]: {
				enabled: false,
				name: Triggers.EDIT_MULTISIG_USERS_START
			},
			[Triggers.APPROVAL_REMINDER]: {
				enabled: false,
				name: Triggers.APPROVAL_REMINDER
			}
		}
	},
	notifiedTill:
		typeof window !== 'undefined' && localStorage.getItem('notifiedTill')
			? dayjs(localStorage.getItem('notifiedTill')).toDate()
			: null,
	setUserDetailsContextState: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	transactionFields: {
		expense_reimbursement: {
			fieldDesc: '',
			fieldName: 'Expense Reimbursement',
			subfields: {
				department: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				project: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				description: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				expense_type: {
					subfieldName: 'Expense Type',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Gas Fees'
						},
						{
							optionName: 'Events'
						},
						{
							optionName: 'Other'
						},
						{
							optionName: 'Software'
						}
					]
				},
				invoice: {
					subfieldName: 'Invoice',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		contributor_compensation: {
			fieldName: 'Contributor Compensation',
			fieldDesc: '',
			subfields: {
				department: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				project: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				description: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				compensation_type: {
					subfieldName: 'Compensation Type',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Bounty'
						},
						{
							optionName: 'Contractor'
						},
						{
							optionName: 'Full-Time'
						},
						{
							optionName: 'Part-Time'
						}
					]
				},
				invoice: {
					subfieldName: 'Invoice',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		grants: {
			fieldName: 'Grants',
			fieldDesc: '',
			subfields: {
				department: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				project: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				description: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		airdrop: {
			fieldName: 'Airdrop',
			fieldDesc: '',
			subfields: {
				department: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				project: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				description: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		none: {
			fieldDesc: 'N/A',
			fieldName: 'Other',
			subfields: {}
		}
	}
};

export const UserDetailsContext = createContext(initialUserDetailsContext);

export function useGlobalUserDetailsContext() {
	return useContext(UserDetailsContext);
}

export const UserDetailsProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const router = useRouter();
	const { network } = useGlobalApiContext();

	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const [loading, setLoading] = useState(false);

	const connectAddress = useCallback(async () => {
		if (typeof window !== 'undefined' && (!localStorage.getItem('signature') || !localStorage.getItem('address')))
			return;

		setLoading(true);
		const connectAddressRes = await nextApiClientFetch('api/v1/substrate/auth/connectAddress');

		const { data: userData, error: connectAddressErr } = connectAddressRes as {
			data: IUser;
			error: string;
		};

		if (!connectAddressErr && userData) {
			setUserDetailsContextState((prevState) => {
				return {
					...prevState,
					activeMultisig: localStorage.getItem('active_multisig') || '',
					address: userData?.address,
					addressBook: userData?.addressBook || [],
					createdAt: userData?.created_at,
					loggedInWallet: (localStorage.getItem('logged_in_wallet') as Wallet) || Wallet.POLKADOT,
					multisigAddresses: userData?.multisigAddresses,
					multisigSettings: userData?.multisigSettings || {},
					notification_preferences:
						userData?.notification_preferences || initialUserDetailsContext.notification_preferences,
					transactionFields: userData?.transactionFields || initialUserDetailsContext.transactionFields,
					tfa_token: userData?.tfa_token,
					two_factor_auth: userData?.two_factor_auth
				};
			});
		} else {
			logout();
			setUserDetailsContextState((prevState) => {
				return {
					...prevState,
					activeMultisig: localStorage.getItem('active_multisig') || '',
					address: '',
					addressBook: [],
					loggedInWallet: Wallet.POLKADOT,
					multisigAddresses: [],
					multisigSettings: {}
				};
			});
			router.push('/');
		}
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (typeof window !== 'undefined' && localStorage.getItem('signature')) {
			connectAddress();
		} else {
			logout();
			setLoading(false);
			router.push('/');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectAddress]);

	const value = useMemo(() => ({ ...userDetailsContextState, setUserDetailsContextState }), [userDetailsContextState]);

	return (
		<UserDetailsContext.Provider value={value}>
			{loading ? (
				<main className='h-screen w-screen flex items-center justify-center text-2xl bg-bg-main text-white'>
					<Loader size='large' />
				</main>
			) : (
				children
			)}
		</UserDetailsContext.Provider>
	);
};
