import Button from '@common/global-ui-components/Button';
import { DocsIcon } from '@common/global-ui-components/Icons';
import { SlideInMotion } from '@common/global-ui-components/Motion/SlideIn';
import Link from 'next/link';

function DocsButton() {
	return (
		<SlideInMotion>
			<Link
				href='https://docs.polkasafe.xyz/'
				target='_blank'
				rel='noreferrer'
			>
				<Button
					icon={<DocsIcon className='text-sm text-waiting' />}
					className='p-2 h-full px-4 border-2 border-waiting text-waiting text-sm bg-transparent flex'
				>
					Docs
				</Button>
			</Link>
		</SlideInMotion>
	);
}

export default DocsButton;
