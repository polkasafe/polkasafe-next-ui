// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Spin } from 'antd';

enum Size {
	SMALL = 'small',
	DEFAULT = 'default',
	LARGE = 'large'
}

interface ILoderProps {
	size?: Size;
}

const Loader: React.FC<ILoderProps> = ({ size = Size.DEFAULT }: ILoderProps) => {
	return (
		<div className='flex items-center justify-center'>
			<Spin size={size} />
		</div>
	);
};

export default Loader;
