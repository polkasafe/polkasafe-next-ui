import { Layout as AntDLayout } from 'antd';
import { usePathname } from 'next/navigation';
import Breadcrumb from '@common/global-ui-components/Breadcrumb';
import NotificationPopover from '@common/global-ui-components/NotificationPopover';
import DonateButton from '@common/global-ui-components/DonateButton';
import DocsButton from '@common/global-ui-components/DocsButton';
import UserPopover from '@common/global-ui-components/UserPopover';

const { Header } = AntDLayout;

interface INavHeaderProps {
	userAddress: string;
	logout: () => void;
}

function NavHeader({ userAddress, logout }: INavHeaderProps) {
	const pathname = usePathname();

	return (
		<Header className='bg-bg-main flex items-center px-0 justify-between pr-3 h-[70px] sticky top-0 left-0 z-50'>
			<div className='p-0 m-0'>
				<Breadcrumb link={pathname} />
			</div>
			<div className='flex items-center gap-x-3'>
				<NotificationPopover />
				{userAddress && (
					<UserPopover
						userAddress={userAddress}
						logout={async () => {
							logout();
						}}
					/>
				)}
				<DonateButton />
				<DocsButton />
			</div>
		</Header>
	);
}

export default NavHeader;
