import React from 'react';

import BrainIcon from '@next-common/assets/icons/brain-icon.svg';
import ChainIcon from '@next-common/assets/icons/chain-icon.svg';
import DotIcon from '@next-common/assets/icons/image 39.svg';
import SubscanIcon from '@next-common/assets/icons/subscan.svg';
import PolkadotIcon from '@next-common/assets/parachains-icons/polkadot.svg';
import Identicon from '@polkadot/react-identicon';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import { CopyIcon, QRIcon } from '@next-common/ui-components/CustomIcons';
import AddressQr from '@next-common/ui-components/AddressQr';
import { Skeleton, Spin, Tooltip } from 'antd';
import copyText from '@next-substrate/utils/copyText';
import { currencies, currencyProperties } from '@next-common/global/currencyConstants';

const DashboardCardWatch = ({
	className,
	multisigAddress,
	threshold,
	signatories,
	network,
	loadingAssets,
	numberOfTokens,
	fiatTotal
}: {
	className?: string;
	multisigAddress: string;
	threshold: number;
	signatories: number;
	network: string;
	loadingAssets: boolean;
	numberOfTokens: number;
	fiatTotal: number;
}) => {
	return (
		<div>
			<h2 className='text-base font-bold text-white mb-2'>Overview</h2>
			<div
				className={`${className} relative bg-bg-main flex flex-col rounded-lg p-5 shadow-lg h-[17rem] scale-90 w-[111%] origin-top-left`}
			>
				<div className='absolute right-5 top-5'>
					<div className='flex gap-x-4 items-center'>
						<a
							className='w-5'
							target='_blank'
							href='https://polkadot.js.org/apps/#/accounts'
							rel='noreferrer'
						>
							<PolkadotIcon />
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://explorer.polkascan.io/${network}/account/${multisigAddress}`}
							rel='noreferrer'
						>
							<BrainIcon />
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://dotscanner.com/${network}/account/${multisigAddress}?utm_source=polkadotjs`}
							rel='noreferrer'
						>
							<DotIcon />
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://${network}.polkaholic.io/account/${multisigAddress}?group=overview&chainfilters=all`}
							rel='noreferrer'
						>
							<ChainIcon />
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://${network}.subscan.io/account/${multisigAddress}`}
							rel='noreferrer'
						>
							<SubscanIcon />
						</a>
					</div>
				</div>
				<div className='w-full'>
					<div className='flex gap-x-3 items-center'>
						<div className='relative'>
							<Identicon
								className={`border-2 rounded-full bg-transparent ${'border-primary'} p-1.5`}
								value={multisigAddress}
								size={50}
								theme='polkadot'
							/>
							<div className={`${'bg-primary text-white'} text-sm rounded-lg absolute -bottom-0 left-[16px] px-2`}>
								{threshold}/{signatories}
							</div>
						</div>
						<div>
							<div className='text-base font-bold text-white flex items-center gap-x-2'>
								{DEFAULT_MULTISIG_NAME}
								<div className={`px-2 py-[2px] rounded-md text-xs font-medium ${'bg-primary text-white'}`}>
									Multisig
								</div>
							</div>
							<div className='flex text-xs mt-1'>
								<div className=' font-normal text-text_secondary'>
									{shortenAddress(getEncodedAddress(multisigAddress, network) || '', 10)}
								</div>
								<button
									className='ml-2 mr-1'
									onClick={() => copyText(multisigAddress, true, network)}
								>
									<CopyIcon className='text-primary' />
								</button>
								<Tooltip
									placement='right'
									className='cursor-pointer'
									title={
										<div className='p-2'>
											<AddressQr
												size={100}
												address={multisigAddress}
											/>
										</div>
									}
								>
									<QRIcon className='text-primary' />
								</Tooltip>
							</div>
						</div>
					</div>
				</div>
				<div className='flex gap-x-5 flex-wrap text-xs mt-4'>
					{loadingAssets ? (
						<Skeleton
							paragraph={{ rows: 1, width: 150 }}
							active
						/>
					) : (
						<>
							<div>
								<div className='text-white'>Signatories</div>
								<div className='font-bold text-lg text-primary'>{signatories || 0}</div>
							</div>
							<div>
								<div className='text-white'>Threshold</div>
								<div className='font-bold text-lg text-primary'>{threshold || 0}</div>
							</div>
							<div>
								<div className='text-white'>Tokens</div>
								<div className='font-bold text-lg text-primary'>
									{loadingAssets ? <Spin size='default' /> : numberOfTokens}
								</div>
							</div>
							<div>
								<div className='text-white'>{currencyProperties[currencies.UNITED_STATES_DOLLAR].symbol} Amount</div>
								<div className='font-bold text-lg text-primary'>
									{loadingAssets ? <Spin size='default' /> : fiatTotal.toFixed(2) || 'N/A'}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default DashboardCardWatch;
