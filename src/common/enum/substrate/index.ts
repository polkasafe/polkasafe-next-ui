// RULES: Enum with values should be in Capital case
// RULES: Enum should have E prefix

export enum ENetwork {
	ALEPHZERO = 'alephzero',
	ASTAR = 'astar',
	AVAIL = 'avail',
	KHALA = 'khala',
	KUSAMA = 'kusama',
	PHALA = 'phala',
	POLKADOT = 'polkadot',
	ROCOCO = 'rococo',
	ROCOCO_ASSETHUB = 'assethub-rococo',
	KUSAMA_ASSETHUB = 'assethub-kusama',
	POLKADOT_ASSETHUB = 'assethub-polkadot',
	WESTEND = 'westend',
	PEOPLE = 'people-polkadot',
	CENTRIFUGE = 'centrifuge',
	ROOT = 'root',
	PORCINI = 'porcini'
}

export enum ETransactionOptions {
	SENT = 'sent',
	RECEIVED = 'received',
	CREATE_PROXY = 'create_proxy',
	EDIT_SIGNATORY = 'edit_multisig',
	CUSTOM = 'custom'
}

export enum Wallet {
	POLKADOT = 'polkadot-js',
	SUBWALLET = 'subwallet-js',
	TALISMAN = 'talisman',
	METAMASK = 'metamask',
	WALLET_CONNECT = 'wallet-connect',
	POLKADOT_VAULT = 'polkadot-vault'
}

export enum EProjectType {
	SUBSTRATE = 'SUBSTRATE',
	EVM = 'EVM'
}

export enum NotificationStatus {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info'
}

export enum ECHANNEL {
	EMAIL = 'email',
	TELEGRAM = 'telegram',
	DISCORD = 'discord',
	ELEMENT = 'element',
	SLACK = 'slack',
	IN_APP = 'in_app'
}

export enum EUserType {
	SUBSTRATE = 'SUBSTRATE',
	EVM = 'EVM'
}

export enum ETransactionType {
	HISTORY_TRANSACTION = 'history',
	QUEUE_TRANSACTION = 'queue'
}

export enum ECurrency {
	USD = 'USD',
	EUR = 'EUR',
	GBP = 'GBP',
	JPY = 'JPY',
	CNY = 'CNY',
	AUD = 'AUD',
	CAD = 'CAD',
	CHF = 'CHF',
	HKD = 'HKD',
	ZAR = 'ZAR',
	SEK = 'SEK',
	NZD = 'NZD',
	KRW = 'KRW',
	SGD = 'SGD',
	NOK = 'NOK',
	MXN = 'MXN',
	INR = 'INR',
	BRL = 'BRL',
	RUB = 'RUB',
	TRY = 'TRY',
	PLN = 'PLN',
	THB = 'THB',
	IDR = 'IDR',
	HUF = 'HUF',
	CZK = 'CZK',
	ILS = 'ILS',
	DKK = 'DKK',
	CLP = 'CLP',
	PHP = 'PHP',
	COP = 'COP',
	PEN = 'PEN',
	SAR = 'SAR',
	AED = 'AED',
	MYR = 'MYR',
	RON = 'RON',
	NGN = 'NGN',
	ARS = 'ARS',
	VND = 'VND',
	ZMW = 'ZMW',
	UGX = 'UGX',
	KES = 'KES',
	EGP = 'EGP',
	BDT = 'BDT',
	MMK = 'MMK',
	IRR = 'IRR',
	ISK = 'ISK',
	LKR = 'LKR',
	GHS = 'GHS',
	AOA = 'AOA'
}

export enum ETxType {
	TRANSFER = 'transfer',
	APPROVE = 'approve',
	FUND = 'fund',
	CANCEL = 'cancel',
	ADD_PROXY = 'add_proxy',
	REMOVE_PROXY = 'remove_proxy',
	CREATE_PROXY = 'create_roxy',
	EDIT_PROXY = 'edit_proxy',
	SET_IDENTITY = 'set_identity',
	DELEGATE = 'delegate',
	TELEPORT = 'teleport',
	CALL_DATA = 'call_data',
	SET_PREIMAGE = 'set_preimage',
	CREATE_PROPOSAL = 'create_proposal',
	CANCEL_OR_KILL = 'cancel_or_kill'
}

export enum ETransactionTab {
	HISTORY = 'history',
	QUEUE = 'queue',
	MEMBERS = 'members',
	ASSETS = 'assets',
	MULTISIGS = 'multisigs'
}

export enum ESettingsTab {
	SIGNATORIES = 'signatories',
	NOTIFICATIONS = 'notifications',
	TRANSACTION_FIELDS = 'transaction_fields',
	ADMIN = 'admin',
	OVERVIEW = 'overview'
}

export enum WcPolkadotMethods {
	POLKADOT_SIGN_TRANSACTION = 'polkadot_signTransaction',
	POLKADOT_SIGN_MESSAGE = 'polkadot_signMessage'
}

export enum ECreateOrganisationSteps {
	ORGANISATION_DETAILS = 'organisation_details',
	ADD_MULTISIG = 'add_multisig',
	REVIEW = 'review'
}

export enum ETransactionCalls {
	PROXY = 'proxy'
}

export enum ETransactionState {
	BUILD = 'build',
	REVIEW = 'review',
	CONFIRM = 'confirm',
	FAILED = 'failed'
}

export enum ETransactionVariant {
	DETAILED = 'detailed',
	SIMPLE = 'simple'
}

export enum EAfterExecute {
	LINK_PROXY = 'link_proxy',
	EDIT_PROXY = 'edit_proxy',
	REFRESH_BALANCE = 'refresh'
}

// Enum for triggers these are only exception for camel case
export enum ETriggers {
	CANCELLED_TRANSACTION = 'cancelledTransaction',
	CREATED_PROXY = 'createdProxy',
	EDIT_MULTISIG_USERS_EXECUTED = 'editMultisigUsersExecuted',
	EDIT_MULTISIG_USERS_START = 'editMultisigUsersStart',
	EXECUTED_PROXY = 'executedProxy',
	EXECUTED_TRANSACTION = 'executedTransaction',
	INIT_MULTISIG_TRANSFER = 'initMultisigTransfer',
	SCHEDULED_APPROVAL_REMINDER = 'scheduledApprovalReminder',
	APPROVAL_REMINDER = 'approvalReminder',
	VERIFY_EMAIL = 'verifyEmail'
}

export enum NotificationSource {
	POLKASSEMBLY = 'polkassembly',
	POLKASAFE = 'polkasafe',
	TOWNHALL = 'townhall'
}

export enum ETxnType {
	INCOMING = 'INCOMING',
	OUTGOING = 'OUTGOING'
}

export interface ITreasuryTxns {
	type: ETxnType;
	balance_usd: string;
	balance_token: string;
	tokenSymbol?: string;
	txHash: string;
	timestamp: string;
	multisigAddress: string;
	network: ENetwork;
}

export interface ITreasury {
	[id: string]: {
		totalIncomingUSD: number;
		totalOutgoingUSD: number;
		incomingTransactions: ITreasuryTxns[];
		outgoingTransactions: ITreasuryTxns[];
	};
}

export enum ETransactionFieldsUpdateType {
	ADD_CATEGORY = 'Add Category',
	ADD_SUBFIELD = 'Add Subfield',
	DELETE_SUBFIELD = 'Delete Subfield'
}

export enum EInvoiceStatus {
	PENDING = 'pending',
	REJECTED = 'rejected',
	APPROVED = 'approved',
	PAID = 'paid',
	PARTIALLY_PAID = 'partially paid'
}

export enum ETransactionCreationType {
	SEND_TOKEN = 'Send Token',
	CALL_DATA = 'Call Data',
	SUBMIT_PREIMAGE = 'Submit Preimage',
	CREATE_PROPOSAL = 'Create Proposal',
	SET_IDENTITY = 'Set Identity',
	DELEGATE = 'Delegate',
	TELEPORT = 'Teleport Assets',
	MANUAL_EXTRINSIC = 'Manual Extrinsic',
	CREATE_NFT = 'Create NFT'
}

export enum ESupportedApps {
	POLKASSEMBLY = 'polkassembly',
	ASTAR = 'astar',
	SET_IDENTITY = 'set_identity',
	DELEGATE = 'delegate'
}

export enum EProposalType {
	CREATE = 'create',
	KILL = 'kill',
	CANCEL = 'cancel'
}

export enum PostOrigin {
	AUCTION_ADMIN = 'AuctionAdmin',
	BIG_SPENDER = 'BigSpender',
	BIG_TIPPER = 'BigTipper',
	CANDIDATES = 'Candidates',
	EXPERTS = 'Experts',
	FELLOWS = 'Fellows',
	FELLOWSHIP_ADMIN = 'FellowshipAdmin',
	GENERAL_ADMIN = 'GeneralAdmin',
	GRAND_MASTERS = 'GrandMasters',
	LEASE_ADMIN = 'LeaseAdmin',
	MASTERS = 'Masters',
	MEDIUM_SPENDER = 'MediumSpender',
	MEMBERS = 'Members',
	PROFICIENTS = 'Proficients',
	REFERENDUM_CANCELLER = 'ReferendumCanceller',
	REFERENDUM_KILLER = 'ReferendumKiller',
	ROOT = 'root',
	SENIOR_EXPERTS = 'SeniorExperts',
	SENIOR_FELLOWS = 'SeniorFellows',
	SENIOR_MASTERS = 'SeniorMasters',
	SMALL_SPENDER = 'SmallSpender',
	SMALL_TIPPER = 'SmallTipper',
	STAKING_ADMIN = 'StakingAdmin',
	TREASURER = 'Treasurer',
	WHITELISTED_CALLER = 'WhitelistedCaller'
}
