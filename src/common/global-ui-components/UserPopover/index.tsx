// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Popover } from 'antd';

import Link from 'next/link';
import { CircleArrowDownIcon, WarningRoundedIcon } from '@common/global-ui-components/Icons';
import { SubstrateAddress } from '@common/global-ui-components/SubstrateAddress';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { SlideInMotion } from '@common/global-ui-components/Motion/SlideIn';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOGIN_URL } from '@substrate/app/global/end-points';
import EthIdenticon from '@common/global-ui-components/EthIdenticon';

interface IUserPopover {
	userAddress: string;
	logout?: () => Promise<void>;
}
const UserPopover = ({ userAddress, logout }: IUserPopover) => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	if (!userAddress) {
		return (
			<Link
				href='/login'
				className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs'
			>
				<WarningRoundedIcon className='text-sm text-primary' />
				Not Connected
			</Link>
		);
	}

	const handleLogout = async () => {
		try {
			setLoading(true);
			if (logout) {
				await logout();
			}
			localStorage.removeItem('logged_in_wallet');
			router.push(LOGIN_URL);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	return (
		<SlideInMotion>
			<Popover
				placement='bottom'
				content={
					<div className='bg-bg-main flex flex-col gap-2 p-4 w-64 border-[1px] border-primary rounded-lg mt-2'>
						<div className='flex flex-col items-center gap-2'>
							{userAddress.startsWith('0x') ? (
								<EthIdenticon
									className='image identicon'
									address={userAddress}
									size={50}
								/>
							) : (
								<Identicon
									className='image identicon'
									value={userAddress}
									size={50}
									theme='substrate'
								/>
							)}
							<Typography
								variant={ETypographyVariants.h6}
								className='font-bold text-text-primary m-auto'
							>
								My Address
							</Typography>
						</div>
						<div className='m-auto'>
							<SubstrateAddress
								address={userAddress}
								disableIdenticon
								className='text-text-primary bg-bg-secondary rounded-md p-2 w-auto'
								copyIcon
							/>
						</div>
						{Boolean(logout) && (
							<Button
								variant={EButtonVariant.DANGER}
								onClick={handleLogout}
								loading={loading}
								className='w-full text-text-primary bg-failure p-2 text-sm font-normal mt-3'
							>
								Disconnect
							</Button>
						)}
					</div>
				}
				trigger='click'
				arrow={false}
			>
				<Button className='p-5 px-4 border-2 border-primary bg-transparent flex gap-4'>
					<SubstrateAddress
						address={userAddress}
						identiconSize={20}
					/>
					<CircleArrowDownIcon className='text-primary' />
				</Button>
			</Popover>
		</SlideInMotion>
	);
};

export default UserPopover;
