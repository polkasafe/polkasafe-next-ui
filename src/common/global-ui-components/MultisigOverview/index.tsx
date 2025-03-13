// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import ReactFlow, { Controls, Background, NodeTypes, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

import React, { useState } from 'react';
import { IMultisig } from '@common/types/substrate';
import { Dropdown } from '@common/global-ui-components/Dropdown';
import Address from '@common/global-ui-components/Address';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import AddressNode from './AddressNode';

const nodeTypes: NodeTypes = {
	custom: AddressNode
};

const MultisigOverview = ({ multisigs }: { multisigs: IMultisig[] }) => {
	const [selectedMultisig, setSelectedMultisig] = useState<IMultisig>(multisigs[0]);

	const multisigOptions = multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<div className='origin-top-left'>
				<Address
					isMultisig
					showNetworkBadge
					network={item.network}
					withBadge={false}
					address={item.address}
				/>
			</div>
		)
	}));

	const nodes = selectedMultisig.signatories.map((a, i) => {
		return {
			data: { address: a, handle: 'right', network: selectedMultisig.network, isMultisig: false, isProxy: false },
			id: a,
			position: { x: 0, y: i * 70 },
			type: 'custom'
		};
	});

	nodes.push({
		data: {
			address: selectedMultisig.address,
			handle: 'both',
			network: selectedMultisig.network,
			isMultisig: true,
			isProxy: false
		},
		id: selectedMultisig.address,
		position: { x: 300, y: 0 },
		type: 'custom'
	});

	const edges = selectedMultisig.signatories.map((a) => ({
		animated: true,
		id: `${a}-${selectedMultisig.address}`,
		markerEnd: {
			height: 20,
			type: MarkerType.Arrow,
			width: 20
		},
		source: a,
		sourceHandle: 'right',
		target: selectedMultisig.address,
		targetHandle: 'left'
	}));

	if (selectedMultisig.proxy) {
		selectedMultisig.proxy.forEach((item, i) => {
			nodes.push({
				data: {
					address: item.address,
					handle: 'left',
					network: selectedMultisig.network,
					isMultisig: false,
					isProxy: true
				},
				id: item.address,
				position: { x: 600, y: i * 70 },
				type: 'custom'
			});

			edges.push({
				animated: true,
				id: `${selectedMultisig.address}-${item.address}`,
				markerEnd: {
					height: 20,
					type: MarkerType.Arrow,
					width: 20
				},
				source: selectedMultisig.address,
				sourceHandle: 'right',
				target: item.address,
				targetHandle: 'left'
			});
		});
	}

	return (
		<div className='flex-1 flex flex-col'>
			{multisigs?.length === 0 ? (
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>
						Looks Like You Don&apos;t have a Multisig. Please Create One to use our Features.
					</p>
				</section>
			) : (
				<div className='flex-1 flex flex-col h-full px-4'>
					<div className='flex justify-start mb-4'>
						<Dropdown
							trigger={['click']}
							className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer min-w-[260px]'
							menu={{
								items: multisigOptions,
								onClick: (e) => {
									setSelectedMultisig(JSON.parse(e.key) as IMultisig);
								}
							}}
						>
							<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
								<Address
									isMultisig
									showNetworkBadge
									network={selectedMultisig?.network}
									withBadge={false}
									address={selectedMultisig?.address}
								/>
								<CircleArrowDownIcon className='text-primary' />
							</div>
						</Dropdown>
					</div>
					<div className='w-full flex-1'>
						<ReactFlow
							fitView
							edges={edges}
							nodes={nodes}
							nodeTypes={nodeTypes}
						>
							<Background />
							<Controls />
						</ReactFlow>
					</div>
				</div>
			)}
		</div>
	);
};

export default MultisigOverview;
