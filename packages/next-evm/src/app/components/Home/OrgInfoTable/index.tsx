import { Button } from 'antd';
import React, { useState } from 'react';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import TransactionQueue from './TransactionQueue';
import TransactionHistory from './TransactionHistory';
import MembersTable from './Members';

enum ETab {
	QUEUE,
	HISTORY,
	ASSETS,
	MEMBERS
}

const OrgInfoTable = () => {
	const [tab, setTab] = useState(ETab.QUEUE);

	const { allAssets } = useMultisigAssetsContext();
	console.log('allAssets', allAssets);
	return (
		<div className='w-full bg-bg-main rounded-xl p-8 h-[400px] flex flex-col ='>
			<div className='flex items-center mb-4 scale-90 w-[111%] origin-top-left'>
				<Button
					onClick={() => setTab(ETab.QUEUE)}
					// icon={<QueueIcon />}
					size='large'
					className={`font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
						// eslint-disable-next-line sonarjs/no-duplicate-string
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
				<Button
					onClick={() => setTab(ETab.MEMBERS)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
						tab === ETab.MEMBERS && 'text-primary bg-highlight'
					}`}
				>
					Members
				</Button>
			</div>
			<div className='overflow-y-auto pr-2 flex-1'>
				{tab === ETab.MEMBERS ? <MembersTable /> : tab === ETab.HISTORY ? <TransactionHistory /> : <TransactionQueue />}
			</div>
		</div>
	);
};

export default OrgInfoTable;
