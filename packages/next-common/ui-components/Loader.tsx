// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Spin } from 'antd';
import React from 'react';

const Loader = ({ size = 'default', text }: { size?: 'small' | 'default' | 'large'; text?: string }) => {
	return (
		<div className='flex h-full items-center justify-center'>
			<Spin
				size={size}
				tip={text || 'Loading...'}
			/>
		</div>
	);
};

export default Loader;
