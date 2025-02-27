'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { SplashScreen } from './SplashScreen';

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
	const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		if (!router.push) {
			return;
		}
		setIsLayoutReady(true);
	}, [router]);

	return isLayoutReady ? (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm
			}}
		>
			{children}
		</ConfigProvider>
	) : (
		<SplashScreen />
	);
};
