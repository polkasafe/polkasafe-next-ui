import { IQueueItem } from '@next-common/types';
import React from 'react';
import { ArrowUpRightIcon, CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { Dropdown } from 'antd';
import NoTransactionsQueued from '../../Transactions/Queued/NoTransactionsQueued';

dayjs.extend(LocalizedFormat);

const Queue = ({
	pendingTransactions,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	multisigAddress,
	network
}: {
	pendingTransactions: IQueueItem[];
	multisigAddress: string;
	network: string;
}) => {
	return (
		<div className='flex flex-col h-full'>
			<div className='bg-bg-secondary mb-2 rounded-lg p-3 scale-90 w-[111%] origin-top-left text-text_secondary grid items-center grid-cols-9 max-sm:hidden'>
				<p className='col-span-4 pl-3'>Transaction Hash</p>
				<p className='col-span-3'>Approvals</p>
				<p className='col-span-2'>Created At</p>
			</div>
			<div className='flex-1 overflow-y-auto max-sm:gap-2 max-sm:overflow-x-hidden'>
				{pendingTransactions && pendingTransactions.length > 0 ? (
					pendingTransactions.map((item) => (
						<div className='pb-2 mb-2 gap-x-3 grid grid-cols-9 max-sm:flex max-sm:flex-wrap max-sm:gap-2 max-sm:mb-5 max-sm:bg-bg-secondary max-sm:p-3 max-sm:rounded-lg'>
							<p className='col-span-4 flex items-center gap-x-4'>
								<div
									className={`${'bg-failure text-failure'} bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center`}
								>
									<ArrowUpRightIcon />
								</div>
								<span className='text-white font-medium flex items-center gap-x-2'>
									{shortenAddress(item.callHash, 10)}{' '}
									<span className='flex items-center gap-x-2 text-sm text-primary'>
										<button onClick={() => copyText(item.callHash)}>
											<CopyIcon className='hover:text-primary' />
										</button>
										<a
											href={`https://${network}.subscan.io/extrinsic/${item.callHash}`}
											target='_blank'
											rel='noreferrer'
										>
											<ExternalLinkIcon />
										</a>
									</span>
								</span>
							</p>
							<p className='text-white col-span-3 flex items-center gap-x-2'>
								{item.approvals &&
									item.approvals.slice(0, 1).map((a) => (
										<AddressComponent
											address={a}
											network={network}
										/>
									))}
								{item.approvals && item.approvals.length > 1 && (
									<Dropdown
										menu={{
											items: item.approvals.slice(1).map((a, i) => ({
												key: i,
												label: (
													<AddressComponent
														address={a}
														network={network}
													/>
												)
											}))
										}}
									>
										<span className='cursor-pointer py-1.5 px-3 rounded-full bg-primary'>
											+{item.approvals.length - 1}
										</span>
									</Dropdown>
								)}
							</p>
							<p className='col-span-2 text-white'>{dayjs(item.created_at).format('lll')}</p>
						</div>
					))
				) : (
					<div className='flex justify-center items-center h-full w-full'>
						<NoTransactionsQueued />
					</div>
				)}
			</div>
		</div>
	);
};

export default Queue;
