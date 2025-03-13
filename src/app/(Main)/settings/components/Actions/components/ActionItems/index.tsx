import { ESettingsTab } from '@common/enum/substrate';
import { Signatories } from '@substrate/app/(Main)/settings/components/Actions/components/Signatories';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { NotificationsUI } from '@common/global-ui-components/Notifications/index.tsx';
import MultisigOverview from '@common/global-ui-components/MultisigOverview';
import { AdminPanel } from '@common/global-ui-components/AdminPanel/index';
import React from 'react';
import { Skeleton } from 'antd';
import TransactionFieldsSubstrate from '@substrate/app/(Main)/settings/components/Actions/components/TransactionFields';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { IConnectedUser, INotificationPreferences } from '@common/types/substrate';

interface IActionItems {
	selectedTab: ESettingsTab;
}

export const ActionItems = ({ selectedTab }: IActionItems) => {
	const [organisation, setOrgananisation] = useOrganisation();
	const [user, setUser] = useUser();

	if (!organisation || !user) {
		return <Skeleton active />;
	}

	const handleChange = (preference: INotificationPreferences) => {
		const payload: IConnectedUser = {
			...user,
			notificationPreferences: {
				channelPreferences: preference.channelPreferences || user?.notificationPreferences?.channelPreferences,
				triggerPreferences: preference.triggerPreferences || user?.notificationPreferences?.triggerPreferences
			}
		};

		console.log('payload', payload);

		setUser(payload);
	};

	return (
		<>
			{selectedTab === ESettingsTab.SIGNATORIES && <Signatories multisigs={organisation.multisigs} />}
			{selectedTab === ESettingsTab.NOTIFICATIONS && (
				<NotificationsUI
					address={user.address}
					signature={user.signature}
					preferences={user.notificationPreferences}
					onChange={handleChange}
				/>
			)}
			{selectedTab === ESettingsTab.TRANSACTION_FIELDS && (
				<TransactionFieldsSubstrate
					setOrganisation={setOrgananisation}
					organisation={organisation}
					transactionFields={organisation.transactionFields}
				/>
			)}
			{selectedTab === ESettingsTab.ADMIN && <AdminPanel />}
			{selectedTab === ESettingsTab.OVERVIEW && <MultisigOverview multisigs={organisation.multisigs} />}
		</>
	);
};
