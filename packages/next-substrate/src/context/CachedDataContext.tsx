// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';

type ContextType = {
	getCache: (key: string) => any;
	setCache: (key: string, value: any, ttl?: number) => void;
	clearCache: () => void;
	deleteCache: (key: string) => void;
};

type CacheBody = {
	expiry: Date;
	data: any;
};

const CacheContext = createContext<ContextType | null>(null);

export function useCache() {
	return useContext(CacheContext) as ContextType;
}

export default function CacheProvider({ children }: { children: ReactNode }) {
	const map = new Map<string, CacheBody>();

	function getCache(key: string) {
		const cacheValue = map.get(key);
		if (!cacheValue) return undefined;
		if (new Date().getTime() > cacheValue.expiry.getTime()) {
			map.delete(key);
			return undefined;
		}
		return cacheValue.data;
	}

	function setCache(key: string, value: any, tte: number = 10) {
		const t = new Date();
		t.setSeconds(t.getSeconds() + tte);
		map.set(key, {
			expiry: t,
			data: value
		});
	}

	function clearCache() {
		map.clear();
	}

	function deleteCache(key: string) {
		map.delete(key);
	}

	const contextValue = useMemo(
		() => ({
			getCache,
			setCache,
			clearCache,
			deleteCache
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return <CacheContext.Provider value={contextValue}>{children}</CacheContext.Provider>;
}
