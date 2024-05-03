import React from 'react';
import TwoFactorAuth from './TwoFactorAuth';
import LinkAddressViaRemark from './LinkAddressViaRemark';

const AdminSettings = () => {
	return (
		<div className='flex flex-col gap-y-6'>
			<TwoFactorAuth />
			<LinkAddressViaRemark />
		</div>
	);
};

export default AdminSettings;
