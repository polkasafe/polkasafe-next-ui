import Address from '@common/global-ui-components/Address';
import React from 'react';

const ReviewPayment = ({ receiverAddress, amount }: { receiverAddress: string; amount: string }) => {
	return (
		<div>
			<div className='rounded-xl bg-bg-secondary p-2 mb-3'>
				<p className='font-bold text-sm mb-2 text-white'>Receiver Details:</p>
				<div className='border border-text_placeholder rounded-xl p-3 flex items-center justify-between'>
					<Address
						address={receiverAddress}
						// network={network}
						isMultisig
						withBadge={false}
					/>
					<div className='rounded-lg bg-bg-main px-2 py-1 flex justify-between items-center text-white'>
						{amount} USD
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReviewPayment;
