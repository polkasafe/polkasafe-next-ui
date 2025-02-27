import Address from '@common/global-ui-components/Address';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { IMultisig } from '@common/types/substrate';
import { Dropdown, Form, InputNumber } from 'antd';
import React from 'react';

const PaymentStep = ({
	receiverAddress,
	amount,
	multisig,
	setMultisig,
	setAmount,
	requestedAmount,
	multisigs
}: {
	receiverAddress: string;
	multisigs: IMultisig[];
	multisig: IMultisig;
	setMultisig: React.Dispatch<React.SetStateAction<IMultisig>>;
	amount: string;
	setAmount: React.Dispatch<React.SetStateAction<string>>;
	requestedAmount: string;
}) => {
	const multisigOptions = multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<Address
				isMultisig
				showNetworkBadge
				network={item.network}
				withBadge={false}
				address={item.address}
			/>
		)
	}));

	return (
		<div>
			<div className='rounded-xl bg-bg-secondary p-2 mb-3'>
				<p className='font-bold text-sm mb-2 text-white'>Receiver Details:</p>
				<div className='border border-text_placeholder rounded-xl p-3 flex items-center justify-between'>
					<Address
						address={receiverAddress}
						// network={network}
						isMultisig
						withBadge={false}
					/>
					<div className='rounded-lg bg-bg-main px-2 py-1 flex justify-between items-center text-white'>
						{requestedAmount} USD
					</div>
				</div>
			</div>
			<div className='rounded-xl bg-bg-secondary p-2'>
				<p className='font-bold text-sm mb-2 text-white'>Enter Details to Pay Receiver:</p>
				<Form>
					<div className='flex flex-col gap-y-3 mb-3'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='multisig'
						>
							Select Wallet to receive Payment*
						</label>
						<Form.Item
							name='multisig'
							className='border-0 outline-0 my-0 p-0'
						>
							<Dropdown
								trigger={['click']}
								className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px]'
								menu={{
									items: multisigOptions,
									onClick: (e) => {
										const multi = JSON.parse(e.key);
										setMultisig(multi);
									}
								}}
							>
								<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
									<Address
										isMultisig
										showNetworkBadge
										network={multisig.network}
										withBadge={false}
										address={multisig.address}
									/>
									<CircleArrowDownIcon className='text-primary' />
								</div>
							</Dropdown>
						</Form.Item>
					</div>
					<div className='flex flex-col gap-y-3'>
						<label
							className='text-primary text-xs leading-[13px] font-normal'
							htmlFor='tax-number'
						>
							Enter Amount*
						</label>
						<Form.Item
							name='tax-number'
							rules={[
								{
									message: 'Required',
									required: true
								}
							]}
							className='border-0 outline-0 my-0 p-0'
						>
							<InputNumber
								// placeholder='Amount'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-2 placeholder:text-[#505050] bg-bg-main rounded-lg text-white w-full'
								id='tax-number'
								onChange={(val) => setAmount(String(val))}
								value={amount}
								defaultValue={amount}
							/>
						</Form.Item>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default PaymentStep;
