import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { Dropdown, Form, Input } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { chainProperties, NETWORK } from '@next-common/global/evm-network-constants';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import Loader from '@next-common/ui-components/Loader';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NotificationStatus } from '@next-common/types';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';
import getSafeInfoByNetwork from '@next-evm/utils/getSafeInfoByNetwork';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { useWallets } from '@privy-io/react-auth';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';
import ModalBtn from '../Settings/ModalBtn';
import CancelBtn from '../Settings/CancelBtn';

const AddWatchlistAddressModal = ({ address, onCancel }: { address: string; onCancel: () => void }) => {
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const [name, setName] = useState<string>('');
	const [selectedNetwork, setSelectedNetwork] = useState(NETWORK.ETHEREUM);
	const [validMultisig, setValidMultisig] = useState(false);

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const [fetchInfoLoading, setFetchInfoLoading] = useState(false);
	const [loading, setLoading] = useState(false);

	const networkOptions: ItemType[] = Object.values(NETWORK).map((n) => ({
		key: n,
		label: (
			<span className='text-white flex items-center gap-x-2 capitalize'>
				<ParachainIcon src={chainProperties[n]?.logo} />
				{n}
			</span>
		)
	}));

	const onNetworkChange = (e: any) => {
		setSelectedNetwork(e.key);
	};

	const addToWatchlist = async () => {
		if (!address || !selectedNetwork || !validMultisig) return;

		setLoading(true);
		const watchlistRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addAddressToWatchlist_eth`, {
			body: JSON.stringify({
				address,
				name,
				network: selectedNetwork
			}),
			headers: firebaseFunctionsHeader(connectedWallet.address),
			method: 'POST'
		});
		const { data: watchlistData, error: watchlistError } = (await watchlistRes.json()) as {
			data: string;
			error: string;
		};

		if (watchlistData && !watchlistError) {
			setLoading(false);
			setUserDetailsContextState((prev) => ({
				...prev,
				watchlists: {
					...prev.watchlists,
					[`${address}_${selectedNetwork}`]: {
						address,
						name,
						network: selectedNetwork
					}
				}
			}));
			queueNotification({
				header: 'Success',
				message: 'Address Added to Watchlist',
				status: NotificationStatus.SUCCESS
			});
			onCancel();
			return;
		}

		if (watchlistError) {
			setLoading(false);
			queueNotification({
				header: 'Failed',
				message: 'Failed to add Address to Watchlist',
				status: NotificationStatus.ERROR
			});
		}
	};

	const multisigInfo = useCallback(async () => {
		if (!address || !isValidWeb3Address(address) || !selectedNetwork) return;

		try {
			setFetchInfoLoading(true);
			const provider = await connectedWallet.getEthersProvider();
			const multiData = await getSafeInfoByNetwork(
				address,
				selectedNetwork,
				provider.getSigner(connectedWallet?.address)
			);

			setFetchInfoLoading(false);

			if (multiData) {
				setValidMultisig(true);
			}
		} catch (err) {
			console.log(err);
			setFetchInfoLoading(false);
			setValidMultisig(false);
		}
	}, [address, connectedWallet, selectedNetwork]);

	useEffect(() => {
		multisigInfo();
	}, [multisigInfo]);

	return (
		<div className='flex flex-col gap-y-4'>
			{fetchInfoLoading ? (
				<Loader />
			) : !validMultisig ? (
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>Multisig Not Found, Please try with other networks</p>
				</section>
			) : null}
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='name'
				>
					Name*
				</label>
				<Form.Item
					name='name'
					id='name'
					rules={[
						{
							message: 'Required',
							required: true
						}
					]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder='Give the address a name'
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						id='name'
						onChange={(e) => setName(e.target.value)}
						value={name}
					/>
				</Form.Item>
			</div>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='ddresss'
				>
					Address*
				</label>
				<div className='flex items-center p-3 mb-4 text-text_secondary border-dashed border-2 border-bg-secondary rounded-lg gap-x-5'>
					<AddressComponent
						address={address}
						onlyAddress
						iconSize={20}
						withBadge={false}
					/>
				</div>
			</div>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='ddresss'
				>
					Network*
				</label>
				<Dropdown
					trigger={['click']}
					disabled={loading || fetchInfoLoading}
					className='border border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer'
					menu={{
						items: networkOptions,
						onClick: onNetworkChange
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						<span className='flex items-center gap-x-2 capitalize'>
							<ParachainIcon src={chainProperties[selectedNetwork]?.logo} />
							{selectedNetwork}
						</span>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
			</div>
			<div className='flex justify-between items-center w-full mt-5'>
				<CancelBtn onClick={onCancel} />
				<ModalBtn
					disabled={!name || !validMultisig || fetchInfoLoading}
					loading={loading}
					title='Add'
					onClick={() => addToWatchlist()}
				/>
			</div>
		</div>
	);
};

export default AddWatchlistAddressModal;
