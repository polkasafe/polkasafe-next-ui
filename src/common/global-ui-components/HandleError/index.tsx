import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { PropsWithChildren, ReactNode } from 'react';

export const HandleError = ({
	fallback,
	children
}: PropsWithChildren<{
	fallback?: ReactNode;
}>) => {
	try {
		return children;
	} catch (error) {
		return (
			fallback || (
				<div>
					<Typography variant={ETypographyVariants.h1}>Something went wrong.</Typography>
				</div>
			)
		);
	}
};
