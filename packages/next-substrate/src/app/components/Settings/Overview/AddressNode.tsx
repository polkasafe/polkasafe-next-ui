import AddressComponent from '@next-common/ui-components/AddressComponent';
import React from 'react';
import { Handle, Position } from 'reactflow';

const AddressNode = ({ data }: { data: { address: string; network: string; handle: 'right' | 'left' | 'both' } }) => {
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
			<AddressComponent
				network={data.network}
				address={data.address}
			/>
		</>
	);
};

export default AddressNode;
