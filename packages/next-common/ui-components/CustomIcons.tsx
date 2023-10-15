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
import ExchangeSVG from '@next-common/assets/icons/Exchange.svg';
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

export const AddIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AddSVG}
		{...props}
	/>
);

export const AddressBookIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AddressBookSVG}
		{...props}
	/>
);

export const AppsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AppsSVG}
		{...props}
	/>
);

export const AssetsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AssetsSVG}
		{...props}
	/>
);

export const ArrowDownLeftIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ArrowDownLeftSVG}
		{...props}
	/>
);

export const ArrowRightIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ArrowRightSVG}
		{...props}
	/>
);

export const ArrowUpRightIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ArrowUpRightSVG}
		{...props}
	/>
);

export const Circle3DotsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={Circle3DotsSVG}
		{...props}
	/>
);

export const CircleArrowDownIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CircleArrowDownSVG}
		{...props}
	/>
);

export const CircleArrowUpIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CircleArrowUpSVG}
		{...props}
	/>
);

export const CircleCheckIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CircleCheckSVG}
		{...props}
	/>
);

export const CirclePlusIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CirclePlusSVG}
		{...props}
	/>
);

export const CircleWatchIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CircleWatchSVG}
		{...props}
	/>
);

export const CopyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CopySVG}
		{...props}
	/>
);

export const DatePickerIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DatePickerSVG}
		{...props}
	/>
);

export const DeleteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DeleteSVG}
		{...props}
	/>
);

export const DollarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DollarSVG}
		{...props}
	/>
);

export const DonateIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DonateSVG}
		{...props}
	/>
);

export const EditIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={EditSVG}
		{...props}
	/>
);

export const ExternalLinkIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ExternalLinkSVG}
		{...props}
	/>
);

export const HomeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={HomeSVG}
		{...props}
	/>
);

export const KeyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={KeySVG}
		{...props}
	/>
);

export const LineIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LineSVG}
		{...props}
	/>
);

export const MenuIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MenuSVG}
		{...props}
	/>
);

export const NoTransactionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NoTransactionSVG}
		{...props}
	/>
);

export const NoQueuedTransactionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NoQueuedTransactionSVG}
		{...props}
	/>
);

export const NotificationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NotificationSVG}
		{...props}
	/>
);

export const NoNotificationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NoNotificationSVG}
		{...props}
	/>
);

export const OutlineCheckIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={OutlineCheckSVG}
		{...props}
	/>
);

export const OutlineCloseIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={OutlineCloseSVG}
		{...props}
	/>
);

export const PencilNotificationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PencilNotificationSVG}
		{...props}
	/>
);

export const PasteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PasteSVG}
		{...props}
	/>
);

export const PencilIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PencilSVG}
		{...props}
	/>
);

export const SearchIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SearchSVG}
		{...props}
	/>
);

export const SquareDownArrowIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SquareDownArrowSVG}
		{...props}
	/>
);

export const SettingsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SettingsSVG}
		{...props}
	/>
);

export const TransactionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TransactionSVG}
		{...props}
	/>
);

export const TrashIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TrashSVG}
		{...props}
	/>
);

export const UserPlusIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={UserPlusSVG}
		{...props}
	/>
);

export const WarningIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WarningSVG}
		{...props}
	/>
);

export const WarningRoundedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WarningRoundedSVG}
		{...props}
	/>
);

export const WarningCircleIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WarningCircleSVG}
		{...props}
	/>
);

export const WalletIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WalletSVG}
		{...props}
	/>
);

export const MultisigLockIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MultisigLockSVG}
		{...props}
	/>
);

export const PolkadotLogoTextIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkadotLogoTextSVG}
		{...props}
	/>
);

export const PolkasafeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkasafeSVG}
		{...props}
	/>
);

export const PolkasafeLogoIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkasafeLogoSVG}
		{...props}
	/>
);

export const PolkasafeTextIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkasafeTextSVG}
		{...props}
	/>
);

export const SubscanIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SubscanSVG}
		{...props}
	/>
);

export const QRIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={QRSVG}
		{...props}
	/>
);
export const PSIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PSSVG}
		{...props}
	/>
);
export const ChainIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ChainSVG}
		{...props}
	/>
);
export const BrainIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BrainSVG}
		{...props}
	/>
);

// PARACHAINS ICONS

export const KusamaIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={KusamaSVG}
		{...props}
	/>
);

export const PolkadotIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkadotSVG}
		{...props}
	/>
);
export const CloseIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CloseSVG}
		{...props}
	/>
);
export const ImportArrowIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ImportArrowSVG}
		{...props}
	/>
);
export const ExportArrowIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ExportArrowSVG}
		{...props}
	/>
);
export const ShareIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ShareSVG}
		{...props}
	/>
);
export const CopyGreyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CopyGreySVG}
		{...props}
	/>
);
export const UploadBoxIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={UploadBoxSVG}
		{...props}
	/>
);
export const AddBoxIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AddBoxSVG}
		{...props}
	/>
);
export const DashDotIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DashDotSVG}
		{...props}
	/>
);
export const CreateMultisigIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CreateMultisigSVG}
		{...props}
	/>
);
export const LinkIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LinkSVG}
		{...props}
	/>
);
export const NotifyMail = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NotifyMailSVG}
		{...props}
	/>
);
export const RightArrowOutlined = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RightArrowOutlinedSVG}
		{...props}
	/>
);
export const CheckOutlined = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CheckOutlinedSVG}
		{...props}
	/>
);
export const Disc = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DiscSVG}
		{...props}
	/>
);

export const HistoryIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={HistorySVG}
		{...props}
	/>
);

export const QueueIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={QueueSVG}
		{...props}
	/>
);

export const PolkadotWalletIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkadotWalletSVG}
		{...props}
	/>
);

export const SubWalletIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SubWalletSVG}
		{...props}
	/>
);

export const BellIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BellIconSVG}
		{...props}
	/>
);

export const MailIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MailIconSVG}
		{...props}
	/>
);

export const TelegramIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TelegramIconSVG}
		{...props}
	/>
);

export const DiscordIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DiscordIconSVG}
		{...props}
	/>
);

export const ElementIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ElementIconSVG}
		{...props}
	/>
);

export const SlackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SlackIconSVG}
		{...props}
	/>
);

export const DocsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DocsSVG}
		{...props}
	/>
);

export const SharedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SharedIconSVG}
		{...props}
	/>
);

export const PasswordOutlinedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PasswordOutlinedSVG}
		{...props}
	/>
);

export const PasswordFilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PasswordFilledSVG}
		{...props}
	/>
);

export const ExchangeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ExchangeSVG}
		{...props}
	/>
);

export const XeroIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={XeroLogoSVG}
		{...props}
	/>
);

export const QuickbooksIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={QuickbooksLogoSVG}
		{...props}
	/>
);
