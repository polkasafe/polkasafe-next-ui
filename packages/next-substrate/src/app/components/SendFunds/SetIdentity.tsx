// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';

const SetIdentity = ({
	className,
	multisigAddress,
	api,
	apiReady,
	setCallData
}: {
	className?: string;
	multisigAddress: string;
	api: ApiPromise;
	apiReady: boolean;
	setCallData: React.Dispatch<React.SetStateAction<string>>;
}) => {
	const [displayName, setDisplayName] = useState<string | undefined>();
	const [legalName, setLegalName] = useState<string | undefined>();
	const [elementHandle, setElementHandle] = useState<string | undefined>();
	const [websiteUrl, setWebsiteUrl] = useState<string | undefined>();
	const [twitterHandle, setTwitterHandle] = useState<string | undefined>();
	const [email, setEmail] = useState<string | undefined>();

	const getRawOrNoneObject = (val: string | undefined) => {
		return val
			? {
					Raw: val
			  }
			: { none: null };
	};

	const getMultisigAddressIdentityInfo = useCallback(async () => {
		if (!api || !apiReady) return;

		const info = await api.derive.accounts.info(multisigAddress);
		if (info.identity) {
			const { identity } = info;
			setDisplayName(identity.display);
			setLegalName(identity.legal);
			setElementHandle(identity.riot);
			setEmail(identity.email);
			setTwitterHandle(identity.twitter);
			setWebsiteUrl(identity.web);
		}
	}, [multisigAddress, api, apiReady]);

	useEffect(() => {
		getMultisigAddressIdentityInfo();
	}, [getMultisigAddressIdentityInfo]);

	useEffect(() => {
		if (!api || !apiReady) return;

		const args = {
			additional: [],
			display: getRawOrNoneObject(displayName),
			email: getRawOrNoneObject(email),
			legal: getRawOrNoneObject(legalName),
			pgpFingerprint: null,
			riot: getRawOrNoneObject(elementHandle),
			twitter: getRawOrNoneObject(twitterHandle),
			web: getRawOrNoneObject(websiteUrl)
		};

		const tx = api.tx.identity.setIdentity(args);
		setCallData(tx.method.toHex());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, displayName, elementHandle, email, legalName, twitterHandle, websiteUrl]);

	return (
		<div className={`grid grid-cols-2 gap-4 ${className}`}>
			<section className='mt-[15px] w-full'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Display Name*</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='display_name'
							rules={[{ message: 'Required', required: true }]}
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='display_name'
									onChange={(a) => setDisplayName(a.target.value)}
									placeholder='John'
									value={displayName}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-full'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Legal Name</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='legal_name'
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='legal_name'
									onChange={(a) => setLegalName(a.target.value)}
									placeholder='John Doe'
									value={legalName}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-full'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Element Handle</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='element'
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='element'
									onChange={(a) => setElementHandle(a.target.value)}
									placeholder='@john:matrix.org'
									value={elementHandle}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-full'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Website</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='website'
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='website'
									onChange={(a) => setWebsiteUrl(a.target.value)}
									placeholder='https://john.me'
									value={websiteUrl}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-full'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Twitter Handle</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='twitter'
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='twitter'
									onChange={(a) => setTwitterHandle(a.target.value)}
									placeholder='@john'
									value={twitterHandle}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-full'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Email</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='email'
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='email'
									onChange={(a) => setEmail(a.target.value)}
									placeholder='johndoe123@email.com'
									value={email}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
		</div>
	);
};

export default SetIdentity;
