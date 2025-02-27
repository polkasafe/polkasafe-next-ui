import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { SlideInMotion } from '@common/global-ui-components/Motion/SlideIn';
import { ScaleMotion } from '@common/global-ui-components/Motion/Scale';

interface MenuItemProps {
	pathname: string;
	baseURL: string;
	icon: React.ReactNode;
	title: string;
	authenticated: boolean;
	isNew?: boolean;
	noShow?: boolean;
}
const styles = {
	linkContainer: 'flex items-center gap-x-2 flex-1 rounded-lg p-3 text-sm max-sm:p-2 font-semibold hover:text-label',
	selected: 'bg-highlight text-label',
	disabled: 'pointer-events-none cursor-disabled text-text-disabled',
	newTag: 'px-2.5 py-0.5 rounded-lg text-xs bg-primary text-text-primary'
};

function MenuItem({ pathname, baseURL, icon, title, authenticated, isNew, noShow }: MenuItemProps) {
	if (noShow) return null;
	return (
		<SlideInMotion>
			<ScaleMotion>
				<li
					className='w-full'
					key={baseURL}
				>
					<Link
						className={twMerge(
							styles.linkContainer,
							baseURL.split('?')[0] === pathname && styles.selected,
							!authenticated && styles.disabled
						)}
						href={baseURL}
					>
						{icon}
						{title}
						{isNew && <div className={styles.newTag}>New</div>}
					</Link>
				</li>
			</ScaleMotion>
		</SlideInMotion>
	);
}

export default MenuItem;
