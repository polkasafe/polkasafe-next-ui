import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import shortenAddress from '@next-evm/utils/shortenAddress';
import Identicon from '@polkadot/react-identicon';
import { Input } from 'antd';
import React from 'react';

interface Props {
	proxyAddress: string;
	name?: string;
	placeholder?: string;
	handleChangeProxyName: (name: string) => void;
}

export default function ProxyAddress({ proxyAddress, name, placeholder, handleChangeProxyName }: Props) {
	return (
		<div className='flex gap-3 items-center'>
			<div>
				<Identicon
					className='border-2 rounded-full bg-transparent border-proxy-pink p-1'
					value={proxyAddress}
					size={25}
					theme='polkadot'
				/>
			</div>
			<div className=' text-[10px] rounded-lg text-white flex flex-col'>
				<Input
					placeholder={placeholder || DEFAULT_ADDRESS_NAME}
					className='w-[200px] text-xs font-normal leading-[15px] border-0 outline-0 p-1 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
					id={`multisig-proxy-${proxyAddress}`}
					value={name}
					onChange={(e) => {
						console.log(e.target.value);
						handleChangeProxyName(e.target.value);
					}}
				/>
				{shortenAddress(proxyAddress)}
			</div>
			{/* {linked ? (
				<button
					className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
					onClick={handleLink}
				>
					<OutlineCloseIcon className='text-primary w-2 h-2' />
				</button>
			) : (
				<PrimaryButton
					onClick={() => handleUnLink()}
					icon={<LinkIcon className='text-proxy-pink' />}
					secondary
					className='px-3 h-full border-proxy-pink text-proxy-pink'
					size='small'
				>
					Link Proxy
				</PrimaryButton>
			)} */}
		</div>
	);
}
