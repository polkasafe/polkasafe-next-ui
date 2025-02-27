import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { IAddressBook } from '@common/types/substrate';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import shortenAddress from '@common/utils/shortenAddress';
import Identicon from '@polkadot/react-identicon';
import EthIdenticon from '@common/global-ui-components/EthIdenticon';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Message = ({
	text,
	time,
	from,
	userAddress,
	addressBook
}: {
	text: string;
	time: Date;
	from: string;
	userAddress: string;
	addressBook: IAddressBook[];
}) => {
	const displayName = addressBook?.find(
		(item) => getSubstrateAddress(item.address) === getSubstrateAddress(from)
	)?.name;
	return from === userAddress ? (
		<div
			className={`py-1 px-3 rounded-lg max-w-[70%] text-white font-medium break-words ${from === userAddress ? 'bg-primary ml-auto' : 'bg-bg-main mr-auto'}`}
		>
			{text}
		</div>
	) : (
		<div className='flex gap-x-2 items-center'>
			{userAddress.startsWith('0x') ? (
				<EthIdenticon
					className='image identicon'
					address={userAddress}
					size={50}
				/>
			) : (
				<Identicon
					size={30}
					theme='polkadot'
					value={from}
				/>
			)}

			<div className='flex flex-col gap-y-1 w-full'>
				<div
					className={`py-1 px-3 rounded-lg max-w-[70%] text-white font-medium break-words ${from === userAddress ? 'bg-primary ml-auto' : 'bg-bg-main mr-auto'}`}
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
