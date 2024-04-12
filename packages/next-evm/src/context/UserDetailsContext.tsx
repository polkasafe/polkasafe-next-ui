// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NETWORK } from '@next-common/global/evm-network-constants';
import GnosisSafeService from '@next-evm/services/Gnosis';
import {
	EFieldType,
	IMultisigAndNetwork,
	IUser,
	Triggers,
	UserDetailsContextTypeEVM,
	Wallet
} from '@next-common/types';
import InvalidNetwork from '@next-common/ui-components/InvalidNetwork';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';

import logout from '@next-evm/utils/logout';
import { usePrivy, useWallets } from '@privy-io/react-auth';
// import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
// import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { useGlobalApiContext } from './ApiContext';

const initialUserDetailsContext: UserDetailsContextTypeEVM = {
	userID: '',
	organisations: [],
	activeMultisig: (typeof window !== 'undefined' && localStorage.getItem('active_multisig')) || '',
	activeMultisigData: {} as IMultisigAndNetwork,
	address: (typeof window !== 'undefined' && localStorage.getItem('address')) || '',
	addressBook: [],
	createdAt: new Date(),
	gnosisSafe: {} as any,
	loggedInWallet: Wallet.METAMASK,
	multisigAddresses: [],
	multisigSettings: {},
	isNetworkMismatch: false,
	notOwnerOfSafe: false,
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
	setActiveMultisigData: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	setGnosisSafe: (): void => {},
	setUserDetailsContextState: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	updateCurrentMultisigData: (): void => {
		throw new Error('updateCurrentMultisigData function must be overridden');
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

export const UserDetailsContext: React.Context<UserDetailsContextTypeEVM> = createContext(initialUserDetailsContext);

export function useGlobalUserDetailsContext() {
	return useContext(UserDetailsContext);
}

export const UserDetailsProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const { network } = useGlobalApiContext();
	const router = useRouter();
	const [gnosisSafe, setGnosisSafe] = useState<GnosisSafeService>({} as any);
	const { wallets } = useWallets();

	const [loading, setLoading] = useState(false);

	const searchParams = useSearchParams();

	const { user, authenticated } = usePrivy();

	console.log('user', user);

	const sharedSafeAddress = searchParams.get('safe');
	const sharedSafeNetwork = searchParams.get('network');

	const connectAddress = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-shadow, sonarjs/cognitive-complexity, @typescript-eslint/no-unused-vars
		async (userID: string, address?: string, isLogin?: boolean) => {
			console.log('connectAddress claleed');
			if (!userID) {
				return;
			}
			setLoading(true);
			const loginRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/loginEth`, {
				headers: firebaseFunctionsHeader(wallets?.[0]?.address || address),
				method: 'POST'
			});
			const { data: userData, error: loginError } = (await loginRes.json()) as {
				data: IUser;
				error: string;
			};
			console.log('login', userData, loginError);

			// const { data: userData, error: connectAddressErr } = await nextApiClientFetch<IUser>(
			// `${EVM_API_AUTH_URL}/connectAddressEth`,
			// {},
			// { address, userID }
			// );
			if (!loginError && userData) {
				setUserDetailsContextState((prevState) => {
					return {
						...prevState,
						organisations: userData.organisations || [],
						userID: userData.userId,
						activeMultisig: '',
						address: userData?.address?.[0],
						addressBook: userData?.addressBook || [],
						createdAt: userData?.created_at,
						multisigAddresses: userData?.multisigAddresses?.filter((a: any) => a.network === network),
						multisigSettings: userData?.multisigSettings || {},
						notification_preferences:
							userData?.notification_preferences || initialUserDetailsContext.notification_preferences,
						transactionFields: userData?.transactionFields || initialUserDetailsContext.transactionFields,
						watchlists: userData?.watchlists,
						invoices: userData?.invoices
					};
				});
				if (!userData.organisations || userData.organisations.length === 0) {
					console.log('home');
					router.replace('/create-org');
				} else if (isLogin) {
					router.replace('/');
				}
			} else {
				logout();
				setUserDetailsContextState(initialUserDetailsContext);
				console.log('in logout block');
				router.push('/login');
			}
			setLoading(false);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[network]
	);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		// if (
		// sharedSafeAddress &&
		// isValidWeb3Address(sharedSafeAddress) &&
		// sharedSafeNetwork &&
		// Object.values(NETWORK).includes(sharedSafeNetwork as NETWORK)
		// ) {
		// // getSharedSafeAddressData();
		// return;
		// }
		if (authenticated) {
			console.log('wallet changed');
			connectAddress(user?.id, user?.wallet?.address);
		}
	}, [authenticated, connectAddress, network, router, sharedSafeAddress, sharedSafeNetwork, user]);

	useEffect(() => {}, []);

	const value = useMemo(
		() => ({
			connectAddress,
			loading,
			...userDetailsContextState,
			gnosisSafe,
			setGnosisSafe,
			setLoading,
			setUserDetailsContextState
		}),
		[connectAddress, gnosisSafe, loading, userDetailsContextState]
	);

	if (!gnosisSafe) return null;

	return (
		<UserDetailsContext.Provider value={value}>
			{typeof window !== 'undefined' &&
			localStorage.getItem('signature') &&
			!Object.values(NETWORK).includes(network) ? (
				<InvalidNetwork />
			) : (
				children
			)}
		</UserDetailsContext.Provider>
	);
};
