import { Dropdown, Form, Input, InputNumber } from 'antd';
import emptyImage from '@assets/icons/empty-image.png';
import React from 'react';
import Image from 'next/image';
import { IMultisig, IOrganisation } from '@common/types/substrate';
import Address from '@common/global-ui-components/Address';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { CurrencyFlag } from '@common/global-ui-components/SelectCurrency';
import { currencies, currencyProperties } from '@common/constants/currencyConstants';

const PaymentDetails = ({
	selectedOrg,
	setSelectedOrg,
	title,
	setTitle,
	multisig,
	setMultisig,
	amount,
	setAmount,
	note,
	setNote,
	organisations
}: {
	selectedOrg: IOrganisation;
	setSelectedOrg: React.Dispatch<React.SetStateAction<IOrganisation>>;
	title: string;
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	multisig: IMultisig;
	setMultisig: React.Dispatch<React.SetStateAction<IMultisig>>;
	amount: string;
	setAmount: React.Dispatch<React.SetStateAction<string>>;
	note: string;
	setNote: React.Dispatch<React.SetStateAction<string>>;
	organisations: IOrganisation[];
}) => {
	const orgOptions = organisations?.map((item) => ({
		key: JSON.stringify(item),
		label: <span className='text-white truncate capitalize'>{item.name}</span>
	}));

	const multisigOptions = selectedOrg?.multisigs?.map((item) => ({
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
		<Form className='flex flex-col gap-y-5'>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='name'
				>
					Select Existing Organisation
				</label>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px]'
					menu={{
						items: orgOptions,
						onClick: (e) => {
							const org = JSON.parse(e.key) as IOrganisation;
							if (org && org?.id) {
								setSelectedOrg(org);
							}
						}
					}}
				>
					<div className='flex justify-between items-center text-white gap-x-2'>
						<div className='flex items-center gap-x-3'>
							<Image
								width={30}
								height={30}
								className='rounded-full h-[30px] w-[30px]'
								src={selectedOrg?.image || emptyImage}
								alt='empty profile image'
							/>
							<div className='flex flex-col gap-y-[1px]'>
								<span className='text-sm text-white capitalize truncate max-w-[100px]'>{selectedOrg?.name}</span>
								<span className='text-xs text-text-secondary'>{selectedOrg?.multisigs?.length} Multisigs</span>
							</div>
						</div>
						<CircleArrowDownIcon className='text-white' />
					</div>
				</Dropdown>
			</div>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='name'
				>
					Invoice Title*
				</label>
				<Form.Item
					name='name'
					rules={[
						{
							message: 'Required',
							required: true
						}
					]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder='Add a name'
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						id='name'
						onChange={(e) => setTitle(e.target.value)}
						value={title}
						defaultValue={title}
					/>
				</Form.Item>
			</div>
			<div className='flex flex-col gap-y-3'>
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
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-2 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white w-full'
						id='tax-number'
						onChange={(val) => setAmount(String(val))}
						value={amount}
						defaultValue={amount}
					/>
					<div className='absolute right-0 bottom-0 top-0 flex cursor-pointer items-center justify-center pr-5 text-white text-lg'>
						<CurrencyFlag
							className='mr-2'
							src={currencyProperties[currencies.UNITED_STATES_DOLLAR]?.logo}
						/>
						<span>{currencyProperties[currencies.UNITED_STATES_DOLLAR]?.symbol}</span>
					</div>
				</Form.Item>
			</div>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='note'
				>
					Note
				</label>
				<Form.Item
					name='note'
					rules={[
						{
							message: 'Required',
							required: true
						}
					]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input.TextArea
						placeholder='Note'
						className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none'
						id='note'
						rows={4}
						value={note}
						defaultValue={note}
						onChange={(e) => setNote(e.target.value)}
					/>
				</Form.Item>
			</div>
		</Form>
	);
};

export default PaymentDetails;
