'use client';

import { DangerTriangleIcon } from '@common/global-ui-components/Icons';
import { IMultisig } from '@common/types/substrate';
import React from 'react';

const ProxyWarning = ({ multisigs }: { multisigs: IMultisig[] }) => {
	const noProxies =
		multisigs && multisigs.length > 0 ? multisigs.filter((item) => !item.proxy || item.proxy.length === 0).length : 0;

	return (
		<section className='mb-2 text-sm border border-waiting bg-[#ff9f1c]/[0.1] p-2 rounded-lg flex items-center gap-x-2'>
			<DangerTriangleIcon className='text-waiting text-lg' />
			<p className='text-white'>
				The selected organisation has {noProxies} multisig(s) without proxy. Create a proxy to edit or backup your
				Multisig.
			</p>
		</section>
	);
};

export default ProxyWarning;
