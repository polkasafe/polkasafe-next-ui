// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	ECHANNEL,
	EProposalType,
	ENetwork,
	ETransactionCreationType,
	ETxType,
	EUserType
} from '@common/enum/substrate';
import { ApiPromise } from '@polkadot/api';
import { ApiPromise as AvailApiPromise } from 'avail-js-sdk';
import { SignerOptions, SubmittableExtrinsic, SignerResult } from '@polkadot/api/types';
import { BN } from '@polkadot/util';
import Client from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes } from '@walletconnect/types';

// RULES: Interface should be in PascalCase
// RULES: Interface should have I prefix

export interface ISearchParams {
	[key: string]: string;
}

export interface IProxy {
	name: string;
	address: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IMultisig {
	name: string;
	address: string;
	threshold: number;
	signatories: Array<string>;
	balance: string;
	disabled: boolean;
	network: ENetwork;
	createdAt: Date;
	updatedAt: Date;
	proxy: Array<IProxy>;
	linked?: boolean;
}

export interface ITxnCategory {
	category: string;
	subfields: { [subfield: string]: { name: string; value: string } };
}

export interface IDashboardTransaction {
	callHash: string;
	callData: string;
	amountToken: string;
	network: string;
	createdAt: Date;
	multisigAddress: string;
	from: string;
	to?: string;
	transactionFields?: ITxnCategory;
	approvals: string[];
	callModule?: string;
	callModuleFunction?: string;
	txType?: ETxType;
	initiator?: string;
	multiId?: string;
}

export interface ITransaction {
	id: string;
	from: string;
	to: string[];
	callData: string;
	callHash: string;
	blockNumber: number;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	token: string;
	amountUSD: number;
	amountToken: number;
	network: string;
	transactionFields?: ITxnCategory;
	approvals: Array<string>;
}

export interface IChannelPreferences {
	name: ECHANNEL;
	enabled: boolean;
	handle: string;
	verified: boolean;
	verification_token?: string;
}

export interface IAddressBook {
	address: string;
	name: string;
	roles?: Array<string>;
	email?: string;
	discord?: string;
	telegram?: string;
	nickName?: string;
}

export interface ITriggerPreferences {
	name: string;
	enabled: boolean;
	[index: string]: any;
}

export interface INotificationPreferences {
	channelPreferences: { [index: string]: IChannelPreferences };
	triggerPreferences: { [index: string]: ITriggerPreferences };
}

export interface IUserOrganisation {
	id: string;
}

export interface IOrganisation {
	id: string;
	members: Array<string>;
	multisigs: Array<IMultisig>;
	createdAt: Date;
	updatedAt: Date;
	addressBook: Array<IAddressBook>;
	transactionFields: ITransactionFields;
	city: string;
	country: string;
	imageURI: string;
	name: string;
	address: string;
	postalCode: string;
	state: string;
	taxNumber: string;
	image?: string;
}
export interface IConnectedUser {
	address: string;
	signature: string;
	organisations: Array<IOrganisation>;
	notificationPreferences?: INotificationPreferences;
	watchlists?: { [address: string]: IWatchList };
}

export interface ICookieUser {
	address: string;
	signature: string;
	currentOrganisation: string;
}

export interface IGenericResponse<T> {
	data?: T;
	error?: string;
}

export interface ICurrency {
	tokenUsdPrice: { [network: string]: { symbol: string; value: number } };
	allCurrencyPrices: { [symbol: string]: { code: string; value: number } };
}

export interface IAsset {
	balanceToken: string;
	balanceUSD: string;
	logoURI: string;
	name: string;
	symbol: string;
	multisigId?: string;
}

export interface IAssets {
	free: string;
	reserved: string;
	frozen: string;
	flags: string;
	usd: number;
	address: string;
	symbol: string;
	network: ENetwork;
	allCurrency: { [network: string]: any };
	proxyAddress?: string;
	usdt?: { free: string };
	usdc?: { free: string };
}

export interface IMultisigAssets extends IAssets {
	proxy: Array<IMultisigAssets>;
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

export interface IWatchList {
	name: string;
	address: string;
	network: string;
}

export interface IUser {
	userId: string;
	address: any;
	email: string | null;
	created_at: Date;
	notification_preferences?: INotificationPreferences;
	two_factor_auth?: I2FASettings;
	tfa_token?: I2FAToken;
	multisigAddresses: Array<string>;
	type: EUserType;
	watchLists?: Array<IWatchList>;
	linkedAddresses?: string[];
}

export interface IUserResponse {
	address: string;
	type: EUserType;
	signature?: string;
	currentOrganisation?: string;
}
export interface IResponse<T> {
	error?: string | null;
	data: T;
}

export interface IDBMultisig {
	address: string;
	created_at: Date;
	updated_at: Date;
	name: string;
	signatories: Array<string>;
	network: ENetwork;
	threshold: number;
	type: EUserType;
	proxy?: Array<IProxy>;
}

export interface IDBTransaction {
	id: string;
	multisigAddress: string;
	amount_token: string;
	amount_usd: string;
	approvals: string;
	block_number: string;
	callHash: string;
	created_at: string;
	updated_at: string;
	from: string;
	network: string;
	to: string;
	token: string;
	transactionFields: string;
	callData: string;
	note: string;
	status: string;
	initiator: string;
}

export interface IWalletConnect {
	client: Client | undefined;
	session: SessionTypes.Struct | undefined;
	connect: (pairing?: { topic: string }) => Promise<string[]>;
	disconnect?: () => Promise<void>;
	pairings: PairingTypes.Struct[];
}
export interface IDBAssets {
	address: string;
	balance_token: string;
	balance_usd: string;
	logoURI: string;
	name: string;
	symbol: string;
}

export interface IUpdateDBAssetProps extends IDBAssets {
	multisigId: string;
}

export interface ISubstrateExecuteProps {
	api: ApiPromise | AvailApiPromise;
	apiReady: boolean;
	network: ENetwork;
	tx: SubmittableExtrinsic<'promise'>;
	address: string;
	params?: Partial<SignerOptions>;
	errorMessageFallback: string;
	onSuccess?: (data: IGenericObject) => Promise<void> | void;
	onFailed?: (errorMessageFallback?: string) => Promise<void> | void;
	setStatus?: (pre: string) => void;
}

export interface IRecipient {
	address: string;
	amount: BN;
	currency: string;
}

export interface ISendTransactionForm {
	recipient: string;
	amount: BN;
	note: string;
	selectedMultisigAddress: string;
	selectedProxy?: string;
}

export interface ISendTransaction {
	recipients: Array<IRecipient>;
	note?: string;
	sender: IMultisig;
	selectedProxy?: string;
	transactionFields?: ITxnCategory;
	tip?: string;
	type: ETransactionCreationType;
}
export interface ITeleportAssetTransaction {
	recipientAddress: string;
	recipientNetwork: ENetwork;
	amount: BN;
	note?: string;
	sender: IMultisig;
	selectedProxy?: string;
	transactionFields?: ITxnCategory;
	tip?: string;
	type: ETransactionCreationType;
}

export interface ISetIdentityTransaction {
	sender: IMultisig;
	displayName?: string;
	legalName?: string;
	elementHandle?: string;
	websiteUrl?: string;
	twitterHandle?: string;
	email?: string;
	type: ETransactionCreationType;
}

export interface IDelegateTransaction {
	sender: IMultisig;
	proxyAddress: string;
	proxyType: string;
	type: ETransactionCreationType;
}

export interface ICallDataTransaction {
	sender: IMultisig;
	callData: string;
	type: ETransactionCreationType;
	proxyAddress?: string;
	transactionFields?: ITxnCategory;
}
export interface ICancelOrKillTransaction {
	sender: IMultisig;
	postIndex: number;
	type: ETransactionCreationType;
	proposalType: EProposalType;
	proxyAddress?: string;
}

export interface IGenericObject {
	[key: string]: any;
}

export interface IFundMultisig {
	multisig: IMultisig;
	amount: BN;
	selectedProxy?: string;
}

export interface IMultisigCreate {
	name: string;
	signatories: Array<string>;
	network: ENetwork;
	threshold: number;
}

export interface IDBOrganisation {
	id?: string;
	members: Array<string>;
	multisigs: Array<string>;
	created_at: Date;
	updated_at: Date;
	organisation_address: string;
	city: string;
	country: string;
	name: string;
	postal_code: string;
	state: string;
	tax_number: string;
	imageURI: string;
	addressBook: Array<IAddressBook>;
	transactionFields?: ITransactionFields;
}

export interface QrState {
	isQrHashed: boolean;
	qrAddress: string;
	qrPayload: Uint8Array;
	qrResolve?: (result: SignerResult) => void;
	qrReject?: (error: Error) => void;
}

export enum NotificationStatus {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info'
}

export interface ICreateMultisig {
	networks: Array<ENetwork>;
	availableSignatories: Array<IAddressBook>;
	onSubmit: (values: IMultisigCreate) => Promise<void>;
	userAddress: string;
	onClose?: () => void;
}

export interface ILinkMultisig {
	networks: Array<ENetwork>;
	linkedMultisig: Array<IMultisig>;
	availableMultisig: Array<IMultisig>;
	onSubmit: (multisigs: IMultisig) => Promise<void>;
	onRemoveSubmit: (multisigs: IMultisig) => Promise<void>;
	fetchMultisig: (network: ENetwork) => Promise<void>;
	className?: string;
}

export interface ICreateOrganisationDetails {
	name: string;
	description: string;
	image?: string;
	multisigs?: Array<IDBMultisig>;
	organisationAddress?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	state?: string;
	taxNumber?: string;
	imageURI?: string;
	addressBook?: Array<string>;
	transactionFields?: ITransactionFields;
}

export interface IReviewTransaction {
	tx: IGenericObject;
	from: string;
	to?: string;
	name?: string;
	proxyAddress?: string;
	txCost?: string;
	network: ENetwork;
	txHash?: string;
	createdAt?: Date;
}

export interface IGetTransaction {
	type: ETxType;
	api: ApiPromise;
	data: Array<{
		amount: BN;
		recipient: string;
	}> | null;
	multisig: IMultisig;
	sender: string;
	proxyAddress?: string;
	isProxy?: boolean;
	calldata?: string;
	callHash?: string;
	newSignatories?: Array<string>;
	params?: Partial<SignerOptions>;
	newThreshold?: number;
	onSuccess?: (data: IGenericObject) => void;
	onFailed?: () => void;
}

export interface ITransferTransaction {
	api: ApiPromise;
	data: Array<{
		amount: BN;
		recipient: string;
		currency: string;
	}>;
	multisig: IMultisig;
	proxyAddress?: string;
	isProxy?: boolean;
	params?: Partial<SignerOptions>;
	sender: string;
	onSuccess?: (data: IGenericObject) => void;
	onFailed?: () => void;
}

export interface IFundTransaction {
	api: ApiPromise;
	data: Array<{
		amount: BN;
		recipient: string;
	}>;
	multisig: IMultisig;
	sender: string;
	onSuccess?: (data: IGenericObject) => void;
	onFailed?: () => void;
}

export interface ITeleportTransaction {
	api: ApiPromise;
	recipientAddress: string;
	amount: BN;
	recipientNetwork: ENetwork;
	multisig: IMultisig;
	proxyAddress?: string;
	isProxy?: boolean;
	params?: Partial<SignerOptions>;
	sender: string;
	onSuccess?: (data: IGenericObject) => void;
	onFailed?: () => void;
}

export interface ICreateProxyTransaction {
	api: ApiPromise;
	multisig: IMultisig;
	sender: string;
	onSuccess: (data: IGenericObject) => void;
	onFailed: () => void;
}

export interface ICancelTransaction {
	api: ApiPromise;
	multisig: IMultisig;
	sender: string;
	callHash: string;
	onSuccess: (data: IGenericObject) => void;
	onFailed: () => void;
}

export interface IApproveTransaction {
	api: ApiPromise;
	multisig: IMultisig;
	sender: string;
	calldata: string;
	callHash: string;
	onSuccess: (data: IGenericObject) => void;
	onFailed: () => void;
}

export interface IEditMultisigTransaction {
	api: ApiPromise;
	newSignatories?: Array<string>;
	newThreshold?: number;
	multisig: IMultisig;
	proxyAddress: string;
	sender: string;
	onSuccess: (data: IGenericObject) => void;
	onFailed: () => void;
}
export interface ISetIdentityMultisigTransaction {
	api: ApiPromise;
	multisig: IMultisig;
	sender: string;
	data: {
		displayName?: string;
		legalName?: string;
		elementHandle?: string;
		websiteUrl?: string;
		twitterHandle?: string;
		email?: string;
	};
	onSuccess: (data: IGenericObject) => void;
	onFailed: () => void;
}

export interface IDelegateMultisigTransaction {
	api: ApiPromise;
	multisig: IMultisig;
	sender: string;
	proxyAddress: string;
	proxyType: string;
	onSuccess: (data: IGenericObject) => void;
	onFailed: () => void;
}

export interface ICallDataMultisigTransaction {
	api: ApiPromise;
	multisig: IMultisig;
	proxyAddress?: string;
	sender: string;
	callDataString: string;
	onSuccess: (data: IGenericObject) => void;
	onFailed: () => void;
	type: ETransactionCreationType;
}

export interface IDropdownOptions {
	optionName: string;
	archieved?: boolean;
}

export interface ITransactionFields {
	[field: string]: {
		fieldName: string;
		fieldDesc: string;
		subfields: ITransactionCategorySubfields;
	};
}

export interface ITransactionCategorySubfields {
	[subfield: string]: {
		subfieldName: string;
		subfieldType: EFieldType;
		dropdownOptions?: IDropdownOptions[];
	};
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

export interface IInvoice {
	id?: string;
	organisationId: string;
	title: string;
	from: string;
	to: Array<string>;
	network: string;
	amount: string;
	amountPaid?: string;
	note: string;
	status: {
		current_status: string;
		history: Array<{ status: string; updated_at: Date }>;
	};
	paid_from: null | [{ token: string; amount: number; wallet: string; timestamp: Date; dollarValue: string }];
	files: string;
	transactionHash: string;
	created_at: Date;
}

export interface IInvoiceTemplate {
	organisationId: string;
	title: string;
	from: string;
	note: string;
	created_at: Date;
}
