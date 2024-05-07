'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
	const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
	const router = useRouter();

	// const disabled = typeof window !== 'undefined' && window.innerWidth <= 800;

	useEffect(() => {
		if (router.push) {
			setIsLayoutReady(true);
		}
	}, [router]);

	return isLayoutReady ? children : <SplashScreen />;
};

export default LayoutWrapper;
