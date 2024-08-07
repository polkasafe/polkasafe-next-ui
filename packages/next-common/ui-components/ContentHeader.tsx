// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, ReactNode } from 'react';

interface IContentHeader {
	title?: ReactNode;
	subTitle?: ReactNode;
	rightElm?: ReactNode;
}

const ContentHeader: FC<IContentHeader> = ({ title, rightElm, subTitle }) => {
	return (
		<section className='flex items-center justify-between'>
			<div className='flex items-center'>
				<h2 className='text-xl font-bold tracking-wide lg:text-3xl'>{title}</h2>
				{subTitle || null}
			</div>
			{rightElm || null}
		</section>
	);
};

export default ContentHeader;
