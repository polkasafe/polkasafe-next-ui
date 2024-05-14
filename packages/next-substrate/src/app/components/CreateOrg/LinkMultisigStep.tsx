/* eslint-disable sonarjs/cognitive-complexity */
import {
	CircleArrowDownIcon,
	CreateMultisigIcon,
	LinkIcon,
	OutlineCloseIcon
} from '@next-common/ui-components/CustomIcons';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useEffect, useState } from 'react';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import Loader from '@next-common/ui-components/Loader';
import { IMultisigAddress } from '@next-common/types';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import NetworkCard, { ParachainIcon } from '../NetworksDropdown/NetworkCard';
import CreateMultisig from '../Multisig/CreateMultisig';
import ProxyAddress from '../Proxy/ProxyAddress';

const LinkMultisigStep = ({
	linkedMultisigs,
	setLinkedMultisigs
}: {
	linkedMultisigs: IMultisigAddress[];
	setLinkedMultisigs: React.Dispatch<React.SetStateAction<IMultisigAddress[]>>;
}) => {
	const { address, multisigSettings } = useGlobalUserDetailsContext();
	const [selectedNetwork, setSelectedNetwork] = useState(networks.POLKADOT);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [openCreateMultisigModal, setOpenCreateMultisigModal] = useState<boolean>(false);
	const [multisigs, setMultisigs] = useState<IMultisigAddress[]>([]);
	const { activeOrg } = useActiveOrgContext();

	const multisigAddresses = activeOrg.multisigs;
	const alreadyLinkedProxy = activeOrg.multisigs
		.map((multisig) => multisig.proxy)
		.flat()
		.filter((a) => a);

	const getProxyNameMapByAddress = (proxyAddress: any) => {
		const result = {};
		proxyAddress.forEach((px) => {
			if (px && typeof px !== 'string' && px.address && px.name) {
				result[px.address] = px.name;
			}
		});
		return result;
	};

	const fetchMultisigs = async () => {
		if (!address) return;
		setLoading(true);
		const response = await fetch(`https://${selectedNetwork}.api.subscan.io/api/v2/scan/search`, {
			body: JSON.stringify({
				key: address
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const responseJSON = await response.json();
		if (responseJSON?.data && responseJSON?.data?.account?.multisig?.multi_account) {
			const multiAddresses = responseJSON.data.account.multisig.multi_account;
			const fetchedMultisigs: IMultisigAddress[] = [];
			await Promise.all(
				multiAddresses.map(async (a: { address: string }) => {
					const multisigInfoRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigDataByMultisigAddress_substrate`, {
						body: JSON.stringify({
							multisigAddress: a.address,
							network: selectedNetwork
						}),
						headers: firebaseFunctionsHeader(),
						method: 'POST'
					});
					const { data: multisigDataRes, error: multisigError } = (await multisigInfoRes.json()) as {
						data: IMultisigAddress;
						error: string;
					};
					if (!multisigError && multisigDataRes) {
						fetchedMultisigs.push({
							address: a.address,
							name: multisigSettings?.[`${a}_${selectedNetwork}`]?.name || DEFAULT_ADDRESS_NAME,
							network: selectedNetwork,
							proxy: multisigDataRes?.proxy,
							signatories: multisigDataRes?.signatories,
							threshold: multisigDataRes?.threshold
						});
					}
				})
			);
			console.log(fetchedMultisigs);
			setMultisigs(fetchedMultisigs);
		}
		setLoading(false);
	};

	useEffect(() => {
		setMultisigs([]);
		fetchMultisigs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedNetwork]);

	const networkOptions: ItemType[] = Object.values(networks).map((item) => ({
		key: item,
		label: (
			<NetworkCard
				selectedNetwork={selectedNetwork}
				key={item}
				network={item}
			/>
		)
	}));

	return (
		<div className='flex flex-col gap-y-5'>
			<ModalComponent
				title='Create Multisig'
				open={openCreateMultisigModal}
				onCancel={() => setOpenCreateMultisigModal(false)}
			>
				<CreateMultisig
					onComplete={(multisig) => {
						setLinkedMultisigs((prev) => [
							...prev,
							{
								address: multisig.address,
								disabled: false,
								name: multisig.name || DEFAULT_ADDRESS_NAME,
								network: multisig.network,
								signatories: multisig.signatories,
								threshold: multisig.threshold
							}
						]);
						setSelectedNetwork(multisig.network);
					}}
					onCancel={() => setOpenCreateMultisigModal(false)}
				/>
			</ModalComponent>
			<div className='rounded-xl p-6 bg-bg-main'>
				<p className='text-sm font-bold mb-2 text-white flex justify-between w-full items-center'>
					Link MultiSig(s)
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg p-1.5 bg-bg-secondary cursor-pointer min-w-[150px]'
						menu={{
							items: networkOptions,
							onClick: (e) => setSelectedNetwork(e.key)
						}}
					>
						<div className='flex justify-between items-center text-white gap-x-2'>
							<div className='capitalize flex items-center gap-x-2 text-sm'>
								<ParachainIcon
									size={15}
									src={chainProperties[selectedNetwork]?.logo}
								/>
								{selectedNetwork}
							</div>
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</p>
				<p className='text-xs text-text_secondary mb-5'>
					Already have a MultiSig? You can link your existing multisig with a few simple steps
				</p>
				{linkedMultisigs && linkedMultisigs.length > 0 && (
					<div className='max-h-[250px] overflow-y-auto mb-5'>
						{linkedMultisigs.map((item, i) => (
							<>
								<div className='p-2 mb-2 border border-text_placeholder rounded-xl flex justify-between items-center'>
									<AddressComponent
										address={item?.address}
										isMultisig
										showNetworkBadge
										withBadge={false}
										signatories={item?.signatories?.length}
										threshold={item?.threshold}
										network={item?.network}
									/>
									<button
										className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
										onClick={() =>
											setLinkedMultisigs((prev) => {
												const copyArray = [...prev];
												copyArray.splice(i, 1);
												return copyArray;
											})
										}
									>
										<OutlineCloseIcon className='text-primary w-2 h-2' />
									</button>
								</div>
								{item.proxy &&
									typeof item.proxy !== 'string' &&
									item.proxy.map((multiProxy) => (
										<div className='p-2 mb-2 ml-5 border border-text_placeholder rounded-xl flex justify-between items-center'>
											<ProxyAddress
												proxyAddress={multiProxy.address}
												placeholder={getProxyNameMapByAddress(alreadyLinkedProxy)?.[multiProxy.address]}
												name={multiProxy.name}
												handleChangeProxyName={(name) => {
													console.log(name, multiProxy.address);
													const payload = linkedMultisigs.map((lm) =>
														lm.address === item.address
															? {
																	...lm,
																	proxy: (typeof lm.proxy !== 'string' ? lm.proxy : []).map((mp) =>
																		mp.address === multiProxy.address ? { ...mp, name } : mp
																	)
															  }
															: lm
													);
													setLinkedMultisigs(payload);
												}}
											/>
											{multiProxy.linked ? (
												<button
													className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
													onClick={() => {
														const payload = linkedMultisigs.map((lm) =>
															lm.address === item.address
																? {
																		...lm,
																		proxy: (typeof lm.proxy !== 'string' ? lm.proxy : []).map((mp) =>
																			mp.address === multiProxy.address ? { ...mp, linked: false } : mp
																		)
																  }
																: lm
														);
														setLinkedMultisigs(payload);
													}}
												>
													<OutlineCloseIcon className='text-primary w-2 h-2' />
												</button>
											) : alreadyLinkedProxy
													.map((px) => {
														return typeof px === 'string' ? px : px.address;
													})
													.includes(multiProxy.address) ? (
												<span className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs font-semibold'>
													Linked
												</span>
											) : (
												<PrimaryButton
													onClick={() => {
														const payload = linkedMultisigs.map((lm) =>
															lm.address === item.address
																? {
																		...lm,
																		proxy: (typeof lm.proxy !== 'string' ? lm.proxy : []).map((mp) =>
																			mp.address === multiProxy.address ? { ...mp, linked: true } : mp
																		)
																  }
																: lm
														);
														setLinkedMultisigs(payload);
													}}
													secondary
													className='px-3 h-full border-proxy-pink text-proxy-pink'
													size='small'
												>
													Link Proxy
												</PrimaryButton>
											)}
										</div>
									))}
							</>
						))}
					</div>
				)}
				<div className='max-h-[250px] overflow-y-auto'>
					{loading ? (
						<Loader />
					) : multisigs && multisigs.length > 0 ? (
						multisigs
							.filter((multisig) => !linkedMultisigs.some((item) => multisig.address === item.address))
							.map((multisig) => (
								<>
									<div className='p-2 mb-2 border border-text_placeholder rounded-xl flex justify-between items-center'>
										<AddressComponent
											address={multisig?.address}
											isMultisig
											showNetworkBadge
											withBadge={false}
											signatories={multisig?.signatories?.length}
											threshold={multisig?.threshold}
											network={multisig?.network}
										/>
										{!multisigAddresses
											.map(({ address: multiAddress }: { address: string }) => multiAddress)
											.includes(multisig.address) ? (
											<PrimaryButton
												onClick={() =>
													setLinkedMultisigs((prev) => [
														...prev,
														{
															address: multisig.address,
															disabled: false,
															name: multisig.name || DEFAULT_ADDRESS_NAME,
															network: multisig.network,
															proxy: (typeof multisig.proxy !== 'string' ? multisig.proxy : []).map((mp) => ({
																...mp,
																linked: false
															})),
															signatories: multisig.signatories,
															threshold: multisig.threshold
														}
													])
												}
												icon={<LinkIcon />}
												secondary
												className='px-3 h-full'
												size='small'
											>
												Link MultiSig
											</PrimaryButton>
										) : (
											<span className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs font-semibold'>
												Linked
											</span>
										)}
									</div>
									{multisig.proxy &&
										multisig.proxy.length > 0 &&
										(typeof multisig.proxy !== 'string' ? multisig.proxy : []).map((multisigProxy) => (
											<div className='p-2 mb-2 ml-5 border border-proxy-pink rounded-xl flex justify-between items-center'>
												{/* <AddressComponent
													address={multisigProxy?.address}
													isProxy
													showNetworkBadge
													withBadge={false}
													signatories={multisig?.signatories?.length}
													threshold={multisig?.threshold}
													network={multisig?.network}
												/> */}
												<ProxyAddress
													proxyAddress={multisigProxy.address}
													name={multisigProxy.name}
													placeholder={getProxyNameMapByAddress(alreadyLinkedProxy)?.[multisigProxy.address]}
													handleChangeProxyName={(name) => {
														console.log(name, multisigs, multisig.address);
														const payload = multisigs.map((lm) =>
															lm.address === multisig.address
																? {
																		...lm,
																		proxy: (typeof lm.proxy !== 'string' ? lm.proxy : []).map((mp) =>
																			mp.address === multisigProxy.address ? { ...mp, name } : mp
																		)
																  }
																: lm
														);
														setMultisigs(payload);
													}}
												/>
												{alreadyLinkedProxy
													.map((px) => {
														return typeof px === 'string' ? px : px.address;
													})
													.includes(multisigProxy.address) ? (
													<span className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs font-semibold'>
														Linked
													</span>
												) : (
													<PrimaryButton
														onClick={() => {
															setLinkedMultisigs((prev) => [
																...prev,
																{
																	address: multisig.address,
																	disabled: false,
																	name: multisig.name || DEFAULT_ADDRESS_NAME,
																	network: multisig.network,
																	proxy: (typeof multisig.proxy !== 'string' ? multisig.proxy : []).map((mp) =>
																		mp.address === multisigProxy.address ? { ...mp, linked: true } : mp
																	),
																	signatories: multisig.signatories,
																	threshold: multisig.threshold
																}
															]);
														}}
														secondary
														className='px-3 h-full border-proxy-pink text-proxy-pink'
														size='small'
													>
														Link Proxy
													</PrimaryButton>
												)}
											</div>
										))}
								</>
							))
					) : (
						<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>No Onchain MultiSig found in this Network</p>
						</section>
					)}
				</div>
			</div>
			<div className='flex justify-between rounded-xl p-6 bg-bg-main'>
				<div className='flex-1 pr-10'>
					<p className='text-white font-bold text-sm mb-2'>Create MultiSig</p>
					<p className='text-text_secondary text-xs max-w-[100%]'>
						MultiSig is a secure digital wallet that requires one or multiple owners to authorize the transaction.
					</p>
				</div>
				<PrimaryButton
					icon={<CreateMultisigIcon />}
					onClick={() => setOpenCreateMultisigModal(true)}
				>
					Create Multisig
				</PrimaryButton>
			</div>
		</div>
	);
};

export default LinkMultisigStep;
