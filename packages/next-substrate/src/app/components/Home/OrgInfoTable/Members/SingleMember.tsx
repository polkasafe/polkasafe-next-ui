import { IAllAddresses } from '@next-common/types';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import React, { useEffect, useState } from 'react';
import { EditAddressModal, RemoveAddressModal } from '@next-substrate/app/components/AddressBook/AddressTable';
import Identicon from '@polkadot/react-identicon';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import { CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';

const SingleMember = ({ name, address: memberAddress }: { name: string; address: string }) => {
	const { activeOrg } = useActiveOrgContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [addresses, setAddresses] = useState<IAllAddresses>({} as any);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { address: userAddress } = useGlobalUserDetailsContext();

	useEffect(() => {
		setAddresses({});
		if (!activeOrg) return;
		const { addressBook } = activeOrg;
		const allAddresses: IAllAddresses = {};
		addressBook.forEach((item) => {
			const { address } = item;
			if (Object.keys(allAddresses).includes(address)) {
				if (item.nickName) {
					allAddresses[address].nickName = item.nickName;
				}
				if (!allAddresses[address]?.name) {
					allAddresses[address].name = item.name;
				}
			} else {
				allAddresses[address] = {
					address,
					discord: item.discord,
					email: item.email,
					name: item.name,
					nickName: item.nickName,
					roles: item.roles,
					shared: false,
					telegram: item.telegram
				};
			}
		});

		Object.keys(allAddresses)?.forEach((address) => {
			setAddresses((prev) => {
				return {
					...prev,
					[address]: {
						address: allAddresses[address]?.address,
						discord: allAddresses[address]?.discord,
						email: allAddresses[address]?.email,
						name: allAddresses[address]?.name,
						nickName: allAddresses[address]?.nickName,
						roles: allAddresses[address]?.roles,
						shared: allAddresses[address]?.shared,
						telegram: allAddresses[address]?.telegram
					}
				};
			});
		});
	}, [activeOrg]);

	return (
		<>
			<div className='flex items-center px-2 pb-2 mb-2 gap-x-3 text-white grid grid-cols-9 max-sm:hidden'>
				<p className='col-span-2'>{name}</p>
				<p className='col-span-5 flex items-center gap-x-3'>
					<Identicon
						size={28}
						value={memberAddress}
						theme='polkadot'
					/>
					<span>{shortenAddress(memberAddress || '', 10)}</span>
					<span className='flex items-center gap-x-2'>
						<button onClick={() => copyText(memberAddress, true)}>
							<CopyIcon className='hover:text-primary' />
						</button>
						<a
							href={`https://www.subscan.io/account/${memberAddress}`}
							target='_blank'
							rel='noreferrer'
						>
							<ExternalLinkIcon />
						</a>
					</span>
				</p>
				<p className='col-span-2 flex items-center gap-x-3'>
					<EditAddressModal
						nameToEdit={name}
						addressToEdit={memberAddress}
					/>
					<RemoveAddressModal
						addresses={addresses}
						address={memberAddress}
						userAddress={userAddress}
						members={activeOrg?.members}
					/>
				</p>
			</div>
			<div className='flex justify-between items-center text-white text-xs sm:hidden'>
				<div>
					<p className='col-span-2'>{name}</p>
					<p className='col-span-5 flex items-center gap-x-3'>
						<Identicon
							size={28}
							value={memberAddress}
							theme='polkadot'
						/>
						<span>{shortenAddress(memberAddress || '', 5)}</span>
						<span className='flex items-center gap-x-2'>
							<button onClick={() => copyText(memberAddress, true)}>
								<CopyIcon className='hover:text-primary' />
							</button>
							<a
								href={`https://www.subscan.io/account/${memberAddress}`}
								target='_blank'
								rel='noreferrer'
							>
								<ExternalLinkIcon />
							</a>
						</span>
					</p>
				</div>
				<p className='col-span-2 flex items-center gap-x-3'>
					<EditAddressModal
						nameToEdit={name}
						addressToEdit={memberAddress}
					/>
					<RemoveAddressModal
						addresses={addresses}
						address={memberAddress}
						userAddress={userAddress}
						members={activeOrg?.members}
					/>
				</p>
			</div>
		</>
	);
};

export default SingleMember;
