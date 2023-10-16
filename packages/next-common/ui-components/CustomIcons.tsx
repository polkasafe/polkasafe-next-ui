// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable react/jsx-props-no-spreading */

import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import AddSVG from '@next-common/assets/icons/add.svg';
import AddBoxSVG from '@next-common/assets/icons/add-box.svg';
import AddressBookSVG from '@next-common/assets/icons/address-book.svg';
import AppsSVG from '@next-common/assets/icons/apps.svg';
import ArrowDownLeftSVG from '@next-common/assets/icons/arrow-down-left.svg';
import ArrowRightSVG from '@next-common/assets/icons/arrow-right.svg';
import ArrowUpRightSVG from '@next-common/assets/icons/arrow-up-right.svg';
import AssetsSVG from '@next-common/assets/icons/assets.svg';
import BellIconSVG from '@next-common/assets/icons/bell-icon.svg';
import BrainSVG from '@next-common/assets/icons/brain-icon.svg';
import ChainSVG from '@next-common/assets/icons/chain-icon.svg';
import CheckOutlinedSVG from '@next-common/assets/icons/CheckOutlined.svg';
import Circle3DotsSVG from '@next-common/assets/icons/circle-3-dots.svg';
import CircleArrowDownSVG from '@next-common/assets/icons/circle-arrow-down.svg';
import CircleArrowUpSVG from '@next-common/assets/icons/circle-arrow-up.svg';
import CircleCheckSVG from '@next-common/assets/icons/circle-check.svg';
import CirclePlusSVG from '@next-common/assets/icons/circle-plus.svg';
import CircleWatchSVG from '@next-common/assets/icons/circle-watch.svg';
import CloseSVG from '@next-common/assets/icons/close-icon.svg';
import CopySVG from '@next-common/assets/icons/copy.svg';
import CopyGreySVG from '@next-common/assets/icons/copy-icon-grey.svg';
import CreateMultisigSVG from '@next-common/assets/icons/createMultisig.svg';
import DashDotSVG from '@next-common/assets/icons/dash-dot.svg';
import DatePickerSVG from '@next-common/assets/icons/date-picker-icon.svg';
import DeleteSVG from '@next-common/assets/icons/delete.svg';
import DiscSVG from '@next-common/assets/icons/disc.svg';
import DiscordIconSVG from '@next-common/assets/icons/discord-icon.svg';
import DocsSVG from '@next-common/assets/icons/document.svg';
import DollarSVG from '@next-common/assets/icons/dollar.svg';
import DonateSVG from '@next-common/assets/icons/donate.svg';
import EditSVG from '@next-common/assets/icons/edit.svg';
import ElementIconSVG from '@next-common/assets/icons/element-icon.svg';
// import ExchangeSVG from '@next-common/assets/icons/Exchange.svg';
import ExportArrowSVG from '@next-common/assets/icons/export-arrow.svg';
import ExternalLinkSVG from '@next-common/assets/icons/external-link.svg';
import HomeSVG from '@next-common/assets/icons/home.svg';
import ImportArrowSVG from '@next-common/assets/icons/import-arrow.svg';
import KeySVG from '@next-common/assets/icons/key.svg';
import LineSVG from '@next-common/assets/icons/line.svg';
import LinkSVG from '@next-common/assets/icons/link.svg';
import MailIconSVG from '@next-common/assets/icons/mail-icon.svg';
import MenuSVG from '@next-common/assets/icons/menu.svg';
import MultisigLockSVG from '@next-common/assets/icons/multisig-lock.svg';
import NoNotificationSVG from '@next-common/assets/icons/no-notification.svg';
import NoQueuedTransactionSVG from '@next-common/assets/icons/no-queued-transaction.svg';
import NoTransactionSVG from '@next-common/assets/icons/no-transaction.svg';
import NotificationSVG from '@next-common/assets/icons/notification.svg';
import NotifyMailSVG from '@next-common/assets/icons/notify-mail.svg';
import OutlineCheckSVG from '@next-common/assets/icons/outline-check.svg';
import OutlineCloseSVG from '@next-common/assets/icons/outline-close.svg';
import PasswordFilledSVG from '@next-common/assets/icons/password-filled.svg';
import PasswordOutlinedSVG from '@next-common/assets/icons/password-outlined.svg';
import PasteSVG from '@next-common/assets/icons/paste-icon.svg';
import PencilSVG from '@next-common/assets/icons/pencil.svg';
import PencilNotificationSVG from '@next-common/assets/icons/pencil-notification.svg';
import PolkadotLogoTextSVG from '@next-common/assets/icons/polkadot-logo-text.svg';
import PolkasafeSVG from '@next-common/assets/icons/polkasafe.svg';
import PolkasafeLogoSVG from '@next-common/assets/icons/polkasafe-logo.svg';
import PolkasafeTextSVG from '@next-common/assets/icons/polkasafe-text.svg';
import PSSVG from '@next-common/assets/icons/ps-icon.svg';
import QRSVG from '@next-common/assets/icons/qr.svg';
import QuickbooksLogoSVG from '@next-common/assets/icons/quickbooks-logo.svg';
import RightArrowOutlinedSVG from '@next-common/assets/icons/RightArrowOutlined.svg';
import SearchSVG from '@next-common/assets/icons/search.svg';
import SettingsSVG from '@next-common/assets/icons/settings.svg';
import ShareSVG from '@next-common/assets/icons/share-icon.svg';
import SharedIconSVG from '@next-common/assets/icons/Shared.svg';
import SlackIconSVG from '@next-common/assets/icons/slack-icon.svg';
import SquareDownArrowSVG from '@next-common/assets/icons/square-down-arrow.svg';
import SubscanSVG from '@next-common/assets/icons/subscan.svg';
import TelegramIconSVG from '@next-common/assets/icons/telegram-icon.svg';
import TransactionSVG from '@next-common/assets/icons/transaction.svg';
import TrashSVG from '@next-common/assets/icons/trash.svg';
import UploadBoxSVG from '@next-common/assets/icons/upload-box.svg';
import UserPlusSVG from '@next-common/assets/icons/user-plus.svg';
import WalletSVG from '@next-common/assets/icons/wallet-icon.svg';
import WarningSVG from '@next-common/assets/icons/warning.svg';
import WarningCircleSVG from '@next-common/assets/icons/warning-circle.svg';
import WarningRoundedSVG from '@next-common/assets/icons/warning-rounded.svg';
import XeroLogoSVG from '@next-common/assets/icons/xero-logo.svg';
import KusamaSVG from '@next-common/assets/parachains-icons/kusama.svg';
import PolkadotSVG from '@next-common/assets/parachains-icons/polkadot.svg';
import QueueSVG from '@next-common/assets/Queue.svg';
import PolkadotWalletSVG from '@next-common/assets/wallet/polkadotjs-icon.svg';
import SubWalletSVG from '@next-common/assets/wallet/subwallet-icon.svg';
import HistorySVG from '~assets/History.svg';

export const AddIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AddSVG}
		{...props}
	/>
);

export const AddressBookIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={AddressBookSVG}
		{...props}
	/>
);

export const AppsIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AppsSVG}
		{...props}
	/>
);

export const AssetsIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AssetsSVG}
		{...props}
	/>
);

export const ArrowDownLeftIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ArrowDownLeftSVG}
		{...props}
	/>
);

export const ArrowRightIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ArrowRightSVG}
		{...props}
	/>
);

export const ArrowUpRightIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ArrowUpRightSVG}
		{...props}
	/>
);

export const Circle3DotsIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={Circle3DotsSVG}
		{...props}
	/>
);

export const CircleArrowDownIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={CircleArrowDownSVG}
		{...props}
	/>
);

export const CircleArrowUpIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={CircleArrowUpSVG}
		{...props}
	/>
);

export const CircleCheckIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={CircleCheckSVG}
		{...props}
	/>
);

export const CirclePlusIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={CirclePlusSVG}
		{...props}
	/>
);

export const CircleWatchIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={CircleWatchSVG}
		{...props}
	/>
);

export const CopyIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CopySVG}
		{...props}
	/>
);

export const DatePickerIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={DatePickerSVG}
		{...props}
	/>
);

export const DeleteIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DeleteSVG}
		{...props}
	/>
);

export const DollarIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DollarSVG}
		{...props}
	/>
);

export const DonateIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DonateSVG}
		{...props}
	/>
);

export const EditIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={EditSVG}
		{...props}
	/>
);

export const ExternalLinkIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ExternalLinkSVG}
		{...props}
	/>
);

export const HomeIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={HomeSVG}
		{...props}
	/>
);

export const KeyIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={KeySVG}
		{...props}
	/>
);

export const LineIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LineSVG}
		{...props}
	/>
);

export const MenuIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MenuSVG}
		{...props}
	/>
);

export const NoTransactionIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={NoTransactionSVG}
		{...props}
	/>
);

export const NoQueuedTransactionIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={NoQueuedTransactionSVG}
		{...props}
	/>
);

export const NotificationIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={NotificationSVG}
		{...props}
	/>
);

export const NoNotificationIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={NoNotificationSVG}
		{...props}
	/>
);

export const OutlineCheckIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={OutlineCheckSVG}
		{...props}
	/>
);

export const OutlineCloseIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={OutlineCloseSVG}
		{...props}
	/>
);

export const PencilNotificationIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PencilNotificationSVG}
		{...props}
	/>
);

export const PasteIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PasteSVG}
		{...props}
	/>
);

export const PencilIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PencilSVG}
		{...props}
	/>
);

export const SearchIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SearchSVG}
		{...props}
	/>
);

export const SquareDownArrowIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={SquareDownArrowSVG}
		{...props}
	/>
);

export const SettingsIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SettingsSVG}
		{...props}
	/>
);

export const TransactionIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={TransactionSVG}
		{...props}
	/>
);

export const TrashIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TrashSVG}
		{...props}
	/>
);

export const UserPlusIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={UserPlusSVG}
		{...props}
	/>
);

export const WarningIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WarningSVG}
		{...props}
	/>
);

export const WarningRoundedIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={WarningRoundedSVG}
		{...props}
	/>
);

export const WarningCircleIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={WarningCircleSVG}
		{...props}
	/>
);

export const WalletIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WalletSVG}
		{...props}
	/>
);

export const MultisigLockIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={MultisigLockSVG}
		{...props}
	/>
);

export const PolkadotLogoTextIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PolkadotLogoTextSVG}
		{...props}
	/>
);

export const PolkasafeIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PolkasafeSVG}
		{...props}
	/>
);

export const PolkasafeLogoIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PolkasafeLogoSVG}
		{...props}
	/>
);

export const PolkasafeTextIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PolkasafeTextSVG}
		{...props}
	/>
);

export const SubscanIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SubscanSVG}
		{...props}
	/>
);

export const QRIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={QRSVG}
		{...props}
	/>
);
export const PSIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PSSVG}
		{...props}
	/>
);
export const ChainIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ChainSVG}
		{...props}
	/>
);
export const BrainIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BrainSVG}
		{...props}
	/>
);

// PARACHAINS ICONS

export const KusamaIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={KusamaSVG}
		{...props}
	/>
);

export const PolkadotIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkadotSVG}
		{...props}
	/>
);
export const CloseIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CloseSVG}
		{...props}
	/>
);
export const ImportArrowIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ImportArrowSVG}
		{...props}
	/>
);
export const ExportArrowIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ExportArrowSVG}
		{...props}
	/>
);
export const ShareIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ShareSVG}
		{...props}
	/>
);
export const CopyGreyIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CopyGreySVG}
		{...props}
	/>
);
export const UploadBoxIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={UploadBoxSVG}
		{...props}
	/>
);
export const AddBoxIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AddBoxSVG}
		{...props}
	/>
);
export const DashDotIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DashDotSVG}
		{...props}
	/>
);
export const CreateMultisigIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={CreateMultisigSVG}
		{...props}
	/>
);
export const LinkIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LinkSVG}
		{...props}
	/>
);
export const NotifyMail: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NotifyMailSVG}
		{...props}
	/>
);
export const RightArrowOutlined: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={RightArrowOutlinedSVG}
		{...props}
	/>
);
export const CheckOutlined: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={CheckOutlinedSVG}
		{...props}
	/>
);
export const Disc: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DiscSVG}
		{...props}
	/>
);

export const HistoryIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={HistorySVG}
		{...props}
	/>
);

export const QueueIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={QueueSVG}
		{...props}
	/>
);

export const PolkadotWalletIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PolkadotWalletSVG}
		{...props}
	/>
);

export const SubWalletIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={SubWalletSVG}
		{...props}
	/>
);

export const BellIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BellIconSVG}
		{...props}
	/>
);

export const MailIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MailIconSVG}
		{...props}
	/>
);

export const TelegramIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TelegramIconSVG}
		{...props}
	/>
);

export const DiscordIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DiscordIconSVG}
		{...props}
	/>
);

export const ElementIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ElementIconSVG}
		{...props}
	/>
);

export const SlackIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SlackIconSVG}
		{...props}
	/>
);

export const DocsIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DocsSVG}
		{...props}
	/>
);

export const SharedIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SharedIconSVG}
		{...props}
	/>
);

export const PasswordOutlinedIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PasswordOutlinedSVG}
		{...props}
	/>
);

export const PasswordFilledIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PasswordFilledSVG}
		{...props}
	/>
);

export const ExchangeIcon: React.FC = () => (
	<svg
		width='13'
		height='13'
		viewBox='0 0 16 16'
		fill='white'
		xmlns='http://www.w3.org/2000/svg'
	>
		<g clipPath='url(#clip0_3143_1913)'>
			<path d='M4.50214 1.61503C2.77675 2.04039 1.5 3.59616 1.5 5.45425C1.5 5.73039 1.27614 5.95425 1 5.95425C0.723858 5.95425 0.5 5.73039 0.5 5.45425C0.5 2.71554 2.71554 0.5 5.45425 0.5C5.63438 0.5 5.8006 0.596896 5.88935 0.753651C5.9781 0.910405 5.97567 1.10278 5.883 1.25725L5.21486 2.37081C5.07278 2.6076 4.76565 2.68438 4.52886 2.54231C4.29207 2.40023 4.21529 2.0931 4.35737 1.85631L4.50214 1.61503Z' />
			<path d='M14.9992 10.0469C15.2753 10.0469 15.4992 10.2707 15.4992 10.5469C15.4992 13.2856 13.2836 15.5011 10.5449 15.5011C10.3648 15.5011 10.1986 15.4042 10.1098 15.2475C10.0211 15.0907 10.0235 14.8983 10.1162 14.7439L10.7843 13.6303C10.9264 13.3935 11.2335 13.3167 11.4703 13.4588C11.7071 13.6009 11.7839 13.908 11.6418 14.1448L11.497 14.3861C13.2224 13.9607 14.4992 12.405 14.4992 10.5469C14.4992 10.2707 14.723 10.0469 14.9992 10.0469Z' />
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M5.7724 7.36328C5.94412 7.36328 6.08332 7.47356 6.08332 7.6096V7.69055C6.52169 7.74764 6.92602 7.9542 7.16584 8.28328L7.32154 8.49692C7.4074 8.61473 7.35645 8.76538 7.20773 8.8334C7.05902 8.90141 6.86886 8.86105 6.783 8.74324L6.6273 8.5296C6.50325 8.35938 6.3051 8.2439 6.08332 8.19436L6.08332 9.73671L6.24047 9.78249C7.46333 10.1388 7.60675 11.4634 6.47836 11.9795C6.35177 12.0374 6.21881 12.0794 6.08332 12.1064V12.2075C6.08332 12.3436 5.94412 12.4539 5.7724 12.4539C5.60068 12.4539 5.46147 12.3436 5.46147 12.2075V12.1266C5.02314 12.0695 4.61885 11.8629 4.37905 11.5339L4.22335 11.3202C4.13749 11.2024 4.18844 11.0518 4.33716 10.9837C4.48587 10.9157 4.67603 10.9561 4.76189 11.0739L4.91758 11.2875C5.04162 11.4577 5.23973 11.5732 5.46147 11.6228V10.0804L5.30441 10.0346C4.08156 9.67831 3.93814 8.35376 5.06653 7.83766C5.19309 7.77977 5.32601 7.73771 5.46147 7.71078V7.6096C5.46147 7.47356 5.60068 7.36328 5.7724 7.36328ZM5.46147 8.23023C5.43309 8.24033 5.40505 8.25167 5.37746 8.26429C4.72381 8.56326 4.78698 9.31788 5.46147 9.55385L5.46147 8.23023ZM6.08332 11.5869C6.11174 11.5768 6.13981 11.5655 6.16743 11.5528C6.82111 11.2539 6.7579 10.4992 6.08332 10.2633V11.5869Z'
			/>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M10.118 1.47656C7.73356 1.47656 5.79186 3.35824 5.69563 5.71888C3.33834 5.81873 1.46045 7.75895 1.46045 10.141C1.46045 12.587 3.44056 14.5671 5.88655 14.5671C8.27099 14.5671 10.2127 12.6854 10.3089 10.3247C12.6662 10.2249 14.5441 8.28468 14.5441 5.90265C14.5441 3.45665 12.564 1.47656 10.118 1.47656ZM10.2447 9.32649C9.91431 7.526 8.49469 6.10634 6.69419 5.77591C6.76075 3.94104 8.26672 2.47656 10.118 2.47656C12.0117 2.47656 13.5441 4.00894 13.5441 5.90265C13.5441 7.75394 12.0796 9.25993 10.2447 9.32649ZM5.88655 6.71484C3.99284 6.71484 2.46045 8.24726 2.46045 10.141C2.46045 12.0347 3.99284 13.5671 5.88655 13.5671C7.78027 13.5671 9.31265 12.0347 9.31265 10.141C9.31265 10.096 9.31134 10.0525 9.30973 10.0028L9.30951 9.99575C9.30821 9.95568 9.30672 9.90977 9.30637 9.86244C9.17096 8.19012 7.83232 6.85554 6.15822 6.72646L6.1311 6.72486C6.03345 6.71907 5.96226 6.71484 5.88655 6.71484Z'
			/>
		</g>
		<defs>
			<clipPath id='clip0_3143_1913'>
				<rect
					width='16'
					height='16'
				/>
			</clipPath>
		</defs>
	</svg>
);

export const XeroIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={XeroLogoSVG}
		{...props}
	/>
);

export const QuickbooksIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={QuickbooksLogoSVG}
		{...props}
	/>
);
