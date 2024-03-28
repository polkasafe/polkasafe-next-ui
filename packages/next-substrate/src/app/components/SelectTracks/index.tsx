// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { Select } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props {
	tracksArr?: string[];
	className?: string;
	onTrackChange: (pre: string) => void;
	selectedTrack: string;
}
const SelectTracks = ({ tracksArr, className, onTrackChange, selectedTrack }: Props) => {
	return (
		<div className={className}>
			<Select
				placeholder='Select a track'
				suffixIcon={<CircleArrowDownIcon className='text-primary text-[16px]' />}
				className='border w-full border-primary rounded-lg pt-1 bg-[#24272E] cursor-pointer text-[16px]'
				value={selectedTrack.length > 0 ? selectedTrack : null}
				onChange={onTrackChange}
				options={
					tracksArr?.map((track) => {
						return { label: track.split(/(?=[A-Z])/).join(' '), value: track };
					}) || []
				}
				popupClassName='z-[2000]'
			/>
		</div>
	);
};
export default styled(SelectTracks)`
	.ant-select-selection-placeholder {
		color: #888888 !important;
		font-size: 16px !important;
	}
	.ant-select .ant-select-selector {
		height: 40px !important;
		display: flex;
		align-items: center;
		color: white !important;
		border-radius: 4px !important;
		background-color: #24272e !important;
	}
	.select .ant-select .ant-select-selector .ant-select-selection-item {
		display: flex;
		align-items: center;
		color: white;
		font-size: 14px;
	}
	.ant-select .ant-select-selection-placeholder {
		font-weight: 400;
		color: #7c899b;
	}
`;
