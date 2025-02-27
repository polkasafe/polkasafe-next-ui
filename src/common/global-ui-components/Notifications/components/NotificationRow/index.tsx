import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { PropsWithChildren, ReactNode } from 'react';

interface INotificationRow {
	icon: ReactNode;
	title: string;
}

export const NotificationRow = ({ icon, title, children }: PropsWithChildren<INotificationRow>) => {
	return (
		<article className='bg-bg-secondary rounded-lg px-4 py-3 flex items-center justify-start gap-x-8'>
			<Typography
				variant={ETypographyVariants.p}
				className='bg-transparent text-text-secondary flex items-center justify-start basis-1/4 pt-0 gap-2'
			>
				{icon} {title} Notifications
			</Typography>
			<Typography
				variant={ETypographyVariants.p}
				className='m-0 p-0 text-white text-xs flex items-center gap-x-3'
			>
				{children}
			</Typography>
		</article>
	);
};
