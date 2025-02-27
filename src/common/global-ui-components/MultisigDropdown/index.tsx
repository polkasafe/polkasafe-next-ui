import { IMultisig, IMultisigAssets } from '@common/types/substrate';
import { useState } from 'react';
import { Dropdown } from 'antd';
import Address from '@common/global-ui-components/Address';
import { getMultisigOptions } from '@common/global-ui-components/MultisigDropdown/utils/getMultisigsOptions';
import { ENetwork } from '@common/enum/substrate';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';

interface IMultisigDropdown {
	multisigs: Array<IMultisig>;
	onChange: ({
		address,
		network,
		name,
		proxy
	}: {
		address: string;
		network: ENetwork;
		name: string;
		proxy?: string;
	}) => void;
	assets?: Array<IMultisigAssets> | null;
}

export const MultisigDropdown = ({ multisigs, onChange, assets }: IMultisigDropdown) => {
	const defaultMultisigId = `${multisigs[0].address}_${multisigs[0].network}_${multisigs[0].name}`;
	const [selectedMultisig, setSelectedMultisig] = useState<string>(defaultMultisigId);

	const handleChange = (selectedMultisigId: string) => {
		const [selectedAddress, selectedNetwork, selectedName, selectedProxy] = selectedMultisigId.split('_');
		const payload = {
			address: selectedAddress,
			network: selectedNetwork as ENetwork,
			name: selectedName,
			proxy: selectedProxy || undefined
		};
		onChange(payload);
	};
	const multisigOptions = getMultisigOptions({
		multisigs,
		setSelectedMultisig,
		selectedMultisig,
		onSelect: handleChange
	});
	const [address, network, name, proxy, proxyName] = selectedMultisig.split('_');

	const proxyMultiSigAssets = assets
		?.map((a) => a.proxy || [])
		.flat()
		.find((a) => a.proxyAddress === proxy && a.network === network);

	const multiSigAssets = assets?.find((asset) => asset?.address === address && asset?.network === network);
	const selectedAddressAsset = proxy ? proxyMultiSigAssets : multiSigAssets;

	return (
		<div>
			<Dropdown
				trigger={['click']}
				className='border border-dashed border-text-disabled hover:border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-full max-sm:w-full'
				menu={{
					items: multisigOptions
				}}
			>
				<div className='flex justify-between gap-x-4 items-center text-white text-base'>
					<Address
						isMultisig
						isProxy={Boolean(proxy)}
						name={(Boolean(proxy) && (proxyName || DEFAULT_ADDRESS_NAME)) || name}
						showNetworkBadge
						network={network as ENetwork}
						withBadge={false}
						address={proxy || address}
					/>
					<div className='flex gap-2'>
						{selectedAddressAsset && (
							<div>
								<Typography
									variant={ETypographyVariants.p}
									className='text-text-primary text-2xs px-2 bg-highlight rounded-lg'
								>
									<span className='text-label'>Balance:</span> {Number(selectedAddressAsset.free)?.toFixed(2) || '0.00'}{' '}
									{selectedAddressAsset.symbol}
								</Typography>
							</div>
						)}
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</div>
			</Dropdown>
		</div>
	);
};
