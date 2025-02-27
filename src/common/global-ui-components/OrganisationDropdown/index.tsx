import { Dropdown, Tooltip } from 'antd';
import { SlideInMotion } from '@common/global-ui-components/Motion/SlideIn';
import { MULTISIG_DASHBOARD_URL, ORGANISATION_DASHBOARD_URL } from '@substrate/app/global/end-points';
import { IOrganisation } from '@common/types/substrate';
import Link from 'next/link';
import Org from '@common/global-ui-components/OrganisationDropdown/Organisation';
import Image from 'next/image';
import emptyImage from '@common/assets/icons/empty-image.png';
import Address from '@common/global-ui-components/Address';
import { useSearchParams } from 'next/navigation';
import { ENetwork } from '@common/enum/substrate';
import { DangerTriangleIcon } from '@common/global-ui-components/Icons';

interface IOrganisationDropdown {
	organisations: Array<IOrganisation>;
	selectedOrganisation: IOrganisation | null;
}

// TODO: tailwind need to update
function OrganisationDropdown({ organisations, selectedOrganisation }: IOrganisationDropdown) {
	const searchParams = useSearchParams();
	const organisationId = searchParams.get('_organisation');
	const multisigId = searchParams.get('_multisig');
	const network = searchParams.get('_network');

	if (!organisationId) return;

	return (
		<SlideInMotion>
			<Dropdown
				trigger={['click']}
				className='my-2'
				menu={{
					selectable: true,
					selectedKeys: [organisationId],
					defaultSelectedKeys: [organisationId],
					items: organisations.map((item) => ({
						key: item.id,
						label: (
							<Link
								className='flex items-center gap-x-3'
								href={ORGANISATION_DASHBOARD_URL({ id: item.id })}
								onClick={() => {
									localStorage.setItem('currentOrganisation', item.id);
								}}
							>
								<div
									className={`h-[16px] w-[16px] p-1 rounded-full border ${item.id === organisationId ? 'border-primary' : 'border-text-secondary'}`}
								>
									<div
										className={`w-full h-full rounded-full ${item.id === organisationId ? 'bg-primary' : 'bg-transparent'}`}
									/>
								</div>
								<div className='flex items-center gap-x-3'>
									<Image
										width={35}
										height={35}
										className='rounded-full h-[35px] w-[35px]'
										src={item.imageURI || emptyImage}
										alt='empty profile image'
									/>
									<div className='flex flex-col gap-y-[1px]'>
										<span className='text-sm text-white capitalize truncate max-w-[100px] font-bold'>{item.name}</span>
										<span className='text-xs text-text-secondary'>{item.multisigs?.length || 0} Multisigs</span>
									</div>
								</div>
							</Link>
						),
						children: item.multisigs?.map((m) => ({
							key: `${m.address}_${m.network}`,
							label: (
								<div
									className={`flex items-center gap-x-3 px-2 ${m.address === multisigId && network === m.network && item.id === organisationId ? 'bg-highlight rounded-lg py-2' : ''}`}
								>
									<div
										className={`h-[16px] w-[16px] p-1 rounded-full border ${m.address === multisigId && network === m.network && item.id === organisationId ? 'border-primary' : 'border-text-secondary'}`}
									>
										<div
											className={`w-full h-full rounded-full ${m.address === multisigId && network === m.network && item.id === organisationId ? 'bg-primary' : 'bg-transparent'}`}
										/>
									</div>
									<Link
										href={MULTISIG_DASHBOARD_URL({ multisig: m.address, network: m.network, organisationId: item.id })}
										className='flex items-start gap-x-3 justify-between w-full'
									>
										<span>
											<Address
												address={m.address}
												name={m.name}
												network={m.network || ENetwork.POLKADOT}
												isMultisig
												signatories={m.signatories.length}
												threshold={m.threshold}
												showNetworkBadge
												withBadge={false}
												allowEdit={false}
											/>
										</span>
										{(!m.proxy || m.proxy.length === 0) && (
											<Tooltip
												title='This Multisig has no Proxy'
												className='mt-2'
											>
												<DangerTriangleIcon className='text-waiting' />
											</Tooltip>
										)}
									</Link>
								</div>
							)
						}))
					}))
				}}
			>
				<div>
					<Org selectedOrganisation={selectedOrganisation} />
				</div>
			</Dropdown>
		</SlideInMotion>
	);
}

export default OrganisationDropdown;
