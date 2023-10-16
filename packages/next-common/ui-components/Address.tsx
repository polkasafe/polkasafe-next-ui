// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import shortenAddress from '@next-substrate/utils/shortenAddress';

interface IAddressProps {
	address: string;
	className?: string;
	disableAddress?: boolean;
	disableIdenticon?: boolean;
	disableExtensionName?: string;
	displayInline?: boolean;
	extensionName?: string;
	identiconSize?: number;
	shortenAddressLength?: number;
}

const Address: React.FC<IAddressProps> = ({
	address,
	className,
	displayInline,
	disableIdenticon,
	disableAddress,
	disableExtensionName,
	extensionName,
	identiconSize,
	shortenAddressLength
}: IAddressProps) => {
	return (
		<div className={`flex w-full items-center gap-x-3 ${className} ${displayInline && 'inline-flex'}`}>
			{!disableIdenticon ? (
				<Identicon
					className='image identicon'
					value={address}
					size={identiconSize || 30}
					theme='polkadot'
				/>
			) : null}
			<p className='flex flex-col gap-y-[6px] text-xs font-normal leading-[13px]'>
				{!disableExtensionName ? <span className='text-white'>{extensionName}</span> : null}
				{!disableAddress ? (
					<span className='text-text_secondary'>{shortenAddress(address, shortenAddressLength)}</span>
				) : null}
			</p>
		</div>
	);
};

export default Address;
