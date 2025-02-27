import { IMultisig } from '@common/types/substrate';
import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { Dropdown } from '@common/global-ui-components/Dropdown';
import Address from '@common/global-ui-components/Address';
import { ENetwork } from '@common/enum/substrate';

interface ISelectAddress {
	multisigs: Array<IMultisig>;
}

function SelectAddress({ multisigs }: ISelectAddress) {
	const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
		`${multisigs[0].address}_${multisigs[0].network}`
	);
	const [selectedMultisig, setSelectedMultisig] = useState<IMultisig | undefined>(
		multisigs?.find((multisig) => `${multisig.address}_${multisig.network}` === selectedAddressId)
	);

	useEffect(() => {
		if (!selectedAddressId) return;

		const m = multisigs?.find((multisig) => `${multisig.address}_${multisig.network}` === selectedAddressId);
		if (m) {
			setSelectedMultisig(m);
		}
	}, []);

	const handleChange = (value: string) => {
		setSelectedAddressId(value);
	};

	const multisigOptions = multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<Address
				isMultisig
				name={item.name}
				showNetworkBadge
				network={item.network}
				withBadge={false}
				address={item.address}
			/>
		)
	}));

	useEffect(() => {}, []);
	return (
		<>
			<Form.Item name='selectedMultisigAddress'>
				<p className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'>
					Sending From
				</p>
				<Dropdown
					menu={{
						items: multisigOptions,
						onClick: (e) => {
							const data = JSON.parse(e.key);
							setSelectedMultisig(data);
							// setNetwork(data?.network);
							// setIsProxy(data?.isProxy);
							// setSelectedProxyName(data.name);
						}
					}}
				>
					<Address
						address={selectedMultisig?.address || ''}
						network={selectedMultisig?.network || ENetwork.POLKADOT}
						name={selectedMultisig?.name}
						isMultisig
						withBadge={false}
					/>
				</Dropdown>
				<Select
					placeholder='Select a person'
					onChange={handleChange}
					options={multisigs.map((multisig) => ({
						value: `${multisig.address}_${multisig.network}`,
						label: multisig.address
					}))}
				/>
			</Form.Item>
			{selectedMultisig && selectedMultisig?.proxy && (
				<Form.Item name='selectedProxy'>
					<Select
						placeholder='Select a Proxy'
						onChange={handleChange}
						options={selectedMultisig.proxy.map((proxy) => ({
							value: proxy.address,
							label: proxy.address
						}))}
					/>
				</Form.Item>
			)}
		</>
	);
}

export default SelectAddress;
