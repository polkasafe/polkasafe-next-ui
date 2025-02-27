'use client';

import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';

export default function ErrorBoundaries({ error }: { error: Error }) {
	console.log('Error:', error);
	return (
		<div className='w-full h-full'>
			<Typography variant={ETypographyVariants.h1}>{error.message}</Typography>
			<a href={'/dashboard'}>
				<Button variant={EButtonVariant.PRIMARY}> Go Back to Home</Button>
			</a>
		</div>
	);
}
