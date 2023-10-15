// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination as AntDPagination } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';

type Props = {
	className?: string;
	currentPage: number;
	setPage: Dispatch<SetStateAction<number>>;
	totalDocs: number;
	defaultPageSize: number;
};

export default function Pagination({ className, currentPage, setPage, totalDocs, defaultPageSize }: Props) {
	return (
		<AntDPagination
			className={className}
			defaultCurrent={currentPage}
			defaultPageSize={defaultPageSize} // default size of page
			onChange={setPage}
			total={totalDocs} // total number of card data available
		/>
	);
}
