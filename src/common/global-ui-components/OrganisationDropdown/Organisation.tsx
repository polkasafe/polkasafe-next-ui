import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import Image from 'next/image';
import emptyImage from '@common/assets/icons/empty-image.png';
import { IOrganisation } from '@common/types/substrate';

interface IOrg {
	selectedOrganisation: IOrganisation | null;
}

// TODO: tailwind need to update
function Org({ selectedOrganisation }: IOrg) {
	return (
		<div className='relative overflow-hidden'>
			<div className='h-[50px] w-[80%] rounded-full bg-[#8558F2] absolute top-[50%] left-[50%] -translate-y-1/2 -translate-x-1/2 z-10' />
			<div className='relative z-20 flex justify-between items-center text-white gap-x-2 px-2 py-3 bg-[#281A47]/25 backdrop-blur-xl rounded-xl cursor-pointer drop-shadow-[0_0_40px_#201047] border border-[#8558F2]'>
				<div className='flex items-center gap-x-3'>
					<Image
						width={30}
						height={30}
						className='rounded-full h-[30px] w-[30px]'
						src={selectedOrganisation?.imageURI || emptyImage}
						alt='empty profile image'
					/>
					<div className='flex flex-col gap-y-[1px]'>
						<span className='text-sm text-white capitalize truncate max-w-[100px] font-bold'>
							{selectedOrganisation?.name}
						</span>
						<span className='text-xs text-text-secondary'>
							{selectedOrganisation?.multisigs?.length || 0} Multisigs
						</span>
					</div>
				</div>
				<CircleArrowDownIcon className='text-white' />
			</div>
		</div>
	);
}

export default Org;
