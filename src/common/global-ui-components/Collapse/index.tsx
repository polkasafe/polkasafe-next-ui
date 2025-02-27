/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-props-no-spreading */
import { Collapse as AntdCollapase, CollapseProps } from 'antd';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { twMerge } from 'tailwind-merge';
import './style.css';

interface ICollapse extends CollapseProps {
	plain?: boolean;
}

function Collapse({ plain = false, expandIcon, ...props }: ICollapse) {
	return (
		<AntdCollapase
			{...props}
			className={`${plain ? 'plain' : 'border'} ${props.className}`}
			// eslint-disable-next-line react/no-unstable-nested-components
			expandIcon={
				expandIcon ||
				(({ isActive }) => (
					<CircleArrowDownIcon className={twMerge('text-primary text-lg', isActive && 'rotate-[180deg]')} />
				))
			}
		/>
	);
}

export default Collapse;
