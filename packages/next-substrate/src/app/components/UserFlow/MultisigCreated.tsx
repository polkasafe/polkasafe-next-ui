// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import MultisigImg from '@next-common/assets/icons/multisig-created.svg';

const MultisigCreated = () => {
	const refresh = () => {
		if (typeof window !== 'undefined') window.location.reload();
	};
	return (
		<div className='flex flex-col items-center justify-center'>
			<Image
				src={MultisigImg}
				alt='multisig'
				className='mb-3'
			/>
			<p className='text-text_secondary m-5'>Your Multisig has been created successfully!</p>
			<Link href='/'>
				<Button
					className='flex items-center justify-center bg-highlight text-white border-none ml-1 py-4 mt-3'
					onClick={refresh}
				>
					View Dashboard
				</Button>
			</Link>
		</div>
	);
};

export default MultisigCreated;
