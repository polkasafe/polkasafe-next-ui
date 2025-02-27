import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { ENetwork } from '@common/enum/substrate';
import Address from '@common/global-ui-components/Address';
import CallDataJsonView from '@common/global-ui-components/CallDataJsonView';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import React from 'react';

const ReviewTransaction = ({
	callData,
	from,
	to,
	network,
	isProxy,
	name
}: {
	callData: string;
	from: string;
	to?: string;
	network: ENetwork;
	isProxy?: boolean;
	name: string;
}) => {
	const { getApi } = useAllAPI();

	const api = getApi?.(network)?.api;
	return (
		<div className='flex flex-col gap-y-4'>
			<div className='w-[500px] max-h-[200px] overflow-auto'>
				<CallDataJsonView
					callData={callData}
					api={api}
				/>
			</div>
			<div>
				<Typography
					variant={ETypographyVariants.p}
					className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
				>
					Sending from
				</Typography>
				<div className='border border-dashed border-text-disabled hover:border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'>
					<Address
						address={from}
						network={network}
						isProxy={isProxy}
						showNetworkBadge
						name={name || DEFAULT_ADDRESS_NAME}
					/>
				</div>
			</div>
			{to && (
				<div>
					<Typography
						variant={ETypographyVariants.p}
						className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
					>
						Sending To
					</Typography>
					<div className='border border-dashed border-text-disabled hover:border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'>
						<Address
							address={to}
							network={network}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default ReviewTransaction;
