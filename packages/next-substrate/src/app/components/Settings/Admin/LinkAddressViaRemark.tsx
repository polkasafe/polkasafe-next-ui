import { PasswordFilledIcon, PasswordOutlinedIcon } from '@next-common/ui-components/CustomIcons';
import { Button } from 'antd';
import React from 'react';

const LinkAddressViaRemark = () => {
	return (
		<div className='grid grid-cols-10 bg-bg-main rounded-lg p-5 text-white'>
			<div className='col-span-3 flex gap-x-2'>
				<div>
					<span className='flex items-center gap-x-2 text-text_secondary'>
						<PasswordOutlinedIcon />
						Link Address via Remark
					</span>
				</div>
			</div>
			<div className='col-span-5'>
				<p className='text-text_secondary'>For participating in governance activities via ledger accounts</p>
				<Button
					// onClick={handleModalOpen}
					icon={<PasswordFilledIcon />}
					className='flex items-center p-0 outline-none border-none bg-transparant text-primary'
				>
					Link Address
				</Button>
			</div>
		</div>
	);
};

export default LinkAddressViaRemark;
