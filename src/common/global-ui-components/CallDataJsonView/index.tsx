import { decodeCallData } from '@common/utils/decodeCallData';
import React from 'react';
import ReactJson from 'react-json-view';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CallDataJsonView = ({ callData, className, api }: { callData: string; className?: string; api: any }) => {
	const decoded = decodeCallData(callData, api);

	const extrinsicCall = decoded.data?.extrinsicCall?.toJSON();

	return (
		<div className='p-2 w-full bg-bg-secondary rounded-xl'>
			<ReactJson
				src={extrinsicCall || {}}
				collapseStringsAfterLength={15}
				theme='bright'
				style={{ background: 'transparent' }}
			/>
		</div>
	);
};

export default CallDataJsonView;
