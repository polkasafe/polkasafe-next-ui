import { Form, Input } from 'antd';
import Image from 'next/image';
import React from 'react';
import emptyImage from '@next-common/assets/icons/empty-image.png';

const OrgNameAndImageStep = ({
	orgName,
	setOrgName,
	orgDesc,
	setOrgDesc
}: {
	orgName: string;
	setOrgName: React.Dispatch<React.SetStateAction<string>>;
	orgDesc: string;
	setOrgDesc: React.Dispatch<React.SetStateAction<string>>;
}) => {
	console.log('org', orgName, orgDesc);
	return (
		<Form className='rounded-xl p-6 bg-bg-main flex flex-col gap-y-5'>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='name'
				>
					Organisation Image (Optional)
				</label>
				<div>
					<Image
						src={emptyImage}
						alt='empty profile image'
					/>
				</div>
			</div>

			<div className='flex flex-col gap-y-3'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='name'
				>
					Organisation Name*
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
						onChange={(e) => setOrgName(e.target.value)}
						value={orgName}
						defaultValue={orgName}
					/>
				</Form.Item>
			</div>
			<div className='flex flex-col gap-y-3 mb-5'>
				<label
					className='text-primary text-xs leading-[13px] font-normal'
					htmlFor='desc'
				>
					Organisation Desc (Optional)
				</label>
				<Form.Item
					name='desc'
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder='Add a description to your organisation'
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						id='desc'
						onChange={(e) => setOrgDesc(e.target.value)}
						value={orgDesc}
						defaultValue={orgDesc}
					/>
				</Form.Item>
			</div>
		</Form>
	);
};

export default OrgNameAndImageStep;
