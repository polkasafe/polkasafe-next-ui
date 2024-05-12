/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line import/no-cycle
import GnosisSafeService from '@next-evm/services/Gnosis';
import { Dispatch, SetStateAction } from 'react';
import { StaticImageData } from 'next/image';
import { NETWORK } from './global/evm-network-constants';

export enum CHANNEL {
	EMAIL = 'email',
	TELEGRAM = 'telegram',
	DISCORD = 'discord',
	ELEMENT = 'element',
	SLACK = 'slack',
	IN_APP = 'in_app'
}

export interface ITransactionFields {
	[field: string]: {
		fieldName: string;
		fieldDesc: string;
		subfields: ITransactionCategorySubfields;
	};
}

export interface IMultisigAndNetwork {
	name?: string;
	address: string;
	network: string;
}

export interface IOrganisation {
	id: string;
	imageURI?: string;
	name: string;
	desc?: string;
	multisigs: IMultisigAddress[];
	addressBook: IAddressBookItem[];
	members: string[];
	transactionFields: ITransactionFields;
	userFullName?: string;
	country?: string;
	state?: string;
	city?: string;
	postalCode?: string;
	organisationAddress?: string;
	taxNumber?: string;
}

export interface IUserNotificationChannelPreferences {
	name: CHANNEL;
	enabled: boolean;
	handle: string;
	verified: boolean;
	verification_token?: string;
}

export interface IUserNotificationTriggerPreferences {
	name: string;
	enabled: boolean;
	[index: string]: any;
}

export interface IUserNotificationPreferences {
	channelPreferences: { [index: string]: IUserNotificationChannelPreferences };
	triggerPreferences: { [index: string]: IUserNotificationTriggerPreferences };
}

export enum Triggers {
	CANCELLED_TRANSACTION = 'cancelledTransaction',
	CREATED_PROXY = 'createdProxy',
	EDIT_MULTISIG_USERS_EXECUTED = 'editMultisigUsersExecuted',
	EDIT_MULTISIG_USERS_START = 'editMultisigUsersStart',
	EXECUTED_PROXY = 'executedProxy',
	EXECUTED_TRANSACTION = 'executedTransaction',
	INIT_MULTISIG_TRANSFER = 'initMultisigTransfer',
	SCHEDULED_APPROVAL_REMINDER = 'scheduledApprovalReminder',
	APPROVAL_REMINDER = 'approvalReminder'
}

export interface IDropdownOptions {
	optionName: string;
	archieved?: boolean;
}

export enum EFieldType {
	ATTACHMENT = 'Attachment',
	SINGLE_SELECT = 'Single-select',
	// MULTI_SELECT = 'Multi-select',
	TEXT = 'Text'
	// NUMBER = 'Number',
	// DATE = 'Date/Date-range',
	// LINK = 'link',
}

export interface ITransactionCategorySubfields {
	[subfield: string]: {
		subfieldName: string;
		subfieldType: EFieldType;
		required: boolean;
		dropdownOptions?: IDropdownOptions[];
	};
}

export interface IWatchlist {
	name: string;
	address: string;
	network: string;
}

export interface UserDetailsContextType {
	organisations?: IOrganisation[];
	userID: string;
	loading?: boolean;
	loggedInWallet: Wallet;
	linkedAddresses?: string[];
	activeMultisig: string;
	isProxy: boolean;
	address: string;
	createdAt: Date;
	multisigAddresses: IMultisigAddress[];
	multisigSettings: { [multisigAddress: string]: IMultisigSettings };
	notification_preferences: IUserNotificationPreferences;
	addressBook: IAddressBookItem[];
	notifiedTill: Date | null;
	setUserDetailsContextState: Dispatch<SetStateAction<UserDetailsContextType>>;
	transactionFields: ITransactionFields;
	two_factor_auth?: I2FASettings;
	tfa_token?: I2FAToken;
	isSharedMultisig?: boolean;
	notOwnerOfMultisig?: boolean;
	sharedMultisigNetwork?: NETWORK;
	sharedMultisigAddress?: string;
	sharedMultisigInfo?: { signatories: string[]; threshold: number; address: string; name?: string };
	watchlists?: { [address: string]: IWatchlist };
	selectedProxy?: string;
}

export interface IInvoice {
	id: string;
	created_at: string;
	organisationId: string;
	title: string;
	from: string;
	to: Array<string>;
	network: string;
	amount: string;
	note: string;
	status: {
		current_status: string;
		history: Array<{ status: string; updated_at: Date }>;
	};
	paid_from: null | [{ token: string; amount: number }];
	files: string;
	transactionHash: string;
}

export enum EINVOICE_STATUS {
	PENDING = 'pending',
	REJECTED = 'rejected',
	APPROVED = 'approved',
	PAID = 'paid'
}

export interface UserDetailsContextTypeEVM {
	organisations?: IOrganisation[];
	invoices?: {
		sentInvoices: Array<IInvoice>;
		recivedInvoices: Array<IInvoice>;
	};
	userID: string;
	loggedInWallet: any;
	activeMultisig: string;
	address: string;
	createdAt: Date;
	fetchUserData?: any;
	fetchMultisigTransactionData?: any;
	multisigAddresses: IMultisigAddress[];
	multisigSettings: { [multisigAddress: string]: IMultisigSettings };
	addressBook: IAddressBookItem[];
	setUserDetailsContextState: Dispatch<SetStateAction<UserDetailsContextTypeEVM>>;
	activeMultisigData: IMultisigAndNetwork;
	activeMultisigTxs?: any[];
	setLoading?: any;
	loading?: boolean;
	setActiveMultisigData: any;
	updateCurrentMultisigData: any;
	login?: () => any;
	notification_preferences?: any;
	connectAddress?: any;
	gnosisSafe: GnosisSafeService;
	setGnosisSafe: any;
	transactionFields: ITransactionFields;
	isNetworkMismatch: boolean;
	isSharedSafe?: boolean;
	notOwnerOfSafe?: boolean;
	sharedSafeNetwork?: NETWORK;
	sharedSafeAddress?: string;
	watchlists?: { [address: string]: IWatchlist };
}

export enum Wallet {
	POLKADOT = 'polkadot-js',
	SUBWALLET = 'subwallet-js',
	TALISMAN = 'talisman',
	METAMASK = 'metamask'
}

export interface AccountMeta {
	genesisHash: string | undefined;
	name: string;
	source: string;
}

export interface Account {
	address: string;
	meta: AccountMeta;
}

export interface IAddressBookItem {
	name: string;
	address: string;
	email?: string;
	discord?: string;
	telegram?: string;
	roles?: string[];
	nickName?: string;
}

export interface IMultisigSettings {
	deleted: boolean;
	name: string;
}

export interface I2FASettings {
	base32_secret: string;
	enabled: boolean;
	url: string;
	verified: boolean;
}

export interface IGenerate2FAResponse {
	base32_secret: string;
	url: string;
}

export interface I2FAToken {
	token: string;
	created_at: Date;
}

export interface IUser {
	organisations?: IOrganisation[];
	invoices?: {
		sentInvoices: Array<IInvoice>;
		recivedInvoices: Array<IInvoice>;
	};
	userId: string;
	address: string;
	email: string | null;
	addressBook?: IAddressBookItem[];
	created_at: Date;
	multisigAddresses: IMultisigAddress[];
	multisigSettings: { [multisigAddress: string]: IMultisigSettings };
	notification_preferences: IUserNotificationPreferences;
	transactionFields?: ITransactionFields;
	two_factor_auth?: I2FASettings;
	tfa_token?: I2FAToken;
	watchlists?: { [address: string]: IWatchlist };
	linkedAddresses?: string[];
}

export interface IMultisigAddress {
	address: string;
	name: string;
	signatories: string[];
	network: string;
	created_at?: Date;
	updated_at?: Date;
	threshold: number;
	proxy?: string | Array<{ address: string; name?: string; linked?: boolean }>;
	disabled?: boolean;
}

export interface IUserResponse extends IUser {
	multisigAddresses: IMultisigAddress[];
}

export interface IAsset {
	name: string;
	logoURI: string;
	symbol: string;
	balance_usd: string;
	balance_token: string;
	token_decimals?: number;
	tokenAddress?: string | null;
	fiat_conversion?: string;
	type?: EAssetType;
}

export interface INFTAsset {
	network: string;
	name: string;
	tokenNameWithID: string;
	logoURI?: string;
	symbol?: string;
	tokenAddress: string;
	tokenId: string;
	imageUri: string;
}

export enum EAssetType {
	NATIVE_TOKEN = 'NATIVE_TOKEN',
	ERC20 = 'ERC20'
}

export interface ITxNotification {
	[address: string]: {
		lastNotified: Date;
	};
}

export interface ITxnCategory {
	category: string;
	subfields: { [subfield: string]: { name: string; value: string } };
}

export interface IQueueItem {
	multi_id?: string;
	approvals?: string[];
	totalAmount?: string;
	transactionFields?: ITxnCategory;
	callData: string;
	callHash: string;
	network: string;
	status: 'Approval' | 'Cancelled' | 'Executed';
	created_at: Date;
	threshold: number;
	note?: string;
	notifications?: ITxNotification;
	multisigAddress?: string;
}

export interface ITransaction {
	multi_id?: string;
	approvals?: string[];
	callData?: string;
	callHash: string;
	created_at: Date;
	block_number: number;
	from: string;
	to: string | string[];
	id?: string;
	token: string;
	amount_usd: number;
	amount_token: string;
	multisigAddress?: string;
	network: string;
	note?: string;
	transactionFields?: ITxnCategory;
	notifications?: {
		[address: string]: {
			lastNotified: Date;
		};
	};
}

export interface INotification {
	id: string;
	addresses: string[];
	created_at: Date;
	message: string;
	link?: string;
	type: 'sent' | 'recieved' | 'cancelled' | 'info';
	network: string;
}

export enum NotificationStatus {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info'
}

export interface ISharedAddressBookRecord {
	name: string;
	address: string;
	created_at?: Date;
	email?: string;
	discord?: string;
	telegram?: string;
	roles?: string[];
	updated_at?: Date;
	updatedBy?: string;
}

export interface ISharedAddressBooks {
	records: {
		[address: string]: ISharedAddressBookRecord;
	};
	roles?: string[];
	multisig: string;
}

export interface IAllAddresses {
	[address: string]: {
		name: string;
		address: string;
		shared?: boolean;
		nickName?: string;
		email?: string;
		discord?: string;
		telegram?: string;
		roles?: string[];
	};
}

export const PostOrigin = {
	AUCTION_ADMIN: 'AuctionAdmin',
	BIG_SPENDER: 'BigSpender',
	BIG_TIPPER: 'BigTipper',
	CANDIDATES: 'Candidates',
	EXPERTS: 'Experts',
	FELLOWS: 'Fellows',
	FELLOWSHIP_ADMIN: 'FellowshipAdmin',
	GENERAL_ADMIN: 'GeneralAdmin',
	GRAND_MASTERS: 'GrandMasters',
	LEASE_ADMIN: 'LeaseAdmin',
	MASTERS: 'Masters',
	MEDIUM_SPENDER: 'MediumSpender',
	MEMBERS: 'Members',
	PROFICIENTS: 'Proficients',
	REFERENDUM_CANCELLER: 'ReferendumCanceller',
	REFERENDUM_KILLER: 'ReferendumKiller',
	ROOT: 'root',
	SENIOR_EXPERTS: 'SeniorExperts',
	SENIOR_FELLOWS: 'SeniorFellows',
	SENIOR_MASTERS: 'SeniorMasters',
	SMALL_SPENDER: 'SmallSpender',
	SMALL_TIPPER: 'SmallTipper',
	STAKING_ADMIN: 'StakingAdmin',
	TREASURER: 'Treasurer',
	WHITELISTED_CALLER: 'WhitelistedCaller'
};

export type TrackInfoType = {
	[index: string]: TrackProps;
};

export interface TrackProps {
	trackId: number;
	group?: string;
	description: string;
	[index: string]: any;
}

export interface MessageType {
	message: string;
}

export interface IApiResponse<T> {
	data: T | null;
	error: string | null;
	status?: number;
}

export interface IFeedback {
	address: string;
	rating: number;
	review: string;
}

export interface IContactFormResponse {
	name: string;
	email: string;
	message: string;
}

export enum EExportType {
	QUICKBOOKS = 'quickbooks',
	XERO = 'xero'
}

export enum ETxnType {
	INCOMING = 'INCOMING',
	OUTGOING = 'OUTGOING'
}

export interface ITreasuryTxns {
	type: ETxnType;
	balance_usd: string;
	balance_token: string;
	txHash: string;
	timestamp: string;
	multisigAddress: string;
	network: string;
	tokenSymbol?: string;
	tokenAddress?: string;
	tokenLogoUri?: string | StaticImageData;
}

export interface ITreasury {
	[id: string]: {
		totalIncomingUSD: number;
		totalOutgoingUSD: number;
		incomingTransactions: ITreasuryTxns[];
		outgoingTransactions: ITreasuryTxns[];
	};
}
