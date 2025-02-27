/* eslint-disable sonarjs/no-duplicate-string */
import Address from '@common/global-ui-components/Address';
import Collapse from '@common/global-ui-components/Collapse';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { IMultisig, IProxy } from '@common/types/substrate';
import { Dispatch, SetStateAction } from 'react';
import { twMerge } from 'tailwind-merge';

export function getMultisigOptions({
	multisigs,
	setSelectedMultisig,
	selectedMultisig,
	onSelect
}: {
	multisigs: Array<IMultisig>;
	setSelectedMultisig: Dispatch<SetStateAction<string>>;
	selectedMultisig: string;
	onSelect: (selectedMultisigId: string) => void;
}) {
	const multisigOptions: any[] = [];

	multisigs?.forEach((item) => {
		const id = `${item.address}_${item.network}_${item.name}`;
		const isMultisigSelected = selectedMultisig === id;
		multisigOptions.push({
			key: JSON.stringify({ ...item }),
			label:
				item.proxy && item.proxy.length > 0 ? (
					<div
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<Collapse
							plain
							className={twMerge('border-none rounded-xl', isMultisigSelected && 'selected')}
							expandIconPosition='end'
							collapsible='icon'
							defaultActiveKey={[item.address]}
							items={[
								{
									key: item.address,
									label: (
										<div
											className='flex gap-x-3 items-center'
											onClick={() => {
												setSelectedMultisig(id);
												onSelect(id);
											}}
										>
											<div
												className={twMerge(
													'h-[16px] w-[16px] p-1 rounded-full border  border-text-secondary',
													isMultisigSelected && 'border-primary'
												)}
											>
												<div
													className={twMerge(
														'w-full h-full rounded-full bg-transparent',
														isMultisigSelected && 'bg-primary'
													)}
												/>
											</div>
											<Address
												isMultisig
												showNetworkBadge
												network={item.network}
												withBadge={false}
												address={item.address}
												name={item.name}
											/>
										</div>
									),
									children: item.proxy && (
										<div
											className='flex flex-col gap-y-3 p-4 pl-10 relative'
											key={id}
										>
											{item.proxy.map((p: IProxy, i: number) => {
												const proxyId = `${item.address}_${item.network}_${item.name}_${p.address}_${p.name}`;
												const proxySelected = selectedMultisig === proxyId;
												return (
													<div
														key={proxyId}
														onClick={() => {
															setSelectedMultisig(proxyId);
															onSelect(proxyId);
														}}
														className={twMerge(
															'p-2 rounded-xl flex gap-x-3 items-center relative',
															proxySelected && 'bg-highlight'
														)}
													>
														<div
															className={`absolute w-[16px] ${i === 0 ? 'h-[56px] top-[-28px]' : 'h-[76px] top-[-48px]'} rounded-es-[11px] border-b-[2px] border-l-[2px] border-text-secondary left-[-17px]`}
														/>
														<div
															className={twMerge(
																'h-[16px] w-[16px] p-1 rounded-full border border-text-secondary',
																proxySelected && 'border-primary'
															)}
														>
															<div
																className={twMerge(
																	'w-full h-full rounded-full bg-transparent',
																	proxySelected && 'bg-primary'
																)}
															/>
														</div>
														<Address
															address={p.address}
															network={item.network}
															name={p.name}
															isProxy
														/>
													</div>
												);
											})}
										</div>
									)
								}
							]}
							expandIcon={({ isActive }) => (
								<CircleArrowDownIcon className={twMerge('text-primary text-lg', isActive && 'rotate-[180deg]')} />
							)}
						/>
					</div>
				) : (
					<div
						className={twMerge('flex gap-x-3 items-center px-4 py-3 rounded-xl', isMultisigSelected && 'bg-highlight')}
						onClick={() => {
							setSelectedMultisig(id);
							onSelect(id);
						}}
					>
						<div
							className={twMerge(
								'h-[16px] w-[16px] p-1 rounded-full border border-text-secondary',
								isMultisigSelected && 'border-primary'
							)}
						>
							<div
								className={twMerge('w-full h-full rounded-full bg-transparent', isMultisigSelected && 'bg-primary')}
							/>
						</div>
						<Address
							isMultisig
							showNetworkBadge
							network={item.network}
							withBadge={false}
							address={item.address}
						/>
					</div>
				)
		});
	});

	return multisigOptions;
}
