import AddressComponent from '@next-common/ui-components/AddressComponent';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useEffect, useState } from 'react';

const SelectSigner = ({
	approvers,
	setSigner,
	setValidApprovers
}: {
	approvers: string[];
	setSigner: React.Dispatch<React.SetStateAction<string>>;
	setValidApprovers?: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
	const { address, linkedAddresses } = useGlobalUserDetailsContext();
	const [selectedSigner, setSelectedSigner] = useState<string>(address);
	const [signerOptions, setSignerOptions] = useState<ItemType[]>(
		[address, ...linkedAddresses]?.map((item) => ({
			key: item,
			label: <AddressComponent address={item} />
		}))
	);

	useEffect(() => {
		if (!approvers || approvers.length === 0) return;

		const defaultSigners = [address, ...linkedAddresses].map((item) => getSubstrateAddress(item));

		const signers = [];
		// eslint-disable-next-line no-restricted-syntax
		for (const s of approvers) {
			if (defaultSigners.includes(getSubstrateAddress(s))) {
				signers.push(s);
			}
		}
		setSignerOptions(
			signers.map((item) => ({
				key: item,
				label: <AddressComponent address={item} />
			}))
		);
		setValidApprovers?.(signers);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, approvers, linkedAddresses]);

	useEffect(() => {
		if (selectedSigner) {
			setSigner(selectedSigner);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedSigner]);
	return (
		<Dropdown
			trigger={['click']}
			className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'
			menu={{
				items: signerOptions,
				onClick: (e) => {
					setSelectedSigner(e.key);
				}
			}}
		>
			<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
				<AddressComponent address={selectedSigner} />
				<CircleArrowDownIcon className='text-primary' />
			</div>
		</Dropdown>
	);
};

export default SelectSigner;
