'use client';

import { ENetwork } from '@common/enum/substrate';
import Address from '@common/global-ui-components/Address';
import Button from '@common/global-ui-components/Button';
import Collapse from '@common/global-ui-components/Collapse';
import { SelectNetwork } from '@common/global-ui-components/SelectNetwork';
import { ILinkMultisig, IMultisig } from '@common/types/substrate';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { Divider } from 'antd';
import { Empty } from '@common/global-ui-components/Empty';
import { useNotification } from '@common/utils/notification';
import { useState } from 'react';
import { LinkIcon, UnlinkIcon } from '@common/global-ui-components/Icons';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { twMerge } from 'tailwind-merge';
// use availableSignatories to populate the select options
export const LinkMultisig = ({
	networks,
	linkedMultisig,
	availableMultisig,
	onSubmit,
	onRemoveSubmit,
	fetchMultisig,
	className
}: ILinkMultisig) => {
	const [loading, setLoading] = useState(false);
	const [selectedNetwork, setSelectedNetwork] = useState<ENetwork>(ENetwork.ROOT);
	const notification = useNotification();
	const handleSubmit = async (values: { multisig: IMultisig }) => {
		try {
			const { multisig } = values;
			if (!multisig) {
				notification({ ...ERROR_MESSAGES.LINKED_MULTISIG_FAILED });
				return;
			}
			setLoading(true);
			await onSubmit?.(multisig);
		} catch (e) {
			notification({ ...ERROR_MESSAGES.LINKED_MULTISIG_FAILED, description: e instanceof Error ? e.message : String(e) });
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveSubmit = async (values: { multisig: IMultisig }) => {
		try {
			const { multisig } = values;
			if (!multisig) {
				notification({ ...ERROR_MESSAGES.LINKED_MULTISIG_FAILED });
				return;
			}
			setLoading(true);
			await onRemoveSubmit?.(multisig);
		} catch (e) {
			notification({ ...ERROR_MESSAGES.LINKED_MULTISIG_FAILED, description: e instanceof Error ? e.message : String(e) });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={twMerge('rounded-xl p-6 bg-bg-main', className)}>
			<div className='w-full h-full'>
				<p className='text-base font-bold mb-2 text-white flex justify-between w-full items-center'>
					Link MultiSig(s)
					<SelectNetwork
						networks={networks}
						onChange={async (network) => {
							setLoading(true);
							setSelectedNetwork(network);
							await fetchMultisig(network);
							setLoading(false);
						}}
						selectedNetwork={selectedNetwork}
						fetchOnMount={availableMultisig.length === 0 && linkedMultisig.length === 0}
					/>
				</p>
				<p className='text-sm text-text-secondary mb-4'>
					Already have a MultiSig? You can link your existing multisigs with a few simple steps
				</p>

				{/* {Boolean(linkedMultisig.length) && <Typography className='text-text-secondary' variant={ETypographyVariants.h3}>Linked Multisig</Typography>} */}

				{linkedMultisig && linkedMultisig.length > 0 && (
					<>
						<div className='flex flex-col gap-y-3 mb-4 max-h-80 overflow-y-auto px-3'>
							{linkedMultisig.map((multisig) =>
								multisig.proxy && multisig.proxy.length > 0 ? (
									<Collapse
										className='border-none rounded-xl'
										items={[
											{
												key: multisig.address,
												label: (
													<Address
														address={multisig.address}
														name={multisig.name}
														network={multisig.network}
														isMultisig
														withBadge={false}
														showNetworkBadge
														signatories={multisig.signatories.length}
														threshold={multisig.threshold}
														allowEdit={false}
													/>
												),
												children: multisig.proxy && (
													<div className='flex flex-col gap-y-3 p-4 pl-12 relative'>
														{multisig.proxy.map((item) => (
															<div className='py-3 px-4 rounded-xl border border-text-disabled flex justify-between relative'>
																<div className='absolute w-[24px] h-[50px] rounded-es-[11px] border-b-[2px] border-l-[2px] border-primary left-[-25px] top-[-16px]' />
																<Address
																	address={item.address}
																	network={multisig.network}
																	name={item.name}
																	isProxy
																	withBadge={false}
																	showNetworkBadge
																	allowEdit={false}
																/>
																<Button
																	icon={<UnlinkIcon className='text-white' />}
																	className='bg-bg-secondary border-none text-white'
																	onClick={() => handleRemoveSubmit({ multisig })}
																>
																	Unlink
																</Button>
															</div>
														))}
													</div>
												),
												extra: (
													<Button
														icon={<UnlinkIcon className='text-white' />}
														className='bg-bg-secondary border-none text-white'
														onClick={() => handleRemoveSubmit({ multisig })}
													>
														Unlink Multisig
													</Button>
												)
											}
										]}
									/>
								) : (
									<div className='border border-primary rounded-xl py-3 px-4 flex items-center justify-between'>
										<Address
											address={multisig.address}
											name={multisig.name}
											network={multisig.network}
											isMultisig
											withBadge={false}
											showNetworkBadge
											signatories={multisig.signatories.length}
											threshold={multisig.threshold}
											allowEdit={false}
										/>
										<Button
											icon={<UnlinkIcon className='text-white' />}
											className='bg-bg-secondary border-none text-white'
											onClick={() => handleRemoveSubmit({ multisig })}
										>
											Unlink Multisig
										</Button>
									</div>
								)
							)}
						</div>
						<Divider
							variant='solid'
							className='border-text-disabled'
						/>
					</>
				)}

				<div className='flex flex-col gap-y-3 max-h-80 overflow-y-auto px-3'>
					{loading ? (
						<LoadingLottie
							message={`Fetching Multisigs of ${selectedNetwork}`}
							width={150}
						/>
					) : (
						<>
							{availableMultisig.length === 0 &&
								linkedMultisig.filter((item) => item.network === selectedNetwork).length === 0 && (
									<Empty description='No onChain Multisig available on this network' />
								)}
							{availableMultisig.length > 0 &&
								availableMultisig.map((multisig) =>
									multisig.proxy && multisig.proxy.length > 0 ? (
										<Collapse
											className='border-none rounded-xl'
											items={[
												{
													key: multisig.address,
													label: (
														<Address
															address={multisig.address}
															name={multisig.name}
															network={multisig.network}
															isMultisig
															withBadge={false}
															showNetworkBadge
															signatories={multisig.signatories.length}
															threshold={multisig.threshold}
															allowEdit={false}
														/>
													),
													children: multisig.proxy && (
														<div className='flex flex-col gap-y-3 p-4 pl-12 relative'>
															{[...multisig.proxy, ...multisig.proxy].map((item, i) => (
																<div className='py-3 px-4 rounded-xl border border-text-disabled flex justify-between relative'>
																	<div
																		className={`absolute w-[24px] h-[74px] ${i === 0 ? 'h-[74px] top-[-44px]' : 'h-[90px] top-[-60px]'} rounded-es-[11px] border-b-[2px] border-l-[2px] border-primary left-[-25px]`}
																	/>
																	<Address
																		address={item.address}
																		network={multisig.network}
																		name={item.name}
																		isProxy
																		showNetworkBadge
																		allowEdit={false}
																	/>
																	<Button
																		icon={<LinkIcon className='text-label' />}
																		className='bg-highlight border-none text-label'
																		onClick={() => handleSubmit({ multisig })}
																	>
																		Link
																	</Button>
																</div>
															))}
														</div>
													),
													extra: (
														<Button
															icon={<LinkIcon className='text-label' />}
															className='bg-highlight border-none text-label'
															onClick={() => handleSubmit({ multisig })}
														>
															Link Multisig
														</Button>
													)
												}
											]}
										/>
									) : (
										<div className='border border-primary rounded-xl py-3 px-4 flex items-center justify-between'>
											<Address
												address={multisig.address}
												name={multisig.name}
												network={multisig.network}
												isMultisig
												withBadge={false}
												showNetworkBadge
												signatories={multisig.signatories.length}
												threshold={multisig.threshold}
												allowEdit={false}
											/>
											<Button
												icon={<LinkIcon className='text-label' />}
												className='bg-highlight border-none text-label'
												onClick={() => handleSubmit({ multisig })}
											>
												Link Multisig
											</Button>
										</div>
									)
								)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};
