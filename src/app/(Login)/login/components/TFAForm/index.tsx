// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';

interface ITFAFormProps {
	onSubmit: (authCode: number) => void;
	onCancel: () => void;
	loginDisabled: boolean;
	loading: boolean;
}

export function TFAForm({ onSubmit, onCancel, loginDisabled, loading }: ITFAFormProps) {
	const [authCode, setAuthCode] = useState<number>();
	return (
		<>
			<h2 className='text-lg text-white font-semibold'>Two Factor Authentication</h2>
			<Typography
				variant={ETypographyVariants.p}
				className='text-sm text-white'
			>
				Please open the two-step verification app or extension and input the authentication code for your Polkassembly
				account.
			</Typography>

			<div className='mt-5'>
				<label
					htmlFor='authCode'
					className='text-primary font-normal text-xs block mb-1'
				>
					Auth Code
				</label>
				<Form.Item
					name='authcode'
					rules={[
						{
							message: 'Required',
							required: true
						}
					]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder='######'
						className='text-sm font-normal m-0 border-0 outline-0 p-3 placeholder:text-text_placeholder bg-bg-secondary rounded-lg text-white'
						id='authCode'
						onChange={(e) => setAuthCode(Number(e.target.value))}
						value={authCode}
						disabled={loading}
						maxLength={6}
						type='number'
					/>
				</Form.Item>
				<Button
					disabled={!authCode || Number.isNaN(authCode)}
					loading={loading}
					onClick={() => onSubmit(authCode || 0)}
					className={`mt-6 text-sm border-none outline-none flex items-center justify-center ${
						loginDisabled ? 'bg-highlight text-text_secondary' : 'bg-primary text-white'
					} max-w-[320px] w-full`}
				>
					Login
				</Button>
			</div>
			<Button
				icon={<ArrowLeftOutlined />}
				disabled={loading}
				onClick={onCancel}
				className='mt-6 text-sm border-none outline-none flex items-center justify-center text-primary p-0'
			>
				Go Back
			</Button>
		</>
	);
}
