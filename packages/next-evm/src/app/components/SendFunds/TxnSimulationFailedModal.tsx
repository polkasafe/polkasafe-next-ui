import React from 'react';
import { Button } from 'antd';

const TxnSimulationFailedModal = ({
	reason,
	onCancel,
	onProceed
}: {
	reason: string;
	onCancel: () => void;
	onProceed: () => void;
}) => {
	return (
		<div className='text-white'>
			<p className='mb-2 max-w-[600px]'>Your Previous Transacition Simulation failed due to {reason}.</p>
			<p className='mb-4'>Are You Sure You Want To Proceed?</p>
			<div className='w-full flex justify-center items-center gap-x-2'>
				<Button
					className='border-none text-white font-normal bg-primary'
					onClick={onCancel}
					size='large'
				>
					Cancel
				</Button>
				<Button
					className='border-2 border-primary text-primary font-normal bg-transparent'
					onClick={onProceed}
					size='large'
				>
					Proceed
				</Button>
			</div>
		</div>
	);
};

export default TxnSimulationFailedModal;
