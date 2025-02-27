// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';

import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { compactToU8a, isHex, u8aConcat, u8aEq } from '@polkadot/util';

interface IExtrinsicInfo {
	decoded: SubmittableExtrinsic<'promise'> | null;
	extrinsicCall: any;
	extrinsicError: string | null;
	extrinsicFn: SubmittableExtrinsicFunction<'promise'> | null;
	extrinsicHex: string | null;
	extrinsicKey: string;
	extrinsicPayload: any;
	isCall: boolean;
}

const DEFAULT_INFO: IExtrinsicInfo = {
	decoded: null,
	extrinsicCall: null,
	extrinsicError: null,
	extrinsicFn: null,
	extrinsicHex: null,
	extrinsicKey: 'none',
	extrinsicPayload: null,
	isCall: true
};

interface IArgumentsTableProps {
	className?: string;
	callData: string;
	api: ApiPromise;
	network: string;
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

const constructAnchorTag = (value: string) => {
	if (value && typeof value === 'string') {
		const urls = value.match(urlRegex);
		if (urls && Array.isArray(urls)) {
			urls?.forEach((url) => {
				if (url && typeof url === 'string') {
					// eslint-disable-next-line no-param-reassign
					value = value.replace(url, `<a class="text-bg-primary" href='${url}' target='_blank'>${url}</a>`);
				}
			});
		}
		// else if(getSubstrateAddress(value)){
		// value = value.replace(value, shortenAddress(value));
		// }
	}
	return value;
};

function decodeCallData(hex: string, api: ApiPromise): { data?: IExtrinsicInfo; error?: string } {
	if (!isHex(hex))
		return {
			error: 'Invalid hex string'
		};

	try {
		let extrinsicCall;
		let extrinsicPayload = null;
		let decoded: SubmittableExtrinsic<'promise'> | null = null;
		let isCall = false;

		// Ref - Polkadot apps https://github.com/polkadot-js/apps/blob/0df3dbf03151d516cd55762860b4586117290c9e/packages/page-extrinsics/src/Decoder.tsx
		try {
			// cater for an extrinsic input
			const tx = api.tx(hex);

			// ensure that the full data matches here
			if (tx.toHex() === hex)
				return {
					error: 'Cannot decode data as extrinsic, length mismatch'
				};

			decoded = tx;
			extrinsicCall = api.createType('Call', decoded.method);
		} catch {
			try {
				// attempt to decode as Call
				extrinsicCall = api.createType('Call', hex);

				const callHex = extrinsicCall.toHex();

				if (callHex === hex) {
					// all good, we have a call
					isCall = true;
				} else if (hex.startsWith(callHex)) {
					// this could be an un-prefixed payload...
					const prefixed = u8aConcat(compactToU8a(extrinsicCall.encodedLength), hex);

					extrinsicPayload = api.createType('ExtrinsicPayload', prefixed);

					if (u8aEq(extrinsicPayload.toU8a(), prefixed))
						return {
							error: 'Unable to decode data as un-prefixed ExtrinsicPayload'
						};

					extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
				} else {
					throw new Error('Unable to decode data as Call, length mismatch in supplied data');
				}
			} catch {
				// final attempt, we try this as-is as a (prefixed) payload
				extrinsicPayload = api.createType('ExtrinsicPayload', hex);

				if (extrinsicPayload.toHex() === hex)
					return {
						error: 'Unable to decode input data as Call, Extrinsic or ExtrinsicPayload'
					};

				extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
			}
		}

		const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
		const extrinsicFn = api.tx[section][method];
		const extrinsicKey = extrinsicCall.callIndex.toString();

		if (!decoded) {
			decoded = extrinsicFn(...extrinsicCall.args);
		}

		const extrinsicInfo: IExtrinsicInfo = {
			...DEFAULT_INFO,
			decoded,
			extrinsicCall,
			extrinsicFn,
			extrinsicHex: hex,
			extrinsicKey,
			extrinsicPayload,
			isCall
		};

		return {
			data: extrinsicInfo
		};
	} catch (e) {
		return {
			error: (e as Error).message
		};
	}
}

const Arguments = ({ argumentsJSON }: { argumentsJSON: any }) => {
	if (!argumentsJSON) return null;
	return (
		<>
			{Object.entries(argumentsJSON).map(([name, value], index) => {
				return (
					<div key={index}>
						<tr className='grid grid-cols-4 border-b border-bg-secondary gap-x-2 text-white'>
							<td className='sm:w-auto p-2 border-r border-solid border-bg-secondary truncate col-span-1 flex items-center text-sm'>
								{name}
							</td>
							{typeof value !== 'object' ? (
								// eslint-disable-next-line jsx-a11y/control-has-associated-label
								<td
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={{
										// eslint-disable-next-line @typescript-eslint/naming-convention
										__html: constructAnchorTag(value as any)
									}}
									className=' p-2 col-span-3 truncate text-sm'
								/>
							) : (
								<td className='sm:w-auto col-span-3 text-sm'>
									<Arguments argumentsJSON={value} />
								</td>
							)}
						</tr>
					</div>
				);
			})}
		</>
	);
};

const ArgumentsTable: FC<IArgumentsTableProps> = ({ callData, className, api, network }) => {
	const [decodedCallData, setDecodedCallData] = useState<any>();
	const [txnParams, setTxnParams] = useState<{ method: string; section: string }>({} as any);

	useEffect(() => {
		if (!api || !callData) return;

		const { data, error } = decodeCallData(callData, api);
		if (error || !data) return;

		setDecodedCallData(data.extrinsicCall?.toJSON());

		const callDataFunc = data.extrinsicFn;
		// if(callDataFunc?.section === 'proxy' && callDataFunc?.method === 'proxy'){
		// const func:any = data.extrinsicCall?.args[2].toHuman();
		// callDataFunc = func.args?.calls?.[0];
		// }
		setTxnParams({ method: `${callDataFunc?.method}`, section: `${callDataFunc?.section}` });
	}, [api, callData, network]);
	return (
		<>
			<div className={className}>
				<div className='flex items-center gap-x-5 justify-between'>
					<span className='text-text-secondary font-normal text-sm leading-[15px]'>Section:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text-secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'> {txnParams?.section}</span>
					</p>
				</div>
				<div className='flex items-center gap-x-5 justify-between mt-3'>
					<span className='text-text-secondary font-normal text-sm leading-[15px]'>Method:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text-secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'> {txnParams?.method}</span>
					</p>
				</div>
			</div>
			<div className='w-full overflow-auto max-h-[500px]'>
				<table
					cellSpacing={0}
					cellPadding={0}
					className='w-full mt-3 overflow-scroll'
				>
					<article className='grid grid-cols-4 gap-x-2 bg-bg-secondary text-text-secondary py-2 px-2 rounded-t-md'>
						<span className='col-span-1'>Name</span>
						<span className='col-span-3'>Value</span>
					</article>
					{decodedCallData && decodedCallData?.args && (
						<tbody className='border-l border-r border-solid border-bg-secondary bg-bg-main'>
							<Arguments argumentsJSON={decodedCallData.args} />
						</tbody>
					)}
				</table>
			</div>
		</>
	);
};

export default ArgumentsTable;
