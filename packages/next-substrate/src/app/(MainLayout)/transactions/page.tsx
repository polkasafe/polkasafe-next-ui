// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import History from '@next-substrate/app/components/Transactions/History';
import Queued from '@next-substrate/app/components/Transactions/Queued';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { ExportArrowIcon, ExternalLinkIcon, QuickbooksIcon, XeroIcon } from '@next-common/ui-components/CustomIcons';
import Link from 'next/link';
import { EExportType } from '@next-common/types';
import AddMultisigModal from '../../components/Multisig/AddMultisigModal';

enum ETab {
	QUEUE,
	HISTORY
}

const Transactions = () => {
	const [tab, setTab] = useState(ETab.QUEUE);
	const searchParams = useSearchParams();
	const { address, isSharedMultisig } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [refetch, setRefetch] = useState<boolean>(false);

	const [openExportModal, setOpenExportModal] = useState<boolean>(false);
	const [historyTxnLength, setHistoryTxnLength] = useState(0);

	const [exportType, setExportType] = useState<EExportType>(EExportType.QUICKBOOKS);

	const exportTypesOptions: ItemType[] = Object.values(EExportType).map((item) => ({
		key: item,
		label: (
			<span className='text-white flex items-center gap-x-2 capitalize '>
				{item === EExportType.QUICKBOOKS ? <QuickbooksIcon className='text-lg' /> : <XeroIcon className='text-lg' />}
				Export To {item}
			</span>
		)
	}));

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
			{address || isSharedMultisig ? (
				<>
					<AddMultisigModal />
					<div className='flex items-center mb-4 scale-90 w-[111%] origin-top-left'>
						<Button
							onClick={() => setTab(ETab.QUEUE)}
							// icon={<QueueIcon />}
							size='large'
							className={`font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
								tab === ETab.QUEUE && 'text-primary bg-highlight'
							} max-sm:text-xs max-sm:w-[70px]`}
						>
							Queue
						</Button>
						<Button
							onClick={() => setTab(ETab.HISTORY)}
							// icon={<HistoryIcon />}
							size='large'
							className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
								tab === ETab.HISTORY && 'text-primary bg-highlight'
							} max-sm:text-xs max-sm:w-[70px]`}
						>
							History
						</Button>
						<div className='flex-1' />
						{tab === ETab.HISTORY && historyTxnLength > 0 && (
							<Dropdown
								menu={{
									items: exportTypesOptions,
									onClick: (e) => {
										setExportType(e.key as EExportType);
										setOpenExportModal(true);
									}
								}}
								trigger={['click']}
							>
								<Button
									size='large'
									icon={<ExportArrowIcon className='text-primary' />}
									className='text-primary mr-3 bg-highlight outline-none border-none font-medium text-sm max-sm:text-xs'
								>
									Export
								</Button>
							</Dropdown>
						)}
						<Button
							size='large'
							onClick={() => setRefetch((prev) => !prev)}
							disabled={loading}
							icon={
								<SyncOutlined
									spin={loading}
									className='text-primary'
								/>
							}
							className='text-primary bg-highlight outline-none border-none font-medium text-sm max-sm:hidden'
						>
							Refresh
						</Button>
						<Button
							size='large'
							onClick={() => setRefetch((prev) => !prev)}
							disabled={loading}
							className='text-primary bg-highlight outline-none border-none font-medium text-sm sm:hidden'
						>
							<SyncOutlined
								spin={loading}
								className='text-primary'
							/>
						</Button>
					</div>
					{tab === ETab.HISTORY ? (
						<History
							exportType={exportType}
							setHistoryTxnLength={setHistoryTxnLength}
							openExportModal={openExportModal}
							setOpenExportModal={setOpenExportModal}
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
				</>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/login'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default Transactions;
