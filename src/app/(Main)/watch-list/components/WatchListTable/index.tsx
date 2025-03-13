'use client';

import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { IWatchList } from '@common/types/substrate';
import { Skeleton, Table } from 'antd';
import { addWatchList, removeWatchList } from '@sdk/polkasafe-sdk/src/watch-list';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useSearchParams } from 'next/navigation';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import Address from '@common/global-ui-components/Address';
import { ENetwork } from '@common/enum/substrate';
import { AddWatchList } from '@common/modals/Watchlist/AddWatchlist';
import { RemoveWatchlist } from '@common/modals/Watchlist/RemoveWatchlist';
import { useNotification } from '@common/utils/notification';
import { ERROR_MESSAGES } from '@common/utils/messages';
import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { EyeOutlined } from '@ant-design/icons';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import Link from 'next/link';
import { WATCH_LIST_URL } from '@substrate/app/global/end-points';

export const WatchListTable = () => {
	const [user, setUser] = useUser();
	const [organisation] = useOrganisation();
	const organisationId = useSearchParams().get('_organisation');
	const notification = useNotification();
	const handleAdd = async (value: IWatchList) => {
		if (!user) {
			throw new Error('User not found');
		}

		const payload = {
			addressToAdd: value.address,
			name: value.name,
			network: value.network,
			address: user.address,
			signature: user.signature
		};
		console.log(payload);
		try {
			const { data } = (await addWatchList(payload)) as { data: IWatchList };
			const newWatchlist = { ...user.watchlists, [`${value.address}_${value.network}`]: value };
			if (data) {
				console.log(data);
				setUser({ ...user, watchlists: newWatchlist });
			}
		} catch (error) {
			notification({ ...ERROR_MESSAGES.ERROR_IN_ADDING_WATCHLIST, description: error || error.message });
		}
	};

	const handleDelete = async (address: string, network: ENetwork) => {
		if (!user) {
			throw new Error('User not found');
		}

		if (!organisationId || !organisation) {
			throw new Error('Organisation not found');
		}
		const payload = {
			address: user.address,
			signature: user.signature,
			addressToDelete: address,
			network
		};
		try {
			const { data } = (await removeWatchList(payload)) as { data: IWatchList };
			if (data) {
				console.log(data);
				const newWatchlist = { ...user.watchlists };
				delete newWatchlist[`${address}_${network}`];
				setUser({ ...user, watchlists: newWatchlist });
			}
		} catch (error) {
			notification({ ...ERROR_MESSAGES.ERROR_IN_ADDING_WATCHLIST, description: error || error.message });
		}
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			fixed: 'left',
			className: 'bg-bg-main text-white',
			width: 250,
			render: (text: string) => <span>{text}</span>
		},
		{
			title: 'Address',
			dataIndex: 'address',
			key: 'address',
			width: 300,
			render: (text: string) => (
				<Address
					address={text}
					onlyAddress
					isMultisig
					withBadge={false}
				/>
			)
		},
		{
			title: 'Network',
			dataIndex: 'network',
			key: 'network',
			width: 200,
			render: (text: string) => (
				<div className='flex'>
					<span className='rounded-md py-1 px-2 text-white flex items-center gap-x-1 bg-network-badge capitalize text-xs'>
						<ParachainTooltipIcon
							size={15}
							src={(networkConstants as any)[text]?.logo}
							noBg
						/>
						{text}
					</span>
				</div>
			)
		},
		{
			title: 'Actions',
			dataIndex: 'actions',
			key: 'actions',
			fixed: 'right',
			className: 'bg-bg-main text-white',
			width: 200,
			render: (_: any, allData: IWatchList) => (
				<div className='flex items-center justify-start gap-x-2'>
					<AddWatchList
						title='Edit'
						onSubmit={handleAdd}
						watchlist={allData}
						isUsedInsideTable={true}
					/>
					<RemoveWatchlist onSubmit={() => handleDelete(allData.address, allData.network as ENetwork)} />
					<Link
						href={WATCH_LIST_URL({
							multisigAddress: allData.address,
							network: allData.network as ENetwork,
							proxyAddress: ''
						})}
						target='_blank'
					>
						<EyeOutlined style={{ fontSize: '24px', color: 'var(--text-secondary)' }} />
					</Link>
				</div>
			)
		}
	] as any;

	if (!organisation) {
		return <Skeleton />;
	}

	const dataSource = Object.keys(user?.watchlists || {}).map((item, index) => ({
		address: user?.watchlists?.[item]?.address,
		name: user?.watchlists?.[item]?.name || DEFAULT_ADDRESS_NAME,
		network: user?.watchlists?.[item]?.network
	}));

	return (
		<div className='flex flex-col gap-y-6 h-full'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-x-2'>
					<Typography variant={ETypographyVariants.h1}>Watchlist</Typography>
				</div>
				<div className='flex items-center gap-x-3'>
					<AddWatchList
						title='Add Watchlist'
						onSubmit={handleAdd}
						watchlist={{
							address: '',
							name: '',
							network: ''
						}}
					/>
				</div>
			</div>
			<div className='flex-1 overflow-y-auto h-full'>
				<Table
					pagination={false}
					dataSource={dataSource}
					columns={columns}
					scroll={{ x: 1300 }}
					rowClassName='bg-bg-main'
				/>
			</div>
		</div>
	);
};
