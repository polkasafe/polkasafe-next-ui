/* eslint-disable no-bitwise */

import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend as ChartLegend } from 'chart.js';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import NoAssetsSVG from '@assets/icons/no-transaction-home.svg';

type IChartData = {
	label: string;
	color: string;
	value: number;
};

Chart.register(ArcElement, Tooltip, ChartLegend);

const CHART_COLORS = ['#392A74', '#58409B', '#9F69C9', '#DDB4FC'];

// Main DoughnutChart component
const DoughnutChart = ({ data: currentData }: { data: Array<{ label: string; value: number; color: string }> }) => {
	if (!currentData || currentData.length === 0) {
		return null;
	}

	const data = currentData.filter((item) => Boolean(item) && item?.label && item?.color && item?.value);

	const sortedData = data.sort((a, b) => Number(a.value) - Number(b.value)).reverse();

	const filteredData =
		sortedData.length <= 4
			? sortedData
			: [
					...sortedData.slice(0, 3),
					sortedData.slice(3).reduce(
						(prev, item) => {
							return {
								value: prev.value + Number(item.value),
								label: prev.label.concat(`${item.label}, `),
								color: ''
							};
						},
						{ label: '', value: 0, color: '' }
					)
				];

	const chartData = {
		labels: filteredData.map((item) => item.label),
		datasets: [
			{
				data: filteredData.map((item) => Number(item.value)),
				backgroundColor: CHART_COLORS,
				borderColor: '#1b2028',
				borderWidth: 6,
				hoverBorderColor: '#1b2028',
				hoverOffset: 4
			}
		]
	};

	const options = {
		plugins: {
			legend: {
				display: false
			},
			customSegmentWidthPlugin: {}
		},
		cutout: '67%',
		responsive: true,
		maintainAspectRatio: false
	};

	return (
		<div className='w-44 h-44'>
			<Doughnut
				data={chartData}
				options={options}
			/>
		</div>
	);
};

// Legend component
const Legend = ({ data: currentData }: { data: Array<IChartData> }) => {
	const data = currentData.filter((item) => Boolean(item) && item?.label && item?.color && item?.value);

	const sortedData = data.sort((a, b) => Number(a.value) - Number(b.value)).reverse();

	const filteredData =
		sortedData.length <= 4
			? sortedData
			: [
					...sortedData.slice(0, 3),
					sortedData.slice(3).reduce(
						(prev, item) => {
							return {
								value: prev.value + Number(item.value),
								label: prev.label.concat(`${item.label}, `),
								color: ''
							};
						},
						{ label: '', value: 0, color: '' }
					)
				];
	return (
		<div>
			<Typography
				variant={ETypographyVariants.p}
				className='text-sm text-text-secondary capitalize mb-1'
			>
				Top Assets
			</Typography>
			<div className='overflow-y-auto overflow-x-hidden h-32 px-4'>
				<ul style={{ listStyleType: 'none', padding: 0 }}>
					{filteredData.map((item, index) => (
						<li
							key={`${item.label}_${index}`}
							style={{ color: CHART_COLORS[index] }}
						>
							<div className='flex items-center gap-2 text-xs'>
								<Typography
									variant={ETypographyVariants.p}
									className='text-xs font-medium text-text-primary capitalize'
								>
									{item.label}
								</Typography>
								<span className='text-success'>{item.value}%</span>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

// Combined component
const DoughnutChartWithLegend = ({
	data
}: {
	data: Array<{
		label: string;
		value: string;
		color: string;
	} | null>;
}) => {
	return (
		<div className='flex justify-center items-center gap-6'>
			{data?.filter((item) => Boolean(item) && item?.label && item?.color && item?.value).length > 0 ? (
				<>
					<DoughnutChart data={data as any} />
					<Legend data={data as any} />
				</>
			) : (
				<div className='flex flex-col gap-y-2 items-center justify-center'>
					<NoAssetsSVG />
					<p className='font-normal text-xs leading-[15px] text-text_secondary'>No Assets Found.</p>
				</div>
			)}
		</div>
	);
};

export default DoughnutChartWithLegend;
