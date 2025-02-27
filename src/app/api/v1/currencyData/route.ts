import { currencySymbol } from '@common/constants/currencyConstants';
import { ResponseMessages } from '@common/constants/responseMessage';
import { CURRENCIES_COLLECTION } from '@common/db/collections';
import { ENetwork } from '@common/enum/substrate';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const PUT = withErrorHandling(async (req: NextRequest) => {
	try {
		const networks = Object.values(ENetwork).join(',');
		const currencies = Object.values(currencySymbol)
			.map((currency) => currency.toLowerCase())
			.join(',');
		const { data } = await axios.get(
			`https://api.coingecko.com/api/v3/simple/price?ids=${networks}&vs_currencies=${currencies}`
		);

		const currenciesData = Object.keys(data).map(async (network: any) => {
			const docId = network;
			await CURRENCIES_COLLECTION.doc(docId).set(data[network], { merge: true });
			return data[network];
		});
		const { data: usdtAndUsdc } = await axios.get(
			`https://min-api.cryptocompare.com/data/pricemulti?fsyms=USDT,USDC&tsyms=${currencies}`
		);

		await CURRENCIES_COLLECTION.doc('usdt').set(usdtAndUsdc.USDT, { merge: true });
		await CURRENCIES_COLLECTION.doc('usdc').set(usdtAndUsdc.USDT, { merge: true });

		await Promise.all(currenciesData);
		return NextResponse.json({ data: currenciesData, error: null });
	} catch (err: unknown) {
		console.log('Error in Set Currency:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	try {
		const currencies = await CURRENCIES_COLLECTION.get();
		const data: any = {};
		currencies.docs.forEach((currency) => {
			const currenciesData = currency.data();
			data[currency.id] = currenciesData;
		});

		return NextResponse.json({ data, error: null });
	} catch (err: unknown) {
		console.log('Error in Get Currency:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
