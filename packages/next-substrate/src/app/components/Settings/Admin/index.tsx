import React from 'react';
import TwoFactorAuth from './TwoFactorAuth';

const AdminSettings = () => {
	return (
		<div className='flex flex-col gap-y-6'>
			<TwoFactorAuth />
		</div>
	);
};

export default AdminSettings;
