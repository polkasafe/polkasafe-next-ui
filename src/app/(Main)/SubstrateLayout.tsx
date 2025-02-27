'use client';

import { Layout } from '@common/global-ui-components/Layout';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import React, { PropsWithChildren } from 'react';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { logout } from '@sdk/polkasafe-sdk/src/logout';
import { App, FloatButton } from 'antd';
import InAppChat from '@substrate/app/(Main)/components/InAppChat';
import { MessageOutlined } from '@ant-design/icons';

interface ISubstrateLayout {
	userAddress: string;
}

function SubstrateLayout({ userAddress, children }: PropsWithChildren<ISubstrateLayout>) {
	const [organisation] = useOrganisation();
	const [user] = useUser();
	return (
		<App>
			<FloatButton.Group
				trigger='click'
				type='primary'
				icon={<MessageOutlined />}
			>
				{/* <FloatButton /> */}
				<InAppChat />
			</FloatButton.Group>
			<Layout
				userAddress={userAddress}
				organisations={user?.organisations || []}
				logout={() => logout({ address: userAddress, signature: user?.signature || '' })}
				selectedOrganisation={organisation}
			>
				{children}
			</Layout>
		</App>
	);
}

export default SubstrateLayout;
