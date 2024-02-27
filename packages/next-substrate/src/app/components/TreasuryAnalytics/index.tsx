import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useHistoricalTransactionsContext } from '@next-substrate/context/HistoricalTransactionsContext';
import { Divider, Dropdown } from 'antd';
import React, { useState } from 'react';
import Loader from '@next-common/ui-components/Loader';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import BalanceHistory from './BalanceHistory';
import TopAssetsCard from '../Home/TopAssetsCard';

const TreasuryAnalytics = () => {
	const { treasury, loadingTreasury } = useHistoricalTransactionsContext();
	const { activeOrg } = useActiveOrgContext();

	console.log('treasury', treasury);

	const [selectedID, setSelectedID] = useState<string>(activeOrg?.id || '');

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: `${item.address}_${item.network}`,
		label: (
			<div className='scale-90 origin-top-left'>
				<AddressComponent
					isMultisig
					showNetworkBadge
					network={item.network}
					withBadge={false}
					address={item.address}
				/>
			</div>
		)
	}));

	multisigOptions.unshift({
		key: activeOrg?.id,
		label: (
			<div className='flex items-center gap-x-3'>
				<Image
					width={30}
					height={30}
					className='rounded-full h-[30px] w-[30px]'
					src={activeOrg?.imageURI || emptyImage}
					alt='empty profile image'
				/>
				<div className='flex flex-col gap-y-[1px]'>
					<span className='text-sm text-white capitalize truncate max-w-[100px]'>{activeOrg?.name}</span>
					<span className='text-xs text-text_secondary'>{activeOrg?.members?.length} Members</span>
				</div>
			</div>
		)
	});

	return loadingTreasury ? (
		<Loader />
	) : (
		<div className='scale-[80%] h-[125%] w-[125%] origin-top-left flex flex-col gap-y-4'>
			<div className='flex justify-end'>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer min-w-[260px]'
					menu={{
						items: multisigOptions,
						onClick: (e) => {
							setSelectedID(e.key);
						}
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						{selectedID === activeOrg?.id ? (
							<div className='flex items-center gap-x-3'>
								<Image
									width={30}
									height={30}
									className='rounded-full h-[30px] w-[30px]'
									src={activeOrg?.imageURI || emptyImage}
									alt='empty profile image'
								/>
								<div className='flex flex-col gap-y-[1px]'>
									<span className='text-sm text-white capitalize truncate max-w-[100px]'>{activeOrg?.name}</span>
									<span className='text-xs text-text_secondary'>{activeOrg?.members?.length} Members</span>
								</div>
							</div>
						) : (
							<AddressComponent
								isMultisig
								showNetworkBadge
								network={selectedID.split('_')[1]}
								withBadge={false}
								address={selectedID.split('_')[0]}
							/>
						)}
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
			</div>
			<div className='rounded-xl p-5 bg-bg-secondary flex gap-x-5'>
				<div>
					<label className='text-text_secondary text-sm mb-2'>Incoming</label>
					<div className='text-success font-bold text-[25px]'>
						$ {selectedID && treasury?.[selectedID] ? treasury[selectedID].totalIncomingUSD : '0.00'}
					</div>
				</div>
				<Divider
					type='vertical'
					orientation='center'
					className='border border-text_secondary h-full'
				/>
				<div>
					<label className='text-text_secondary text-sm mb-2'>Outgoing</label>
					<div className='text-failure font-bold text-[25px]'>
						$ {selectedID && treasury?.[selectedID] ? treasury[selectedID].totalOutgoingUSD : '0.00'}
					</div>
				</div>
			</div>
			<BalanceHistory
				id={selectedID}
				incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
				outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
			/>
			<div className='flex'>
				<TopAssetsCard className='bg-bg-secondary' />
			</div>
		</div>
	);
};

export default TreasuryAnalytics;
