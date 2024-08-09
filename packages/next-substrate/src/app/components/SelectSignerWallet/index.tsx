import { Wallet } from '@next-common/types';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useEffect, useState } from 'react';

const SelectSignerWallet = ({ setSignerWallet }: { setSignerWallet: React.Dispatch<React.SetStateAction<Wallet>> }) => {
	const { loggedInWallet } = useGlobalUserDetailsContext();
	const [selectedWallet, setSelectedWallet] = useState<Wallet>(loggedInWallet);

	const walletOptions: ItemType[] = Object.values(Wallet)
		.filter((item) => item === Wallet.POLKADOT || item === Wallet.SUBWALLET || item === Wallet.TALISMAN)
		.map((item) => ({
			key: item,
			label: <span className='text-white capitalize'>{item}</span>
		}));

	useEffect(() => {
		if (selectedWallet) {
			setSignerWallet(selectedWallet);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedWallet]);
	return (
		<Dropdown
			trigger={['click']}
			className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'
			menu={{
				items: walletOptions,
				onClick: (e) => {
					setSelectedWallet(e.key as Wallet);
				}
			}}
		>
			<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
				<span className='text-white capitalize'>{selectedWallet}</span>
				<CircleArrowDownIcon className='text-primary' />
			</div>
		</Dropdown>
	);
};

export default SelectSignerWallet;
