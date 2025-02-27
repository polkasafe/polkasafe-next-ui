'use client';

import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { useState } from 'react';
import Modal from '@common/global-ui-components/Modal';
import { IWatchList } from '@common/types/substrate';
import { twMerge } from 'tailwind-merge';
import { EditIcon } from '@common/global-ui-components/Icons';
import { PlusCircleOutlined } from '@ant-design/icons';
import { AddWatchlistForm } from '@common/modals/Watchlist/AddWatchlist/components/AddWatchlistForm';

interface IAddWatchList {
	title: string;
	watchlist: IWatchList;
	className?: string;
	isUsedInsideTable?: boolean;
	onSubmit: (values: IWatchList) => Promise<void>;
}

export const AddWatchList = ({ onSubmit, title, watchlist, className, isUsedInsideTable }: IAddWatchList) => {
	const [openModal, setOpenModal] = useState(false);
	return (
		<div className={twMerge('', className)}>
			{isUsedInsideTable ? (
				<Button
					size='small'
					variant={EButtonVariant.SECONDARY}
					onClick={() => setOpenModal(true)}
					className='bg-highlight p-2.5 rounded-lg border-none min-w-0'
				>
					<EditIcon className='text-primary' />
				</Button>
			) : (
				<Button
					variant={EButtonVariant.PRIMARY}
					icon={<PlusCircleOutlined />}
					onClick={() => setOpenModal(true)}
					size='large'
				>
					{title}
				</Button>
			)}

			<Modal
				open={openModal}
				onCancel={() => setOpenModal(false)}
				title={`${title} Address`}
			>
				<AddWatchlistForm
					initialValue={{
						address: watchlist.address,
						name: watchlist.name,
						network: watchlist.network === '-' ? '' : watchlist.network
					}}
					onSubmit={async (values: IWatchList) => {
						await onSubmit(values);
						setOpenModal(false);
					}}
				/>
			</Modal>
		</div>
	);
};
