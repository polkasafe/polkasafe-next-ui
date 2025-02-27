import { ENetwork } from '@common/enum/substrate';
import { Dropdown } from '@common/global-ui-components/Dropdown';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
import NetworkCard from '@common/global-ui-components/NetworkCard';
import { useEffect } from 'react';

interface ISelectNetwork {
	networks: Array<ENetwork>;
	onChange?: (value: ENetwork) => void;
	selectedNetwork: ENetwork;
	fetchOnMount?: boolean;
}

export function SelectNetwork({
	networks,
	onChange,
	selectedNetwork = ENetwork.PORCINI,
	fetchOnMount
}: ISelectNetwork) {
	useEffect(() => {
		if (fetchOnMount) {
			onChange?.(selectedNetwork);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const networkOptions = networks
		.filter((item) => item !== ENetwork.PEOPLE)
		.map((item) => ({
			key: item,
			label: (
				<NetworkCard
					selectedNetwork={selectedNetwork}
					key={item}
					network={item}
				/>
			)
		}));

	return (
		<Dropdown
			trigger={['click']}
			className='border border-primary rounded-lg p-1.5 bg-bg-secondary cursor-pointer min-w-[150px]'
			menu={{
				items: networkOptions,
				onClick: (e) => onChange?.(e.key as ENetwork)
			}}
		>
			<div className='flex justify-between items-center text-white gap-x-2'>
				<div className='capitalize flex items-center gap-x-2 text-sm'>
					<ParachainTooltipIcon
						size={15}
						src={networkConstants[selectedNetwork]?.logo}
					/>
					{networkConstants[selectedNetwork]?.name}
				</div>
				<CircleArrowDownIcon className='text-primary' />
			</div>
		</Dropdown>
	);
}
