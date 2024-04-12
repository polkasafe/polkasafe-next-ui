// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN_ZERO } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { CopyIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import shortenAddress from '@next-substrate/utils/shortenAddress';

import { ApiPromise } from '@polkadot/api';
import ManualExtrinsics from './ManualExtrinsics';

const SubmitPreimage = ({
	setCallData,
	api,
	network,
	className,
	apiReady
}: {
	className?: string;
	api: ApiPromise;
	apiReady: boolean;
	network: string;
	setCallData: React.Dispatch<React.SetStateAction<string>>;
}) => {
	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number>(0);

	const [extrinsicCall, setExtrinsicCall] = useState<string>('');

	useEffect(() => {
		if (!api || !extrinsicCall || !api.tx.preimage || !api.tx.preimage.notePreimage) return;

		const encodedLength = Math.ceil((extrinsicCall.length - 2) / 2);
		setPreimageLength(encodedLength);

		const callhash = blake2AsHex(extrinsicCall);
		setPreimageHash(callhash);

		const notePreimageTx = api.tx.preimage.notePreimage(extrinsicCall);
		setCallData(notePreimageTx.method.toHex());

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const storageFee = ((api.consts.preimage?.baseDeposit || BN_ZERO) as unknown as BN).add(
			((api.consts.preimage?.byteDeposit || BN_ZERO) as unknown as BN).muln(encodedLength)
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, extrinsicCall]);

	return (
		<div>
			<ManualExtrinsics
				apiReady={apiReady}
				className={className}
				api={api}
				network={network}
				setCallData={setExtrinsicCall}
			/>
			{preimageHash && (
				<section className='mt-[15px]'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Preimage Hash</label>
					<div className='flex items-center gap-x-[10px]'>
						<article className='w-[500px]'>
							{
								// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
								<div
									className='text-sm cursor-pointer w-full font-normal flex items-center justify-between leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white'
									onClick={() => copyText(preimageHash)}
								>
									{shortenAddress(preimageHash, 10)}
									<button className='text-primary'>
										<CopyIcon />
									</button>
								</div>
							}
						</article>
					</div>
				</section>
			)}
			<section className='mt-[15px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Preimage Length</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px]'>
						<div className='text-sm w-full font-normal flex items-center justify-between leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white'>
							{preimageLength}
						</div>
					</article>
				</div>
			</section>
		</div>
	);
};

export default SubmitPreimage;
