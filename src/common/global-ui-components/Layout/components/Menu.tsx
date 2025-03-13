// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import PolkasafeLogo from '@common/assets/icons/polkasafe.svg';
import { usePathname, useSearchParams } from 'next/navigation';
import { menuItems } from '@common/global-ui-components/Layout/utils/menuItems';
import MenuItem from '@common/global-ui-components/Layout/components/MenuItem';
// import MultisigList from '@common/global-ui-components/MultisigList';
// import { Skeleton } from 'antd';
import { ScaleMotion } from '@common/global-ui-components/Motion/Scale';
import { IOrganisation } from '@common/types/substrate';
import { PlusCircleOutlined } from '@ant-design/icons';
import OrganisationDropdown from '@common/global-ui-components/OrganisationDropdown';
import { Divider, Skeleton } from 'antd';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { CREATE_ORGANISATION_URL } from '@substrate/app/global/end-points';

const getPath = (basePath: string) => {
	return basePath;
};

interface IMenuProps {
	userAddress: string;
	organisation: IOrganisation | null;
	organisations: Array<IOrganisation>;
}

const styles = {
	menu: 'text-xs font-normal text-text-secondary uppercase ml-4'
};

const Menu = ({ userAddress, organisation, organisations }: IMenuProps) => {
	const pathname = usePathname();
	// const { multisigs = [] } = organisation || {};
	const searchParams = useSearchParams();
	const organisationParam = searchParams.get('_organisation');
	const multisig = searchParams.get('_multisig');
	const network = searchParams.get('_network');

	const getUrl = (baseUrl: string, tab?: string) => {
		if (multisig && network && organisationParam) {
			// eslint-disable-next-line sonarjs/no-nested-template-literals
			return `${baseUrl}?_multisig=${multisig}&_network=${network}&_organisation=${organisationParam}${tab ? `&_tab=${tab}` : ''}`;
		}
		if (organisationParam) {
			return `${baseUrl}?_organisation=${organisationParam}&_tab=${tab}`;
		}
		return '/';
	};

	return (
		<div className='bg-bg-main flex flex-col h-full py-4 px-3 max-sm:px-0 max-sm:py-0 justify-between'>
			<div className='flex flex-col mb-3 max-sm:mb-1 overflow-y-hidden overflow-x-hidden'>
				<ScaleMotion>
					<section className='flex mb-7 justify-center w-full'>
						<Link
							className='text-white'
							href={getPath('/')}
						>
							<PolkasafeLogo />
						</Link>
					</section>
				</ScaleMotion>

				<section>
					<h2 className={styles.menu}>Account</h2>
					{organisations && organisations.length > 0 ? (
						<OrganisationDropdown
							organisations={organisations}
							selectedOrganisation={organisation}
						/>
					) : (
						<Skeleton
							paragraph={{ rows: 1 }}
							active
						/>
					)}
				</section>

				<Divider className='border-text-disabled my-3' />

				<section className='flex-1 flex flex-col overflow-y-hidden overflow-x-hidden'>
					<h2 className={styles.menu}>Menu</h2>
					<ul className='flex flex-1 flex-col py-2 text-white list-none max-sm:h-80'>
						{menuItems.map((item) => {
							return (
								<MenuItem
									key={item.title}
									baseURL={getUrl(item.baseURL, item.tab)}
									authenticated={Boolean(userAddress)}
									icon={item.icon}
									pathname={pathname}
									isNew={item.isNew}
									title={item.title}
									noShow={item.noShow}
								/>
							);
						})}
					</ul>
				</section>
			</div>

			{userAddress && (
				<Link href={CREATE_ORGANISATION_URL}>
					<Button
						variant={EButtonVariant.PRIMARY}
						className='bg-primary border-primary text-sm'
						fullWidth
						icon={<PlusCircleOutlined />}
						size='large'
					>
						Create Organisation
					</Button>
				</Link>
			)}
		</div>
	);
};

export default Menu;
