import { Empty as AntdEmpty } from 'antd';

export const Empty = ({ description }: { description: string }) => {
	return (
		<AntdEmpty
			className='text-white'
			image={AntdEmpty.PRESENTED_IMAGE_SIMPLE}
			description={description}
		/>
	);
};
