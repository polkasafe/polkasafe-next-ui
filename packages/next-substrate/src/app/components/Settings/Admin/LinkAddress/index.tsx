import { LedgerIcon } from '@next-common/ui-components/CustomIcons';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { Button } from 'antd';
import React, { useState } from 'react';
import LinkAddressViaRemark from './LinkAddressViaRemark';

const LinkAddress = () => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	return (
		<div className='grid grid-cols-10 bg-bg-main rounded-lg p-5 text-white'>
			<ModalComponent
				title='Link Address via Remark'
				open={openModal}
				onCancel={() => setOpenModal(false)}
			>
				<LinkAddressViaRemark onCancel={() => setOpenModal(false)} />
			</ModalComponent>
			<div className='col-span-3 flex gap-x-2'>
				<div>
					<span className='flex items-center gap-x-2 text-text_secondary'>
						<LedgerIcon />
						Link Address via Remark
					</span>
				</div>
			</div>
			<div className='col-span-5'>
				<p className='text-text_secondary'>For participating in multisig activities via ledger accounts</p>
				<Button
					onClick={() => setOpenModal(true)}
					icon={<LedgerIcon />}
					className='flex items-center p-0 outline-none border-none bg-transparant text-primary'
				>
					Link Address
				</Button>
			</div>
		</div>
	);
};

export default LinkAddress;
