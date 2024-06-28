import { IAsset } from '@next-common/types';
import React from 'react';
import { Divider } from 'antd';
import { ParachainIcon } from '../../NetworksDropdown/NetworkCard';

const Assets = ({ assets }: { assets: IAsset[] }) => {
	return (
		<div className='flex flex-col h-full'>
			<div className='grid grid-cols-3 gap-x-5 bg-bg-secondary text-text_secondary p-3 rounded-lg scale-90 w-[111%] origin-top-left'>
				<span className='col-span-1'>Asset</span>
				<span className='col-span-1'>Balance</span>
				<span className='col-span-1'>Value</span>
			</div>
			{assets &&
				assets.length > 0 &&
				assets.map((asset, index) => {
					const { balance_token, balance_usd, logoURI, name, symbol } = asset;
					return (
						<>
							<article
								className='grid grid-cols-3 gap-x-5 py-6 px-4 text-white'
								key={index}
							>
								<div className='col-span-1 flex items-center'>
									<ParachainIcon src={logoURI} />
									<span
										title={symbol}
										className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden capitalize'
									>
										{symbol}
									</span>
								</div>
								<p
									title={balance_token}
									className='sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
								>
									{!Number.isNaN(balance_token) &&
										Number(balance_token)
											.toFixed(2)
											.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
									{name}
								</p>
								<p
									title={balance_usd}
									className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
								>
									{!Number.isNaN(balance_usd)
										? `$ ${Number(balance_usd)
												.toFixed(2)
												.replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
										: '-'}
								</p>
							</article>
							{assets.length - 1 !== index ? <Divider className='bg-text_secondary my-0' /> : null}
						</>
					);
				})}
		</div>
	);
};

export default Assets;
