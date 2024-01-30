// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable sonarjs/cognitive-complexity */
import { ArrowDownLeftIcon, ArrowUpRightIcon, DeleteIcon, EditIcon } from '@next-common/ui-components/CustomIcons';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Collapse, Divider, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useState } from 'react';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import SendFundsForm, { ETransactionTypeEVM } from '../../SendFunds/SendFundsForm';
import DeleteStream from './DeleteStream';

export interface IStreamedData {
	multisigAddress: string;
	receiver: string;
	sender: string;
	flowRate: bigint;
	startDate: Date;
	endDate?: Date;
	cancelled?: boolean;
	txHash: string;
	incoming: boolean;
	tokenSymbol: string;
}

const Transaction: FC<IStreamedData> = ({
	receiver,
	sender,
	flowRate,
	startDate,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	endDate,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	cancelled,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	txHash,
	incoming,
	tokenSymbol,
	multisigAddress
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { allAssets } = useMultisigAssetsContext();
	const [openUpdateStreamModal, setOpenUpdateStreamModal] = useState<boolean>(false);
	const [openDeleteStreamModal, setOpenDeleteStreamModal] = useState<boolean>(false);
	const amountInWei = ethers.BigNumber.from(flowRate);
	const monthlyAmount = ethers.utils.formatEther(amountInWei.toString());
	const flowRatePerMonth = Number(monthlyAmount) * 3600 * 24 * (365 / 12);

	const token = allAssets[multisigAddress]?.assets?.find((item) => item.name === tokenSymbol);

	return (
		<div className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'>
			<ModalComponent
				open={openUpdateStreamModal}
				onCancel={() => setOpenUpdateStreamModal(false)}
				title='Update Stream'
			>
				<SendFundsForm
					defaultSelectedAddress={receiver}
					updateStreamAmount={flowRatePerMonth.toString()}
					transactionType={ETransactionTypeEVM.STREAM_PAYMENTS}
					updateStream
					defaultToken={token}
					onCancel={() => setOpenUpdateStreamModal(false)}
				/>
			</ModalComponent>
			<ModalComponent
				open={openDeleteStreamModal}
				title='Delete Stream'
				onCancel={() => setOpenDeleteStreamModal(false)}
			>
				<DeleteStream
					recipient={receiver}
					onCancel={() => setOpenDeleteStreamModal(false)}
				/>
			</ModalComponent>
			<div className='grid items-center grid-cols-9 text-white font-normal text-sm leading-[15px]'>
				<p className='col-span-3 flex items-center gap-x-3 px-2'>
					{!incoming ? (
						<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'>
							<ArrowUpRightIcon />
						</span>
					) : (
						<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'>
							<ArrowDownLeftIcon />
						</span>
					)}

					<span>
						{incoming ? (
							<span className='flex gap-x-2 items-center'>
								From:{' '}
								<AddressComponent
									address={sender}
									onlyAddress
								/>
							</span>
						) : (
							<span className='flex gap-x-2 items-center'>
								To:{' '}
								<AddressComponent
									address={receiver}
									onlyAddress
								/>
							</span>
						)}
					</span>
				</p>
				<p className='col-span-2'>
					{Number(flowRate) !== 0 ? `${incoming ? '+' : '-'} ${flowRatePerMonth.toString()} / month` : '-'}
				</p>
				<p className='col-span-3'>
					{dayjs(startDate).format('lll')} - {endDate ? dayjs(endDate).format('lll') : '§'}
				</p>
				{!cancelled && (
					<p className='col-span-1 flex items-center gap-x-2'>
						<Tooltip title='Update Stream'>
							<button
								onClick={() => setOpenUpdateStreamModal(true)}
								className='text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
							>
								<EditIcon />
							</button>
						</Tooltip>
						<Tooltip title='Delete Stream'>
							<button
								onClick={() => setOpenDeleteStreamModal(true)}
								className='text-failure bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
							>
								<DeleteIcon />
							</button>
						</Tooltip>
					</p>
				)}
			</div>
		</div>
	);
};

export default Transaction;
