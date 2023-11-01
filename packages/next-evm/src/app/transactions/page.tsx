// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import History from '@next-evm/app/components/Transactions/History';
import Queued from '@next-evm/app/components/Transactions/Queued';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExternalLinkIcon, HistoryIcon, QueueIcon } from '@next-common/ui-components/CustomIcons';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';

enum ETab {
	QUEUE,
	HISTORY
}

const Transactions = () => {
	const [tab, setTab] = useState(ETab.QUEUE);
	const searchParams = useSearchParams();
	const { address } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [refetch, setRefetch] = useState<boolean>(false);

	useEffect(() => {
		const search = searchParams.get('tab');
		if (search === 'History') {
			setTab(ETab.HISTORY);
		}
		if (search === 'Queue') {
			setTab(ETab.QUEUE);
		}
	}, [searchParams]);

	return (
		<div className='bg-bg-main rounded-xl p-[20.5px] h-full relative'>
			<AddMultisigModal />
			{address ? (
				<>
					<div className='flex items-center mb-4 scale-90 w-[111%] origin-top-left'>
						<Button
							onClick={() => setTab(ETab.QUEUE)}
							// icon={<QueueIcon />}
							size='large'
							className={`font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
								tab === ETab.QUEUE && 'text-primary bg-highlight'
							}`}
						>
							Queue
						</Button>
						<Button
							onClick={() => setTab(ETab.HISTORY)}
							// icon={<HistoryIcon />}
							size='large'
							className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
								tab === ETab.HISTORY && 'text-primary bg-highlight'
							}`}
						>
							History
						</Button>
						<div className='flex-1' />
						<Button
							size='large'
							onClick={() => setRefetch((prev) => !prev)}
							icon={
								<SyncOutlined
									spin={loading}
									className='text-primary'
								/>
							}
							className='text-primary bg-highlight outline-none border-none font-medium text-sm'
						>
							Refresh
						</Button>
					</div>
					<div className='h-full max-h-[690px] overflow-auto pr-2'>
						{tab === ETab.HISTORY ? (
							<History
								loading={loading}
								refetch={refetch}
								setLoading={setLoading}
							/>
						) : (
							<Queued
								loading={loading}
								refetch={refetch}
								setLoading={setLoading}
								setRefetch={setRefetch}
							/>
						)}
					</div>
				</>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default Transactions;
