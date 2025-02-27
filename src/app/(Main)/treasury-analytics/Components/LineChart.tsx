/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sort-keys */
import React, { useEffect, useLayoutEffect, useState } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
// eslint-disable-next-line @typescript-eslint/naming-convention
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import dayjs from 'dayjs';
import { ITreasuryTxns } from '@common/enum/substrate';
import { networkConstants } from '@common/constants/substrateNetworkConstant';

interface IChartData {
	balance_usd: number;
	timestamp: string;
	tokenInfo: { [tokenSymbol: string]: { balance_token: number; balance_usd: number; tokenSymbol: string } };
}

const LineChart = ({
	incomingTransactions,
	outgoingTransactions,
	days
}: {
	incomingTransactions: ITreasuryTxns[];
	outgoingTransactions: ITreasuryTxns[];
	days: number;
}) => {
	const [txnsByDayIncoming, setTxnsByDayIncoming] = useState<IChartData[]>([]);
	const [txnsByDayOutgoing, setTxnsByDayOutgoing] = useState<IChartData[]>([]);

	// Day wise
	useEffect(() => {
		if (days > 120 || Number.isNaN(dayjs)) return;
		const monthlyDataIncoming: IChartData[] = [];
		const monthlyDataOutgoing: IChartData[] = [];

		incomingTransactions.forEach((item) => {
			const { timestamp } = item;
			const monthAndYear = dayjs(timestamp).format('YYYY-MM-DD');
			let foundIndex: number | null = null;
			if (
				monthlyDataIncoming.length > 0 &&
				monthlyDataIncoming.some((data, i) => {
					if (data.timestamp === monthAndYear) {
						foundIndex = i;
						return true;
					}
					foundIndex = null;
					return false;
				})
			) {
				if (foundIndex === null) return;
				const foundData = monthlyDataIncoming[foundIndex];
				foundData.balance_usd = Number(item.balance_usd) + Number(monthlyDataIncoming[foundIndex].balance_usd);
				if (foundData.tokenInfo[item.network]) {
					const tokenInfo = foundData.tokenInfo[item.network];
					tokenInfo.balance_token += Number(item.balance_token);
					tokenInfo.balance_usd += Number(item.balance_usd);
				} else {
					foundData.tokenInfo[item.network] = {
						balance_token: Number(item.balance_token),
						balance_usd: Number(item.balance_usd),
						tokenSymbol: networkConstants[item.network].tokenSymbol
					};
				}
			} else {
				monthlyDataIncoming.push({
					balance_usd: Number(item.balance_usd),
					timestamp: monthAndYear,
					tokenInfo: {
						[item.network]: {
							tokenSymbol: networkConstants[item.network].tokenSymbol,
							balance_usd: Number(item.balance_usd),
							balance_token: Number(item.balance_token)
						}
					}
				});
			}
		});

		outgoingTransactions.forEach((item) => {
			const { timestamp } = item;
			const monthAndYear = dayjs(timestamp).format('YYYY-MM-DD');
			let foundIndex: number | null = null;
			if (
				monthlyDataOutgoing.length > 0 &&
				monthlyDataOutgoing.some((data, i) => {
					if (data.timestamp === monthAndYear) {
						foundIndex = i;
						return true;
					}
					foundIndex = null;
					return false;
				})
			) {
				if (foundIndex === null) return;
				const foundData = monthlyDataOutgoing[foundIndex];
				foundData.balance_usd = Number(item.balance_usd) + Number(monthlyDataOutgoing[foundIndex].balance_usd);
				if (foundData.tokenInfo[item.network]) {
					const tokenInfo = foundData.tokenInfo[item.network];
					tokenInfo.balance_token += Number(item.balance_token);
					tokenInfo.balance_usd += Number(item.balance_usd);
				} else {
					foundData.tokenInfo[item.network] = {
						balance_token: Number(item.balance_token),
						balance_usd: Number(item.balance_usd),
						tokenSymbol: networkConstants[item.network].tokenSymbol
					};
				}
			} else {
				monthlyDataOutgoing.push({
					balance_usd: Number(item.balance_usd),
					timestamp: monthAndYear,
					tokenInfo: {
						[item.network]: {
							tokenSymbol: networkConstants[item.network].tokenSymbol,
							balance_usd: Number(item.balance_usd),
							balance_token: Number(item.balance_token)
						}
					}
				});
			}
		});
		console.log('monthly data', monthlyDataOutgoing);
		setTxnsByDayIncoming(monthlyDataIncoming);
		setTxnsByDayOutgoing(monthlyDataOutgoing);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [incomingTransactions]);

	// Monthly
	useEffect(() => {
		if (days <= 120) return;
		const monthlyDataIncoming: IChartData[] = [];
		const monthlyDataOutgoing: IChartData[] = [];

		incomingTransactions.forEach((item) => {
			const { timestamp } = item;
			const monthAndYear = dayjs(timestamp).format('MMM/YYYY');
			let foundIndex: number | null = null;
			if (
				monthlyDataIncoming.length > 0 &&
				monthlyDataIncoming.some((data, i) => {
					if (data.timestamp === monthAndYear) {
						foundIndex = i;
						return true;
					}
					foundIndex = null;
					return false;
				})
			) {
				if (foundIndex === null) return;
				const foundData = monthlyDataIncoming[foundIndex];
				foundData.balance_usd = Number(item.balance_usd) + Number(monthlyDataIncoming[foundIndex].balance_usd);
				if (foundData.tokenInfo[item.network]) {
					const tokenInfo = foundData.tokenInfo[item.network];
					tokenInfo.balance_token += Number(item.balance_token);
					tokenInfo.balance_usd += Number(item.balance_usd);
				} else {
					foundData.tokenInfo[item.network] = {
						balance_token: Number(item.balance_token),
						balance_usd: Number(item.balance_usd),
						tokenSymbol: networkConstants[item.network].tokenSymbol
					};
				}
			} else {
				monthlyDataIncoming.push({
					balance_usd: Number(item.balance_usd),
					timestamp: monthAndYear,
					tokenInfo: {
						[item.network]: {
							tokenSymbol: networkConstants[item.network].tokenSymbol,
							balance_usd: Number(item.balance_usd),
							balance_token: Number(item.balance_token)
						}
					}
				});
			}
		});

		outgoingTransactions.forEach((item) => {
			const { timestamp } = item;
			const monthAndYear = dayjs(timestamp).format('MMM/YYYY');
			let foundIndex: number | null = null;
			if (
				monthlyDataOutgoing.length > 0 &&
				monthlyDataOutgoing.some((data, i) => {
					if (data.timestamp === monthAndYear) {
						foundIndex = i;
						return true;
					}
					foundIndex = null;
					return false;
				})
			) {
				if (foundIndex === null) return;
				const foundData = monthlyDataOutgoing[foundIndex];
				foundData.balance_usd = Number(item.balance_usd) + Number(monthlyDataOutgoing[foundIndex].balance_usd);
				if (foundData.tokenInfo[item.network]) {
					const tokenInfo = foundData.tokenInfo[item.network];
					tokenInfo.balance_token += Number(item.balance_token);
					tokenInfo.balance_usd += Number(item.balance_usd);
				} else {
					foundData.tokenInfo[item.network] = {
						balance_token: Number(item.balance_token),
						balance_usd: Number(item.balance_usd),
						tokenSymbol: networkConstants[item.network].tokenSymbol
					};
				}
			} else {
				monthlyDataOutgoing.push({
					balance_usd: Number(item.balance_usd),
					timestamp: monthAndYear,
					tokenInfo: {
						[item.network]: {
							tokenSymbol: networkConstants[item.network].tokenSymbol,
							balance_usd: Number(item.balance_usd),
							balance_token: Number(item.balance_token)
						}
					}
				});
			}
		});
		console.log('monthly data', monthlyDataOutgoing);
		setTxnsByDayIncoming(monthlyDataIncoming);
		setTxnsByDayOutgoing(monthlyDataOutgoing);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [incomingTransactions]);

	useLayoutEffect(() => {
		const root = am5.Root.new('chartdiv');

		root.setThemes([am5themes_Animated.new(root)]);

		const chart = root.container.children.push(am5xy.XYChart.new(root, {}));

		const yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				renderer: am5xy.AxisRendererY.new(root, {}),
				extraTooltipPrecision: 1
			})
		);

		const xAxis = chart.xAxes.push(
			am5xy.DateAxis.new(root, {
				renderer: am5xy.AxisRendererX.new(root, {}),
				baseInterval: {
					timeUnit: 'day',
					count: 1
				}
			})
		);

		const yRenderer = yAxis.get('renderer');
		yRenderer.labels.template.setAll({
			fill: am5.color('#8B8B8B')
		});
		const xRenderer = xAxis.get('renderer');
		xRenderer.labels.template.setAll({
			fill: am5.color('#8B8B8B')
		});

		const series1 = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: 'Incoming',
				xAxis,
				yAxis,
				valueYField: 'value',
				valueXField: 'date',
				tension: 0.2,
				stroke: am5.color('#5C7AE6'),
				legendRangeLabelText: 'Incoming',
				tooltip: am5.Tooltip.new(root, {
					getFillFromSprite: false,
					// getStrokeFromSprite: true,
					autoTextColor: false
					// getLabelFillFromSprite: true
				})
			})
		);

		const series2 = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: 'Outgoing',
				xAxis,
				yAxis,
				valueYField: 'value',
				valueXField: 'date',
				tension: 0.2,
				stroke: am5.color('#3D3C41'),
				legendRangeLabelText: 'Outgoing',
				tooltip: am5.Tooltip.new(root, {
					getFillFromSprite: false,
					// getStrokeFromSprite: true,
					autoTextColor: false
					// getLabelFillFromSprite: true
				})
			})
		);

		// Data
		const data1 = txnsByDayIncoming.map((item) => ({
			date: new Date(dayjs(item.timestamp).toDate()).getTime(),
			value: Number(item.balance_usd.toFixed(2)),
			tokenInfo: item.tokenInfo
		}));

		const data2 = txnsByDayOutgoing.map((item) => ({
			date: new Date(dayjs(item.timestamp).toDate()).getTime(),
			value: Number(item.balance_usd.toFixed(2)),
			tokenInfo: item.tokenInfo
		}));

		// cursor Bullets
		chart.set(
			'cursor',
			am5xy.XYCursor.new(root, {
				behavior: 'zoomXY',
				xAxis
			})
		);

		const cursor = chart.get('cursor');

		cursor?.lineX.setAll({
			stroke: am5.color('#5C7AE6')
		});

		cursor?.lineY.setAll({
			visible: false
		});

		series1.bullets.push(function () {
			// create the circle first
			const circle = am5.Circle.new(root, {
				radius: 3,
				interactive: true, // required to trigger the state on hover
				fill: am5.color('#5C7AE6')
			});

			circle.states.create('hover', {
				stroke: am5.color(0xffffff),
				strokeWidth: 1,
				scale: 3,
				opacity: 1
			});

			return am5.Bullet.new(root, {
				sprite: circle
			});
		});

		series2.bullets.push(function () {
			// create the circle first
			const circle = am5.Circle.new(root, {
				radius: 3,
				interactive: true, // required to trigger the state on hover
				fill: am5.color('#3D3C41')
			});

			circle.states.create('hover', {
				stroke: am5.color(0xffffff),
				strokeWidth: 1,
				scale: 3,
				opacity: 1
			});

			return am5.Bullet.new(root, {
				sprite: circle
			});
		});

		const legend = chart.children.push(
			am5.Legend.new(root, {
				x: am5.percent(100),
				centerX: am5.percent(100),
				y: -8,
				interactive: false
			})
		);
		legend.data.setAll(chart.series.values);

		legend.labels.template.setAll({
			fill: am5.color('#8b8b8b')
		});

		// Tooltip

		const tooltip1 = series1.get('tooltip');
		const tooltip2 = series2.get('tooltip');

		tooltip1?.label.setAll({
			fill: am5.color('#ffffff')
		});
		tooltip2?.label.setAll({
			fill: am5.color('#ffffff')
		});

		tooltip1?.get('background')?.setAll({
			fill: am5.color('#1B2028')
		});
		tooltip2?.get('background')?.setAll({
			fill: am5.color('#1B2028')
		});

		tooltip1?.adapters.add('labelText', function (text, target) {
			const targetDataItem = target.dataItem;
			if (targetDataItem) {
				// eslint-disable-next-line no-param-reassign
				text = '[bold]$ {valueY}[/]\n ___________ \n';
				am5.array.each(series1.dataItems, function (dataItem) {
					if (
						dataItem.get('valueX') === targetDataItem.get('valueX' as any) &&
						dataItem.get('valueY') === targetDataItem.get('valueY' as any)
					) {
						const { tokenInfo } = dataItem.dataContext as any;
						Object.keys(tokenInfo).forEach((token) => {
							// eslint-disable-next-line no-param-reassign
							text += `\n $ ${tokenInfo[token].balance_usd.toFixed(2)} (${tokenInfo[token].balance_token.toFixed(2)} ${
								tokenInfo[token].tokenSymbol
							})`;
						});
					}
				});
			}
			return text;
		});
		tooltip2?.adapters.add('labelText', function (text, target) {
			const targetDataItem = target.dataItem;
			if (targetDataItem) {
				// eslint-disable-next-line no-param-reassign
				text = '[bold]$ {valueY}[/]\n ___________ \n';
				am5.array.each(series2.dataItems, function (dataItem) {
					if (
						dataItem.get('valueX') === targetDataItem.get('valueX' as any) &&
						dataItem.get('valueY') === targetDataItem.get('valueY' as any)
					) {
						const { tokenInfo } = dataItem.dataContext as any;
						Object.keys(tokenInfo).forEach((token) => {
							// eslint-disable-next-line no-param-reassign
							text += `\n $ ${tokenInfo[token].balance_usd.toFixed(2)} (${tokenInfo[token].balance_token.toFixed(2)} ${
								tokenInfo[token].tokenSymbol
							})`;
						});
					}
				});
			}
			return text;
		});

		series1.strokes.template.setAll({
			strokeWidth: 2
		});
		series2.strokes.template.setAll({
			strokeWidth: 2
		});

		series1.data.setAll(data1);
		series2.data.setAll(data2);
		return () => {
			root.dispose();
		};
	}, [txnsByDayIncoming, txnsByDayOutgoing]);

	return (
		<div
			id='chartdiv'
			style={{ width: '100%', height: '300px' }}
		/>
	);
};

export default LineChart;
