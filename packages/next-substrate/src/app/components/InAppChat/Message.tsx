import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import Identicon from '@polkadot/react-identicon';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Message = ({ text, time, from }: { text: string; time: Date; from: string }) => {
	const { userID } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const displayName = activeOrg?.addressBook?.find(
		(item) => getSubstrateAddress(item.address) === getSubstrateAddress(from)
	)?.name;
	return from === userID ? (
		<div
			className={`py-1 px-3 rounded-lg max-w-[70%] text-white font-medium break-words ${from === userID ? 'bg-primary ml-auto' : 'bg-bg-main mr-auto'}`}
		>
			{text}
		</div>
	) : (
		<div className='flex gap-x-2 items-center'>
			<Identicon
				size={30}
				theme='polkadot'
				value={from}
			/>
			<div className='flex flex-col gap-y-1 w-full'>
				<div
					className={`py-1 px-3 rounded-lg max-w-[70%] text-white font-medium break-words ${from === userID ? 'bg-primary ml-auto' : 'bg-bg-main mr-auto'}`}
				>
					{text}
				</div>
				<span className='text-[11px] text-text_placeholder'>
					{displayName && displayName !== DEFAULT_ADDRESS_NAME ? displayName : shortenAddress(from)}
				</span>
			</div>
		</div>
	);
};

export default Message;
