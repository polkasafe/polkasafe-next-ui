// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { TrashIcon } from '@next-common/ui-components/CustomIcons';

const RemoveSafeBtn = () => {
	return (
		<p className='text-red_primary flex items-center gap-x-0.5'>
			<TrashIcon />
			<span className='text-sm font-medium lg:text-base'>Remove Safe</span>
		</p>
	);
};

export default RemoveSafeBtn;
