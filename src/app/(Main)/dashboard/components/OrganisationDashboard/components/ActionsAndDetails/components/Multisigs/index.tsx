// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_MULTISIG_NAME } from '@common/constants/defaults';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import Address from '@common/global-ui-components/Address';
import { ArrowRightIcon } from '@common/global-ui-components/Icons';
import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import EditAddressName from '@common/modals/EditAddressName';
import { IMultisig } from '@common/types/substrate';
import Identicon from '@polkadot/react-identicon';
import { MULTISIG_DASHBOARD_URL } from '@substrate/app/global/end-points';
import { Tooltip } from 'antd';
import Link from 'next/link';
import { DownloadOutlined } from '@ant-design/icons';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import EthIdenticon from '@common/global-ui-components/EthIdenticon';
const columns = [
	{
		title: 'Name',
		variant: ETypographyVariants.p,
		span: 2,
		align: 'left'
	},
	{
		title: 'Address',
		variant: ETypographyVariants.p,
		span: 2,
		align: 'left'
	},
	{
		title: 'Network',
		variant: ETypographyVariants.p,
		span: 1,
		align: 'left'
	},
	{
		title: 'Signatories',
		variant: ETypographyVariants.p,
		span: 1,
		align: 'right'
	},
	{
		title: 'Action',
		variant: ETypographyVariants.p,
		span: 1,
		align: 'right'
	}
];

function QuickMultisigs({ multisigs, organisationId }: { multisigs: IMultisig[]; organisationId: string }) {
	const handleDownloadSignatories = (multisig: IMultisig) => {
		const jsonString = JSON.stringify(
			multisig.signatories.map((signatory) => getEncodedAddress(signatory, multisig.network) || signatory),
			null,
			2
		); // Optional pretty print with 2 spaces
		console.log(jsonString);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${multisig.address}_${multisig.network}_signatories.json`; // Name of the file to download
		document.body.appendChild(a); // Append the anchor to the document body
		a.click(); // Trigger the click
		document.body.removeChild(a); // Clean up by removing the anchor from the DOM

		// Release the object URL
		URL.revokeObjectURL(url);
	};

	return (
		<>
			<div className='flex bg-bg-secondary my-1 py-3 px-6 rounded-lg mr-1'>
				{columns.map((column) => (
					<Typography
						key={column.title}
						variant={column.variant}
						className={`basis-${column.span}/7 text-base ${column.align === 'right' && 'text-right'}`}
					>
						{column.title}
					</Typography>
				))}
			</div>
			<div className='max-h-72 overflow-x-hidden overflow-y-auto flex flex-col'>
				{multisigs.map((item) => (
					<div className='border-b border-text-disabled py-3 px-6 flex items-center'>
						<div className='basis-2/7 flex items-center gap-x-3'>
							{item.address.startsWith('0x') ? (
								<EthIdenticon
									className='border-primary rounded-full border-2 bg-transparent p-1'
									address={item.address}
									size={30}
								/>
							) : (
								<Identicon
									className='border-primary rounded-full border-2 bg-transparent p-1'
									value={item.address}
									theme='substrate'
									size={30}
								/>
							)}
							{item.name || DEFAULT_MULTISIG_NAME}
							<EditAddressName address={item.address} />
						</div>
						<div className='basis-2/7'>
							<Address
								noIdenticon
								address={item.address}
								onlyAddress
								network={item.network}
							/>
						</div>
						<div className='basis-1/7 flex'>
							<div className='rounded-md py-1 px-2 text-white flex items-center gap-x-1 bg-network-badge capitalize text-xs'>
								<ParachainTooltipIcon
									size={15}
									src={networkConstants[item.network]?.logo}
									noBg
								/>
								{item.network}
							</div>
						</div>
						<div className='basis-1/7 flex justify-end'>
							<div className='bg-primary text-white text-xs rounded-md px-2 py-[1px]'>
								{item.threshold}/{item.signatories.length}
							</div>
						</div>
						<div className='basis-1/7 flex justify-end gap-x-2'>
							<Tooltip title='Download Signatories JSON'>
								<div
									className='cursor-pointer p-3 bg-bg-secondary rounded-lg flex items-center justify-center'
									onClick={() => handleDownloadSignatories(item)}
								>
									<DownloadOutlined />
								</div>
							</Tooltip>
							<Link
								href={MULTISIG_DASHBOARD_URL({
									organisationId,
									multisig: item.address,
									network: item.network
								})}
								className={`bg-bg-secondary border-none outline-none shadow-none rounded-lg py-2 px-3 text-white hover:text-primary`}
							>
								<ArrowRightIcon />
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

export default QuickMultisigs;
