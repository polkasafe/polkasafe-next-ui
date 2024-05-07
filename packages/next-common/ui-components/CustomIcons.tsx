// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import AddSVG from '@next-common/assets/icons/add.svg';
import AddBoxSVG from '@next-common/assets/icons/add-box.svg';
import AddressBookSVG from '@next-common/assets/icons/address-book.svg';
import ExchangeSVG from '@next-common/assets/icons/Exchange.svg';
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
import PolkassemblySVG from '~assets/polkassembly-logo.svg';
import SubIDSVG from '~assets/subid.svg';
import WatchIconSVG from '~assets/icons/watch-icon.svg';
import StarSVG from '~assets/icons/star-icon.svg';
import ArrowLeftCircleSVG from '~assets/icons/arrow-left-circle.svg';
import ArrowRightCircleSVG from '~assets/icons/arrow-right-circle.svg';
import TreasuryAnalyticsSVG from '~assets/icons/treasury-analytics-icon.svg';
import SendMoneySVG from '~assets/icons/money-send-circle.svg';
import InvoicesSVG from '~assets/icons/invoice.svg';
import LedgerSVG from '~assets/icons/ledger.svg';

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

export const WalletIcon: React.FC<{ fill?: string }> = ({ fill }: { fill?: string }) => (
	<svg
		width='15'
		height='15'
		viewBox='0 0 16 16'
		fill={fill || 'white'}
		xmlns='http://www.w3.org/2000/svg'
	>
		<path d='M10.424 8.07593C10.1478 8.07593 9.92398 8.29979 9.92398 8.57593C9.92398 8.85207 10.1478 9.07593 10.424 9.07593H12.2422C12.5183 9.07593 12.7422 8.85207 12.7422 8.57593C12.7422 8.29979 12.5183 8.07593 12.2422 8.07593H10.424Z' />
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M13.0981 2.25181C13.1497 2.54778 13.1621 2.89951 13.1656 3.30192C13.2235 3.33209 13.2802 3.3642 13.336 3.39838C13.8518 3.71446 14.2854 4.14812 14.6015 4.66392C14.9495 5.23182 15.0761 5.89001 15.1284 6.72656C15.1664 7.33515 15.1664 8.07537 15.1664 8.98452V9.00334C15.1664 9.52468 15.1664 9.98909 15.1595 10.4024C15.1382 11.6877 15.055 12.5964 14.6015 13.3364C14.2854 13.8522 13.8518 14.2859 13.336 14.602C12.8434 14.9038 12.2847 15.0383 11.6023 15.1032C10.9329 15.1668 10.0949 15.1668 9.02603 15.1668H6.97349C5.90459 15.1668 5.06659 15.1668 4.39714 15.1032C3.71478 15.0383 3.15604 14.9038 2.66349 14.602C2.1477 14.2859 1.71403 13.8522 1.39795 13.3364C1.09612 12.8439 0.961596 12.2851 0.896716 11.6028C0.833064 10.9333 0.833067 10.0953 0.833071 9.0264L0.833124 8.67592C0.82434 8.34647 0.827038 7.97817 0.829946 7.58106C0.83148 7.37175 0.833071 7.15444 0.833071 6.93058L0.833071 6.90168C0.833066 5.76019 0.833062 4.86431 0.906953 4.15328C0.982318 3.42808 1.13904 2.83658 1.49249 2.3294C1.70604 2.02298 1.96511 1.75265 2.26065 1.52879C2.75286 1.15597 3.32885 0.99023 4.03126 0.910891C4.71654 0.833487 5.57865 0.833492 6.67071 0.833499L10.3161 0.833497C10.8485 0.833474 11.2997 0.833454 11.6594 0.883877C12.0437 0.937733 12.3963 1.05754 12.6784 1.35168C12.9233 1.607 13.0394 1.91502 13.0981 2.25181ZM10.2809 1.8335C10.8581 1.8335 11.2385 1.83465 11.5206 1.8742C11.7862 1.91141 11.8895 1.97376 11.9568 2.04391C12.019 2.1088 12.0751 2.20675 12.1129 2.42354C12.1382 2.56849 12.152 2.74565 12.1593 2.97229C11.8841 2.92193 11.5871 2.89089 11.2637 2.87093C10.657 2.8335 9.91971 2.8335 9.01518 2.8335H6.9735C5.90458 2.83349 5.0666 2.83349 4.39714 2.89714C3.71478 2.96202 3.15604 3.09654 2.66349 3.39838C2.39797 3.56109 2.15422 3.75496 1.93706 3.97516C2.01023 3.49027 2.13007 3.16353 2.31291 2.90115C2.4673 2.67962 2.65358 2.48565 2.86445 2.32593C3.15627 2.10489 3.5315 1.9737 4.1435 1.90457C4.76613 1.83424 5.57178 1.8335 6.70179 1.8335H10.2809ZM3.18599 4.25102C3.49501 4.06165 3.88263 3.95057 4.4918 3.89265C5.10841 3.83403 5.89891 3.8335 6.99974 3.8335H8.99974C9.92282 3.8335 10.6297 3.83371 11.2021 3.86903C11.7739 3.90432 12.1737 3.97311 12.4889 4.0928C12.6069 4.13763 12.7137 4.1899 12.8135 4.25102C13.1947 4.48464 13.5153 4.80518 13.7489 5.18642C13.9133 5.45472 14.0181 5.78083 14.0808 6.25775H10.424C9.14368 6.25775 8.1058 7.29564 8.1058 8.57593C8.1058 9.85623 9.14368 10.8941 10.424 10.8941H14.146C14.1075 11.8677 14.0012 12.4022 13.7489 12.8139C13.5153 13.1952 13.1947 13.5157 12.8135 13.7493C12.5045 13.9387 12.1168 14.0498 11.5077 14.1077C10.8911 14.1663 10.1006 14.1668 8.99974 14.1668H6.99974C5.89891 14.1668 5.10841 14.1663 4.4918 14.1077C3.88263 14.0498 3.49501 13.9387 3.18599 13.7493C2.80475 13.5157 2.48422 13.1952 2.25059 12.8139C2.06123 12.5049 1.95015 12.1173 1.89223 11.5081C1.8336 10.8915 1.83307 10.101 1.83307 9.00016C1.83307 7.89934 1.8336 7.10883 1.89223 6.49222C1.95015 5.88306 2.06123 5.49544 2.25059 5.18642C2.48422 4.80518 2.80475 4.48464 3.18599 4.25102ZM9.1058 8.57593C9.1058 7.84792 9.69597 7.25775 10.424 7.25775H14.1515C14.1663 7.74037 14.1664 8.30977 14.1664 9.00016C14.1664 9.32277 14.1664 9.6195 14.1648 9.89411H10.424C9.69597 9.89411 9.1058 9.30394 9.1058 8.57593Z'
		/>
	</svg>
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

export const ExchangeIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ExchangeSVG}
		{...props}
	/>
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

export const PolkassemblyIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={PolkassemblySVG}
		{...props}
	/>
);

export const SubIDIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SubIDSVG}
		{...props}
	/>
);

export const WatchIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WatchIconSVG}
		{...props}
	/>
);

export const StarIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={StarSVG}
		{...props}
	/>
);

export const ArrowLeftCircle: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ArrowLeftCircleSVG}
		{...props}
	/>
);

export const ArrowRightCircle: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={ArrowRightCircleSVG}
		{...props}
	/>
);

export const TreasuryAnalyticsIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={TreasuryAnalyticsSVG}
		{...props}
	/>
);

export const SendMoneyIcon: React.FC<Partial<CustomIconComponentProps>> = (
	props: Partial<CustomIconComponentProps>
) => (
	<Icon
		component={SendMoneySVG}
		{...props}
	/>
);

export const InvoicesIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={InvoicesSVG}
		{...props}
	/>
);

export const LedgerIcon: React.FC<Partial<CustomIconComponentProps>> = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LedgerSVG}
		{...props}
	/>
);
