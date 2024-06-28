import AddressComponent from '@next-common/ui-components/AddressComponent';
import { Divider } from 'antd';
import React from 'react';

const SignatoriesList = ({
	className,
	signatories,
	network
}: {
	className?: string;
	signatories: string[];
	network: string;
}) => {
	return (
		<div>
			<div className='flex justify-between flex-row w-full mb-2'>
				<h2 className='text-base font-bold text-white'>Signatories</h2>
			</div>
			<div
				className={`${className} bg-bg-main flex flex-col justify-around rounded-lg py-5 shadow-lg h-[17rem] scale-90 w-[111%] origin-top-left`}
			>
				<div className='flex flex-col px-5 h-full overflow-auto'>
					{signatories.map((item, i) => (
						<>
							<AddressComponent
								iconSize={25}
								address={item}
								network={network}
								fullAddress
							/>
							{signatories.length - 1 !== i ? <Divider className='bg-text_secondary mt-2 mb-3' /> : null}
						</>
					))}
				</div>
			</div>
		</div>
	);
};

export default SignatoriesList;
