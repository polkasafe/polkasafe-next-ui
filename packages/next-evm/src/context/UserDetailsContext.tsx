// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { EthersAdapter } from '@safe-global/protocol-kit';
import { useAddress, useMetamask, useNetworkMismatch, useSigner } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { chainProperties, NETWORK } from '@next-common/global/evm-network-constants';
import returnTxUrl from '@next-common/global/gnosisService';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { EFieldType, IUser, Triggers, UserDetailsContextTypeEVM, Wallet } from '@next-common/types';
import InvalidNetwork from '@next-common/ui-components/InvalidNetwork';
import { convertSafeMultisig } from '@next-evm/utils/convertSafeData/convertSafeMultisig';
import { EVM_API_AUTH_URL } from '@next-common/global/apiUrls';

import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import logout from '@next-evm/utils/logout';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';
import { useGlobalApiContext } from './ApiContext';

const initialUserDetailsContext: UserDetailsContextTypeEVM = {
	activeMultisig: (typeof window !== 'undefined' && localStorage.getItem('active_multisig')) || '',
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
	const address = useAddress();
	const isNetworkMismatch = useNetworkMismatch();
	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const [activeMultisigData, setActiveMultisigData] = useState<any>({});
	const { network } = useGlobalApiContext();
	const router = useRouter();
	const [gnosisSafe, setGnosisSafe] = useState<GnosisSafeService>({} as any);
	const signer = useSigner();

	const [loading, setLoading] = useState(false);
	const connect = useMetamask();

	const searchParams = useSearchParams();

	const sharedSafeAddress = searchParams.get('safe');
	const sharedSafeNetwork = searchParams.get('network');

	const prevActiveMultisig = typeof window !== 'undefined' && localStorage.getItem('active_multisig');

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const getSharedSafeAddressData = useCallback(async () => {
		if (!sharedSafeAddress || !sharedSafeNetwork) return;

		if (typeof window !== 'undefined' && localStorage.getItem('signature')) {
			const signature = localStorage.getItem('signature');
			setLoading(true);
			const { data: userData, error: connectAddressErr } = await nextApiClientFetch<IUser>(
				`${EVM_API_AUTH_URL}/connectAddressEth`,
				{},
				{ address, signature, network }
			);
			if (!connectAddressErr && userData) {
				setUserDetailsContextState((prevState) => {
					return {
						...prevState,
						activeMultisig: sharedSafeAddress,
						address: userData?.address,
						addressBook: userData?.addressBook || [],
						createdAt: userData?.created_at,
						multisigAddresses: userData?.multisigAddresses?.filter((a: any) => a.network === network),
						multisigSettings: userData?.multisigSettings || {},
						notification_preferences:
							userData?.notification_preferences || initialUserDetailsContext.notification_preferences,
						transactionFields: userData?.transactionFields || initialUserDetailsContext.transactionFields
					};
				});
			}
		}

		let gnosisService: GnosisSafeService;
		if (signer) {
			const txUrl = returnTxUrl(sharedSafeNetwork as NETWORK);
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: signer
			});
			gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
			setGnosisSafe(gnosisService);
		} else {
			const txUrl = returnTxUrl(sharedSafeNetwork as NETWORK);
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: ethers.getDefaultProvider()
			});
			gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
			setGnosisSafe(gnosisService);
		}

		const multiData = await gnosisService.getMultisigData(sharedSafeAddress);
		if (multiData) {
			const activeData = convertSafeMultisig({
				...multiData,
				name: DEFAULT_ADDRESS_NAME,
				network: sharedSafeNetwork || network
			});
			setActiveMultisigData({ ...activeData });
		}
		if (!multiData) {
			router.push('/');
		}
		let isOwner = false;
		if (address) {
			const multisigsOfAddress = await gnosisService.getAllSafeByOwner(address);
			if (multisigsOfAddress.safes.includes(sharedSafeAddress)) {
				isOwner = true;
			}
		}
		setUserDetailsContextState((prev) => ({
			...prev,
			activeMultisig: sharedSafeAddress,
			isSharedSafe: true,
			notOwnerOfSafe: !isOwner,
			sharedSafeAddress,
			sharedSafeNetwork: sharedSafeNetwork as NETWORK
		}));
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, sharedSafeAddress, sharedSafeNetwork, signer, address]);

	const connectAddress = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-shadow, sonarjs/cognitive-complexity
		async (passedNetwork: string = network, address?: string, signature?: string) => {
			if (isNetworkMismatch) {
				return;
			}
			if (!address && typeof window !== 'undefined' && !localStorage.getItem('address')) {
				return;
			}
			setLoading(true);
			const { data: userData, error: connectAddressErr } = await nextApiClientFetch<IUser>(
				`${EVM_API_AUTH_URL}/connectAddressEth`,
				{},
				{ address, signature, network: passedNetwork }
			);
			if (!connectAddressErr && userData) {
				setUserDetailsContextState((prevState) => {
					return {
						...prevState,
						activeMultisig:
							prevActiveMultisig &&
							userData?.multisigAddresses?.some(
								(item) => item.address === prevActiveMultisig && item.network === network
							)
								? prevActiveMultisig
								: userData?.multisigAddresses?.filter(
										(a: any) =>
											a.network === network && !userData?.multisigSettings?.[`${a.address}`]?.deleted && !a.disabled
								  )?.[0]?.address || '',
						address: userData?.address,
						addressBook: userData?.addressBook || [],
						createdAt: userData?.created_at,
						multisigAddresses: userData?.multisigAddresses?.filter((a: any) => a.network === network),
						multisigSettings: userData?.multisigSettings || {},
						notification_preferences:
							userData?.notification_preferences || initialUserDetailsContext.notification_preferences,
						transactionFields: userData?.transactionFields || initialUserDetailsContext.transactionFields,
						watchlists: userData?.watchlists
					};
				});
				if (!signer) {
					await connect({
						chainId: chainProperties?.[network].chainId || 592
					});
				}
				if (signer) {
					const txUrl = returnTxUrl(network);
					const web3Adapter = new EthersAdapter({
						ethers,
						signerOrProvider: signer
					});
					const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
					setGnosisSafe(gnosisService);
				}
			} else {
				logout();
				setUserDetailsContextState(initialUserDetailsContext);
				router.push('/');
			}
			setLoading(false);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[network, signer]
	);

	useEffect(() => {
		if (signer) {
			const txUrl = returnTxUrl(
				userDetailsContextState.activeMultisig === sharedSafeAddress ? (sharedSafeNetwork as NETWORK) : network
			);
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: signer
			});
			const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
			setGnosisSafe(gnosisService);
		}
	}, [network, sharedSafeAddress, sharedSafeNetwork, signer, userDetailsContextState.activeMultisig]);

	const updateCurrentMultisigData = useCallback(async () => {
		if (
			!userDetailsContextState.activeMultisig ||
			Boolean(!Object.keys(gnosisSafe).length) ||
			!userDetailsContextState.multisigAddresses ||
			!userDetailsContextState.address
		) {
			return;
		}
		try {
			let activeData: any = {};
			const multisig = userDetailsContextState.multisigAddresses.find(
				(multi) => multi.address === userDetailsContextState.activeMultisig
			);
			if (!multisig) {
				return;
			}
			if (!userDetailsContextState.activeMultisig) {
				return;
			}
			const multiData = await gnosisSafe.getMultisigData(userDetailsContextState.activeMultisig);
			if (multiData) {
				activeData = convertSafeMultisig({
					...multiData,
					name: multisig?.name || DEFAULT_ADDRESS_NAME,
					network
				});
			}
			const safeBalance = await signer?.provider?.getBalance(userDetailsContextState.activeMultisig);
			setActiveMultisigData({ ...activeData, safeBalance });
		} catch (err) {
			console.log('err from update current multisig data', err);
		}
	}, [
		network,
		gnosisSafe,
		signer?.provider,
		userDetailsContextState.address,
		userDetailsContextState.activeMultisig,
		userDetailsContextState.multisigAddresses
	]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (
			sharedSafeAddress &&
			isValidWeb3Address(sharedSafeAddress) &&
			sharedSafeNetwork &&
			Object.values(NETWORK).includes(sharedSafeNetwork as NETWORK)
		) {
			getSharedSafeAddressData();
			return;
		}
		if (address) {
			if (typeof window !== 'undefined' && localStorage.getItem('address') !== address && !sharedSafeAddress) {
				localStorage.removeItem('signature');
				localStorage.removeItem('address');
				setUserDetailsContextState(initialUserDetailsContext);
				router.replace('/');
				setLoading(false);
				return;
			}
			if (typeof window !== 'undefined' && localStorage.getItem('signature')) {
				const signature = localStorage.getItem('signature') || '';
				connectAddress(network, address, signature);
			} else {
				if (typeof window !== 'undefined') localStorage.clear();
				setLoading(false);
				if (!sharedSafeAddress) router.push('/');
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, network, sharedSafeAddress, sharedSafeNetwork]);

	useEffect(() => {
		if (!userDetailsContextState.activeMultisig || userDetailsContextState.activeMultisig === sharedSafeAddress) {
			return;
		}
		updateCurrentMultisigData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetailsContextState]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleNetworkMisMatch = async () => {
		await connect({ chainId: chainProperties?.[network].chainId || 592 });
	};

	useEffect(() => {
		if (isNetworkMismatch) {
			handleNetworkMisMatch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNetworkMismatch]);

	const value = useMemo(
		() => ({
			activeMultisigData,
			connectAddress,
			loading,
			...userDetailsContextState,
			gnosisSafe,
			isNetworkMismatch,
			setActiveMultisigData,
			setGnosisSafe,
			setLoading,
			setUserDetailsContextState,
			updateCurrentMultisigData
		}),
		[
			activeMultisigData,
			connectAddress,
			gnosisSafe,
			isNetworkMismatch,
			loading,
			updateCurrentMultisigData,
			userDetailsContextState
		]
	);

	if (!gnosisSafe) return null;

	return (
		<UserDetailsContext.Provider value={value}>
			{isNetworkMismatch &&
			typeof window !== 'undefined' &&
			localStorage.getItem('signature') &&
			!Object.values(NETWORK).includes(network) ? (
				<InvalidNetwork />
			) : (
				children
			)}
		</UserDetailsContext.Provider>
	);
};
