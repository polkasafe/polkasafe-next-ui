'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
	const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
	const { ready, authenticated } = usePrivy();
	const router = useRouter();

	useEffect(() => {
		if (ready && !!router.push) {
			setIsLayoutReady(true);
			if (!authenticated) {
				console.log('from layout wrapper');
				router.push('/login');
			}
		}
	}, [authenticated, ready, router]);

	return isLayoutReady ? children : <SplashScreen />;
};

export default LayoutWrapper;
