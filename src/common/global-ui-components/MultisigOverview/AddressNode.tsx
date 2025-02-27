import { ENetwork } from '@common/enum/substrate';
import Address from '@common/global-ui-components/Address';
import React from 'react';
import { Handle, Position } from 'reactflow';

const AddressNode = ({ data }: { data: { address: string; network: ENetwork; handle: 'right' | 'left' | 'both', isMultisig: boolean, isProxy: boolean} }) => {
	return (
		<>
			{(data.handle === 'both' || data.handle === 'right') && (
				<Handle
					id='right'
					type='source'
					position={Position.Right}
				/>
			)}
			{(data.handle === 'both' || data.handle === 'left') && (
				<Handle
					id='left'
					type='target'
					position={Position.Left}
				/>
			)}
			<Address
				network={data.network}
				address={data.address}
                isMultisig={data.isMultisig}
                isProxy={data.isProxy}
                withBadge={data.isProxy}

			/>
		</>
	);
};

export default AddressNode;
