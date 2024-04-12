'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
	const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
	const { ready, authenticated } = usePrivy();
	const router = useRouter();

	const disabled = typeof window !== 'undefined' && window.innerWidth <= 800;

	useEffect(() => {
		if (ready && !!router.push) {
			setIsLayoutReady(true);
			if (!authenticated) {
				console.log('from layout wrapper');
				router.push('/login');
			}
		}
	}, [authenticated, ready, router]);

	return disabled ? (
		<div className='h-screen w-full flex justify-center items-start p-8 bg-bg-main'>
			<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
				<p className='text-white'>
					Sorry, this website is not accessible on mobile devices. Please visit us on a desktop or laptop computer for
					the best experience.
				</p>
			</section>
		</div>
	) : isLayoutReady ? (
		children
	) : (
		<SplashScreen />
	);
};

export default LayoutWrapper;
