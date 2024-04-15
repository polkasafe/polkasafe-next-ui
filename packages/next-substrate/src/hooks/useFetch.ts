// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import { useCache } from '@next-substrate/context/CachedDataContext';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';

type CustomAxiosConfig = {
	body: object;
	headers: HeadersInit;
	url: string;
	method?: string;
	key: string;
	initialEnabled?: boolean;
	cache?: {
		enabled?: boolean;
		tte?: number;
	};
	// onSuccess?: (data) => void;
	// onFailure?: (err) => void;
};

export default function useFetch<T = any>({
	url,
	key,
	initialEnabled = true,
	cache,
	body,
	headers,
	method = 'POST'
}: CustomAxiosConfig) {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<T | undefined>();
	const [error, setError] = useState<string>();
	const { getCache, setCache, deleteCache } = useCache();

	const { activeOrg } = useActiveOrgContext();

	const refetch = async (hard: boolean = false) => {
		setLoading(true);
		setError(undefined);
		if (cache?.enabled && getCache(key) !== undefined && !hard) {
			setData(getCache(key));
			setLoading(false);
			setError(undefined);
			return;
		}
		const res = await fetch(url, {
			body: JSON.stringify(body),
			headers,
			method
		});
		const { data: resData, error: resError } = (await res.json()) as { data: T; error: string };

		if (resData) {
			setData(resData);
			if (cache?.enabled) setCache(key, resData, cache.tte);
		}
		if (resError) {
			setError(resError);
		}

		setLoading(false);
	};

	function inValidate(invalidationKey: string) {
		deleteCache(invalidationKey);
	}

	useEffect(() => {
		if (!activeOrg || !activeOrg.id) return;
		if (initialEnabled) refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeOrg]);

	return { data, error, inValidate, loading, refetch } as const;
}
