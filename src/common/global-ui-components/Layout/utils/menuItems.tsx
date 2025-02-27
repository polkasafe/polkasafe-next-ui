import { ESettingsTab, ETransactionTab } from '@common/enum/substrate';
import {
	AddressBookIcon,
	AppsIcon,
	AssetsIcon,
	ExchangeIcon,
	HomeIcon,
	SettingsIcon,
	StarIcon,
	TransactionIcon,
	TreasuryAnalyticsIcon
} from '@common/global-ui-components/Icons';

export const menuItems = [
	{
		baseURL: '/dashboard',
		icon: <HomeIcon />,
		title: 'Home',
		tab: ETransactionTab.QUEUE
	},
	{
		baseURL: '/transactions',
		icon: <TransactionIcon />,
		title: 'Transactions',
		tab: ETransactionTab.QUEUE
	},
	{
		baseURL: '/assets',
		icon: <AssetsIcon />,
		title: 'Assets'
	},
	// {
	// 	baseURL: '/exchange',
	// 	authenticated: true,
	// 	icon: <ExchangeIcon />,
	// 	title: 'Exchange'
	// },
	// {
	// 	baseURL: '/watch-list',
	// 	icon: <StarIcon />,
	// 	authenticated: true,
	// 	title: 'Watchlist',
	// 	noShow: true
	// },
	{
		baseURL: '/address-book',
		authenticated: true,
		icon: <AddressBookIcon />,
		title: 'Address Book'
	},
	// {
	// 	baseURL: '/treasury-analytics',
	// 	authenticated: true,
	// 	icon: <TreasuryAnalyticsIcon />,
	// 	title: 'Treasury Analytics',
	// 	isNew: false
	// },
	// {
	// 	baseURL: '/invoices',
	// 	authenticated: true,
	// 	icon: <TreasuryAnalyticsIcon />,
	// 	title: 'Invoices'
	// },
	// {
	// 	baseURL: '/apps',
	// 	authenticated: true,
	// 	icon: <AppsIcon />,
	// 	title: 'Apps'
	// },
	// {
	// 	baseURL: '/watch-list',
	// 	authenticated: true,
	// 	icon: <TreasuryAnalyticsIcon />,
	// 	title: 'Watch list'
	// },
	{
		baseURL: '/settings',
		authenticated: true,
		icon: <SettingsIcon />,
		title: 'Settings',
		tab: ESettingsTab.SIGNATORIES
	}
];

export const watchlistMenuItems = [
	{
		baseURL: '/viewAddress/dashboard',
		icon: <HomeIcon />,
		title: 'Home',
		tab: ETransactionTab.QUEUE
	},
	{
		baseURL: '/viewAddress/transactions',
		icon: <TransactionIcon />,
		title: 'Transactions',
		tab: ETransactionTab.QUEUE
	},
	{
		baseURL: '/viewAddress/assets',
		icon: <AssetsIcon />,
		title: 'Assets'
	}
];
