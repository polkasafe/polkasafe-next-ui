/* eslint-disable no-bitwise */

'use client';

import DoughnutChart from '@common/global-ui-components/DoughnutChart';
import { IMultisigAssets } from '@common/types/substrate';

interface IAssetCard {
	assets: Array<IMultisigAssets | null>;
	totalAssets: number;
}

const getRandomColor = (): string => {
	const baseColor: string = '#3b0e96';
	let color: string = baseColor;
	const randomFactor: number = Math.floor(Math.random() * 5) + 1;
	// eslint-disable-next-line @typescript-eslint/no-shadow
	const shadeColor = (color: string, percent: number): string => {
		const num: number = parseInt(color.slice(1), 16);
		const amt: number = Math.round(2.55 * percent);
		const R: number = (num >> 16) + amt;
		const G: number = ((num >> 8) & 0x00ff) + amt;
		const B: number = (num & 0x0000ff) + amt;

		return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
	};

	color = shadeColor(color, randomFactor * 10);

	return color;
};

export default function AssetsCard({ assets, totalAssets }: IAssetCard) {
	const assetsData = assets?.map((asset) => {
		if (!asset) {
			return null;
		}
		const value = Number(asset.free.split(',').join(''));
		if (Number.isNaN(value) || value === 0) {
			return null;
		}
		// calculate asset percantage using total assets
		const assetPercentage = ((value / totalAssets) * 100).toFixed(2);
		return {
			label: asset.symbol,
			color: getRandomColor(),
			value: assetPercentage
		};
	});

	return <DoughnutChart data={assetsData} />;
}
