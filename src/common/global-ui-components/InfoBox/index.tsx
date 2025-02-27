import { WarningCircleIcon } from '@common/global-ui-components/Icons';
import { twMerge } from 'tailwind-merge';

const InfoBox = ({ message, className }: { message: string; className?: string }) => {
	return (
		<section
			className={twMerge(
				'mb-4 text-[13px] w-full text-waiting bg-[#ff9f1c]/[0.1] p-2.5 rounded-lg font-normal flex items-center gap-x-2',
				className
			)}
		>
			<WarningCircleIcon />
			<p className='text-wrap'>{message}</p>
		</section>
	);
};

export default InfoBox;
