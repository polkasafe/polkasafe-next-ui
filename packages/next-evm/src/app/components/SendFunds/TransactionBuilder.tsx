// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Interface } from '@ethersproject/abi';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';
import { Dropdown, Form, Input } from 'antd';
import { useEffect, useState } from 'react';

const TransactionBuilder = ({
	className,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setTxnData,
	setToAddress
}: {
	className?: string;
	setTxnData: React.Dispatch<React.SetStateAction<string>>;
	setToAddress: React.Dispatch<React.SetStateAction<string>>;
}) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [abi, setAbi] = useState<string>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [abiJson, setAbiJson] = useState<object[]>([]);
	const [validAbi, setValidAbi] = useState<boolean>(true);
	const [address, setAddress] = useState<string>('');
	const [validAddress, setValidAddress] = useState<boolean>(true);

	const [selectedFunction, setSelectedFunction] = useState<string>('');

	const [selectedFunctionName, setSelectedFunctionName] = useState<string>('');

	const [functionInputs, setFunctionInputs] = useState<{ name: string; type: string }[]>([]);

	const [inputValues, setInputValues] = useState<string[]>([]);

	useEffect(() => {
		if (!address) return;
		if (!isValidWeb3Address(address)) {
			setValidAddress(false);
			return;
		}
		setToAddress(address);
		setValidAddress(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	useEffect(() => {
		try {
			const json = JSON.parse(abi);
			if (typeof json === 'object' && Array.isArray(json)) {
				setAbiJson(json);
				console.log(json);
			}
			setValidAbi(true);
		} catch (err) {
			console.log(err);
			setValidAbi(false);
		}
	}, [abi]);

	useEffect(() => {
		if (!selectedFunction) return;

		try {
			const selectedFunctionJSON = JSON.parse(selectedFunction);
			if (typeof selectedFunctionJSON === 'object' && selectedFunctionJSON.name && selectedFunctionJSON.inputs) {
				const inputs = [...selectedFunctionJSON.inputs].map((item: any) => ({
					name: item.name,
					type: item.type
				}));
				setSelectedFunctionName(selectedFunctionJSON.name);
				setFunctionInputs(inputs);
			}
		} catch (err) {
			console.log(err);
		}
	}, [selectedFunction]);

	const onInputValueChange = (val: string, i: number) => {
		const copyArray = [...inputValues];
		copyArray[i] = val;
		setInputValues(copyArray);
	};

	useEffect(() => {
		if (
			!abi ||
			!selectedFunction ||
			(functionInputs.length !== 0 && inputValues.includes('')) ||
			inputValues.length !== functionInputs.length
		)
			return;

		try {
			const contractInterface = new Interface(abi);
			console.log(inputValues);
			const data = contractInterface.encodeFunctionData(selectedFunctionName, [...inputValues]);
			setTxnData(data);
		} catch (err) {
			console.log(err);
			setTxnData('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [abi, functionInputs, inputValues, selectedFunctionName]);

	return (
		<div className={className}>
			<section className='w-[500px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Address*</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='address'
							rules={[{ message: 'Required', required: true }]}
							help={(!address && 'Address is Required') || (!validAddress && 'Please add a valid Address')}
							validateStatus={address && validAddress ? 'success' : 'error'}
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='address'
									onChange={(a) => setAddress(a.target.value)}
									placeholder='Enter Address'
									value={address}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-[500px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Enter ABI*</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='abi'
							rules={[{ message: 'Required', required: true }]}
							help={(!abi && 'ABI is Required') || (!validAbi && 'Please enter a valid ABI')}
							validateStatus={abi && validAbi ? 'success' : 'error'}
						>
							<div className='flex items-center'>
								<Input.TextArea
									id='abi'
									rows={6}
									onChange={(a) => setAbi(a.target.value)}
									placeholder='Enter ABI'
									className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-10'
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			{abiJson && abiJson.length > 0 && (
				<section className='mt-[15px] w-[500px]'>
					<label className='text-primary font-normal text-xs block mb-[5px]'>Category*</label>
					<Form.Item
						name='category'
						rules={[{ message: 'Required', required: true }]}
						className='border-0 outline-0 my-0 p-0'
					>
						<Dropdown
							trigger={['click']}
							className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
							menu={{
								items: abiJson
									.filter((item: any) => item.type !== 'constructor' && item.stateMutability !== 'view')
									.map((item: any) => ({
										key: JSON.stringify(item),
										label: <span className='text-white'>{item.name}</span>
									})),
								onClick: (e) => setSelectedFunction(e.key)
							}}
						>
							<div className='flex justify-between items-center text-white'>
								{selectedFunction && JSON.parse(selectedFunction).name}
								<CircleArrowDownIcon className='text-primary' />
							</div>
						</Dropdown>
					</Form.Item>
				</section>
			)}
			{functionInputs &&
				functionInputs.length > 0 &&
				functionInputs.map((item, i) => (
					<section
						key={item.name}
						className='mt-[15px] w-[500px]'
					>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>{item.name}*</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									className='border-0 outline-0 my-0 p-0'
									rules={[{ message: 'Required', required: true }]}
								>
									<div className='flex items-center h-[50px]'>
										<Input
											onChange={(a) => onInputValueChange(a.target.value, i)}
											placeholder={item.type}
											value={inputValues[i]}
											className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20'
										/>
									</div>
								</Form.Item>
							</article>
						</div>
					</section>
				))}
		</div>
	);
};

export default TransactionBuilder;
