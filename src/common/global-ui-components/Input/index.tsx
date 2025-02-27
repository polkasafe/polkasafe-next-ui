/* eslint-disable react/jsx-props-no-spreading */

import { Input as AntDInput, InputProps } from 'antd';
import { twMerge } from 'tailwind-merge';

interface IInputProps extends InputProps {
	className?: string;
}

const Input = ({ className, ...props }: IInputProps) => {
	return (
		<AntDInput
			{...props}
			className={twMerge(
				'text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white',
				className
			)}
		/>
	);
};

export default Input;
