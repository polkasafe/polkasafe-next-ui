import React from 'react';
import TwoFactorAuth from './TwoFactorAuth';
import LinkAddress from './LinkAddress';

const AdminSettings = () => {
	return (
		<div className='flex flex-col gap-y-6'>
			<TwoFactorAuth />
			<LinkAddress />
		</div>
	);
};

export default AdminSettings;
