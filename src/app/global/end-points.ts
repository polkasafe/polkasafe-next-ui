// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, ESettingsTab, ETransactionTab, ETransactionType } from '@common/enum/substrate';

export const LOGIN_URL = '/login';
export const DASHBOARD_URL = '/dashboard';
export const EXCHANGE_URL = '/exchange';
export const TRANSACTIONS_URL = '/transactions';
export const APPS_URL = '/apps';
export const NOTIFICATIONS_URL = '/notifications';
export const INVOICES_URL = '/invoices';
export const ADDRESS_BOOK_URL = '/address-book';
export const TREASURY_ANALYTICS_URL = '/treasury-analytics';
export const CREATE_ORGANISATION_URL = `/create-organisation`;

export const ASSETS_ORGANISATION_URL = ({ id }: { id: string }) => `/assets?_organisation=${id}`;

export const MULTISIG_TRANSACTION_URL = ({
	organisationId,
	multisig,
	page,
	limit,
	network,
	tab
}: {
	organisationId: string;
	multisig: string;
	page: number;
	limit: number;
	network: string;
	tab: ETransactionTab;
}) =>
	`/transactions?_multisig=${multisig}&_page=${page}&_limit=${limit}&_network=${network}&_tab=${tab}&_organisation=${organisationId}`;

export const ORGANISATION_TRANSACTION_URL = ({
	organisationId,
	page,
	limit,
	tab
}: {
	organisationId: string;
	page: number;
	limit: number;
	tab: ETransactionTab;
}) => `/transactions?_organisation=${organisationId}&_page=${page}&_limit=${limit}&_tab=${tab}`;

export const MULTISIG_DASHBOARD_URL = ({
	multisig,
	network,
	organisationId,
	tab
}: {
	multisig: string;
	network: string;
	organisationId: string;
	tab?: ETransactionTab;
}) =>
	`/dashboard?_organisation=${organisationId}&_multisig=${multisig}&_network=${network}&_tab=${tab || ETransactionTab.QUEUE}`;

export const ORGANISATION_DASHBOARD_URL = ({ id, tab }: { id: string; tab?: ETransactionTab }) =>
	`/dashboard?_organisation=${id}&_tab=${tab || ETransactionTab.QUEUE}`;

export const SETTINGS_URL = ({ organisationId, tab }: { organisationId: string; tab: ESettingsTab }) =>
	`/settings?_organisation=${organisationId}&_tab=${tab}`;

export const PROXY_URL = ({
	organisationId,
	multisigAddress,
	proxyAddress,
	network
}: {
	organisationId: string;
	multisigAddress: string;
	proxyAddress: string;
	network: ENetwork;
}) =>
	`/dashboard?_organisation=${organisationId}&_multisig=${multisigAddress}&_network=${network}&_proxy=${proxyAddress}&_tab=${ETransactionTab.QUEUE}`;

export const WATCH_LIST_URL = ({
	multisigAddress,
	network,
	proxyAddress
}: {
	multisigAddress: string;
	proxyAddress: string;
	network: ENetwork;
}) => `/viewAddress/dashboard?_multisig=${multisigAddress}&_network=${network}&_proxy=${proxyAddress}`;
