import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { UpdateMultisig } from '@substrate/app/modal/UpdateMultisig';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { IMultisig } from '@common/types/substrate';
import { findMultisig } from '@common/utils/findMultisig';
import { Select, Table } from 'antd';
import { useState } from 'react';
import Address from '@common/global-ui-components/Address';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { DefaultOptionType } from 'antd/es/select';
import { twMerge } from 'tailwind-merge';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import EditAddressName from '@common/modals/EditAddressName';
import { CreateProxyModal } from '@substrate/app/modal/CreateProxy';

interface ISignatories {
	multisigs: Array<IMultisig>;
}

const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name'
	},
	{
		title: 'Address',
		dataIndex: 'address',
		key: 'address'
	}
];

export const Signatories = ({ multisigs }: ISignatories) => {
	const [organisation] = useOrganisation();
	const addresses = organisation?.addressBook || [];

	const [selectedMultisig, setSelectedMultisig] = useState<IMultisig>(multisigs[0]);
	const [selectedProxy, setSelectedProxy] = useState<string | null>(selectedMultisig?.proxy?.[0]?.address || null);

	return (
		<div className='relative'>
			<div className='absolute -top-14 right-0'>
				{selectedProxy && (
					<UpdateMultisig
						className='w-auto'
						multisig={selectedMultisig}
						proxyAddress={selectedProxy}
						addresses={addresses}
					/>
				)}
				{selectedMultisig && (
					<CreateProxyModal
						multisig={selectedMultisig}
					/>
				)}
			</div>

			<div className='flex flex-col gap-x-4 gap-y-12 pt-5 w-full'>
				<div className='flex gap-x-4 justify-center items-start w-4/5'>
					<div className={twMerge('flex flex-col gap-y-3 items-start justify-start w-full')}>
						<div>

						<Typography
							variant={ETypographyVariants.p}
							className='uppercase'
						>
							MANAGE MULTISIG
						</Typography>
						</div>
						<div className='flex items-center rounded-lg p-2 bg-bg-secondary border-dashed border-2 border-gray-500 w-full'>
							<Select
								className='flex items-center justify-start w-full [&_.ant-select-selection-search]:bg-bg-secondary'
								defaultValue={`${selectedMultisig.address}_${selectedMultisig.network}`}
								placeholder='Select a person'
								onChange={(value) => {
									const multisig = findMultisig(multisigs, value) as IMultisig;
									setSelectedMultisig(multisig);
									setSelectedProxy(multisig?.proxy?.filter((proxy) => Boolean(proxy.address))?.[0]?.address || null);
								}}
								options={multisigs.map((multisig) => ({
									value: `${multisig.address}_${multisig.network}`,
									label: (
										<Address
											address={multisig.address}
											network={multisig.network}
											isProxy={false}
											isMultisig={true}
											withBadge={false}
											showNetworkBadge
										/>
									)
								}))}
							/>
						</div>
					</div>
					{selectedMultisig && selectedMultisig?.proxy && selectedMultisig.proxy.length > 0 && (
						<div className='flex flex-col items-center justify-center gap-y-4'>
							<Typography
								variant={ETypographyVariants.p}
								className='uppercase'
							>
								OR
							</Typography>
							<div className='mt-1 rounded-full h-11 w-11 bg-gray-500 border-2 border-gray-300 text-black opacity-40 flex items-center justify-center'>
								<ArrowRightOutlined />
							</div>
						</div>
					)}
					{selectedMultisig && selectedMultisig?.proxy && selectedMultisig.proxy.length > 0 && (
						<div className={twMerge('flex flex-col gap-y-3 items-start justify-start w-full')}>
							<Typography
								variant={ETypographyVariants.p}
								className='uppercase'
							>
								MANAGE PROXY
							</Typography>
							<div className='flex items-center rounded-lg p-2 bg-bg-secondary border-dashed border-2 border-gray-500 w-full'>
								<Select
									placeholder='Select a Proxy'
									value={selectedProxy}
									className='flex items-center justify-start w-full [&_.ant-select-selector]:bg-bg-secondary'
									onChange={(value) => setSelectedProxy(value)}
									options={
										(selectedMultisig.proxy || [])
											.map((proxy) =>
												proxy.address
													? {
															value: `${proxy.address}`,
															label: (
																<Address
																	address={proxy.address}
																	network={selectedMultisig.network}
																	isProxy={true}
																	isMultisig={false}
																	showNetworkBadge
																/>
															)
														}
													: null
											)
											.filter((proxy) => proxy !== null) as Array<DefaultOptionType>
									}
								/>
							</div>
						</div>
					)}
				</div>

				<Table
					rowClassName='bg-bg-main'
					className='w-full bg-bg-main'
					columns={columns}
					dataSource={selectedMultisig.signatories?.map((signatory) => ({
						name: <div className='flex items-center gap-x-2 text-white'>
							{addresses.find((item) => getSubstrateAddress(signatory) === getSubstrateAddress(item.address))?.name || DEFAULT_ADDRESS_NAME}
							<EditAddressName address={signatory} />
						</div>,
						address: (
							<Address
								address={signatory}
								onlyAddress
								isMultisig
								withBadge={false}
							/>
						)
					}))}
					pagination={false}
					scroll={{ y: 55 * 5 }}
				/>
			</div>
		</div>
	);
};
