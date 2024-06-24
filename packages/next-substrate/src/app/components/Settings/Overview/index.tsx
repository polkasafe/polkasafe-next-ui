// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import ReactFlow, { Controls, Background, NodeTypes, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

import React, { useEffect, useState } from 'react';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';

import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { networks } from '@next-common/global/networkConstants';
import { IMultisigAddress } from '@next-common/types';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { Dropdown } from 'antd';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import AddressNode from './AddressNode';

const nodeTypes: NodeTypes = {
	custom: AddressNode
};

const MultisigOverview = () => {
	const { activeMultisig, selectedProxy } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const activeMultisigData = activeMultisig
		? activeOrg?.multisigs.find(
				(item) => item.address === activeMultisig || checkMultisigWithProxy(item.proxy, activeMultisig)
		  )
		: undefined;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [network, setNetwork] = useState<string>(
		activeMultisigData?.network || activeOrg?.multisigs?.[0]?.network || networks.POLKADOT
	);
	const [selectedMultisig, setSelectedMultisig] = useState<IMultisigAddress>(
		activeMultisigData || activeOrg?.multisigs?.[0]
	);

	useEffect(() => {
		if (!activeOrg || !activeOrg.multisigs) return;

		if (activeMultisig) {
			const m = activeOrg?.multisigs.find((item) => item.address === activeMultisig);
			setSelectedMultisig(m);
			return;
		}
		setSelectedMultisig(activeOrg?.multisigs?.[0]);
	}, [activeMultisig, activeOrg]);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<div className='scale-90 origin-top-left'>
				<AddressComponent
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
			data: { address: a, handle: 'right', network },
			id: a,
			position: { x: 0, y: i * 70 },
			type: 'custom'
		};
	});

	nodes.push({
		data: { address: selectedMultisig.address, handle: 'both', network },
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
		nodes.push({
			data: { address: selectedProxy, handle: 'left', network },
			id: selectedProxy,
			position: { x: 600, y: 0 },
			type: 'custom'
		});

		edges.push({
			animated: true,
			id: `${selectedMultisig.address}-${selectedMultisig.proxy}`,
			markerEnd: {
				height: 20,
				type: MarkerType.Arrow,
				width: 20
			},
			source: selectedMultisig.address,
			sourceHandle: 'right',
			target: selectedProxy,
			targetHandle: 'left'
		});
	}

	return (
		<div className='flex-1 flex flex-col'>
			{!activeOrg || !activeOrg?.multisigs || activeOrg?.multisigs?.length === 0 ? (
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>
						Looks Like You Don&apos;t have a Multisig. Please Create One to use our Features.
					</p>
				</section>
			) : (
				<>
					<h2 className='font-bold text-xl leading-[22px] text-white mb-6'>Multisig Overview</h2>
					<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden flex-1 flex flex-col'>
						<div className='flex justify-start mb-4'>
							<Dropdown
								trigger={['click']}
								className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer min-w-[260px]'
								menu={{
									items: multisigOptions,
									onClick: (e) => {
										setSelectedMultisig(JSON.parse(e.key) as IMultisigAddress);
										setNetwork(JSON.parse(e.key)?.network);
									}
								}}
							>
								<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
									<AddressComponent
										isMultisig
										showNetworkBadge
										network={network}
										withBadge={false}
										address={selectedMultisig?.address}
									/>
									<CircleArrowDownIcon className='text-primary' />
								</div>
							</Dropdown>
						</div>
						<div className='flex-1'>
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
				</>
			)}
		</div>
	);
};

export default MultisigOverview;
