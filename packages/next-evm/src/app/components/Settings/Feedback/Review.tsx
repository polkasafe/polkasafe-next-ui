// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React from 'react';
import CancelBtn from '@next-evm/app/components/Settings/CancelBtn';
import ModalBtn from '@next-evm/app/components/Settings/ModalBtn';

const Review = ({
	review,
	setReview,
	onCancel
}: {
	review: string;
	setReview: React.Dispatch<React.SetStateAction<string>>;
	onCancel: () => void;
}) => {
	return (
		<Form className='my-0'>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-white font-normal text-sm leading-[15px]'
					htmlFor='review'
				>
					Do you have any thoughts you&apos;d like to share?
				</label>
				<Form.Item
					name='review'
					rules={[]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input.TextArea
						placeholder='Share Feedback...'
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						id='review'
						value={review}
						onChange={(e) => setReview(e.target.value)}
						rows={5}
					/>
				</Form.Item>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<ModalBtn
					onClick={onCancel}
					title='Share'
				/>
			</div>
		</Form>
	);
};

export default Review;
