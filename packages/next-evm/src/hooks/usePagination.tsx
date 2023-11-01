// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState } from 'react';

// eslint-disable-next-line import/prefer-default-export
export const usePagination = () => {
	const [page, setPage] = useState<number>(1);
	const [totalDocs, setTotalDocs] = useState<number | undefined>();
	return { currentPage: page, setPage, setTotalDocs, totalDocs };
};
