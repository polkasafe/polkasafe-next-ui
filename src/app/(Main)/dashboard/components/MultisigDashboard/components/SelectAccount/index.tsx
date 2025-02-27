// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Address from '@common/global-ui-components/Address';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { IMultisig } from '@common/types/substrate';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { MULTISIG_DASHBOARD_URL, PROXY_URL } from '@substrate/app/global/end-points';
import { CreateProxyModal } from '@substrate/app/modal/CreateProxy';
import { Divider } from 'antd';
import Link from 'next/link';
import React from 'react';

const SelectAccount = ({
	className,
	multisig,
	organisationId
}: {
	className?: string;
	multisig: IMultisig;
	organisationId: string;
}) => {
	const [user] = useUser();
	const isSignatory = multisig.signatories
		.map((a) => getSubstrateAddress(a))
		.includes(getSubstrateAddress(user?.address || ''));
	return (
		<div className='flex flex-col gap-4 '>
			<Typography variant={ETypographyVariants.h1}>Select Account</Typography>
			<div
				className={`${className} relative bg-bg-main flex flex-col gap-y-3 rounded-3xl p-5 shadow-lg h-60 origin-top-left`}
			>
				<Link
					href={MULTISIG_DASHBOARD_URL({
						organisationId,
						multisig: multisig.address,
						network: multisig.network
					})}
				>
					<Address
						address={multisig.address}
						network={multisig.network}
						name={multisig.name}
						showNetworkBadge
						isProxy={false}
						isMultisig
						withBadge={false}
					/>
				</Link>
				<Divider className='m-1'></Divider>
				<div className='flex-1 flex flex-col gap-y-3 pl-2 overflow-y-auto'>
					{multisig.proxy &&
						multisig.proxy.length > 0 &&
						multisig.proxy.map((item) => (
							<Link
								href={PROXY_URL({
									organisationId,
									multisigAddress: multisig.address,
									proxyAddress: item.address,
									network: multisig.network
								})}
							>
								<Address
									address={item.address}
									name={item.name}
									network={multisig.network}
									isProxy
								/>
							</Link>
						))}
				</div>
				<div className='w-full'>
					<CreateProxyModal
						multisig={multisig}
						disabled={!isSignatory}
					/>
				</div>
			</div>
		</div>
	);
};

export default SelectAccount;
