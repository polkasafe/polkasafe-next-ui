import { SlideInMotion } from '@common/global-ui-components/Motion/SlideIn';

interface IBreadcrumbProps {
	link: string;
	subLink?: string;
}

function Breadcrumb({ link, subLink }: IBreadcrumbProps) {
	return (
		<SlideInMotion>
			<span className='px-3 py-2 bg-bg-secondary text-primary text-xl font-bold rounded-lg capitalize'>
				{link.slice(1).split('-').join(' ')}
				{subLink ? `/${subLink}` : ''}
			</span>
		</SlideInMotion>
	);
}

export default Breadcrumb;
