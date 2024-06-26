import { EINVOICE_STATUS, IInvoice, QrState, Wallet } from '@next-common/types';
import React, { useEffect, useState } from 'react';
import { Divider, Form } from 'antd';
import { LineIcon, SquareDownArrowIcon, WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import Balance from '@next-common/ui-components/Balance';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import BalanceInput from '@next-common/ui-components/BalanceInput';
import formatBalance from '@next-substrate/utils/formatBalance';
import BN from 'bn.js';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import transferFunds from '@next-substrate/utils/transferFunds';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import setSigner from '@next-substrate/utils/setSigner';
import { chainProperties } from '@next-common/global/networkConstants';
// import formatBnBalance from '@next-substrate/utils/formatBnBalance';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import APP_NAME from '@next-common/global/appName';
import AccountSelectionForm from '@next-common/ui-components/AccountSelectionForm';
import { isHex } from '@polkadot/util';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import formatBnBalance from '@next-substrate/utils/formatBnBalance';
import ModalBtn from '../../Settings/ModalBtn';
import CancelBtn from '../../Settings/CancelBtn';

const PayWithAccount = ({
	network,
	receiverAddress,
	requestedAmountInDollars,
	onCancel,
	invoiceId
}: {
	network: string;
	receiverAddress: string;
	requestedAmountInDollars: string;
	onCancel: () => void;
	invoiceId: string;
}) => {
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const { apis } = useGlobalApiContext();
	const { address: userAddress, loggedInWallet } = useGlobalUserDetailsContext();
	const [address, setAddress] = useState<string>(userAddress || '');

	const { allCurrencyPrices, tokensUsdPrice } = useGlobalCurrencyContext();

	// const [allAssets, setAllAssets] = useState<IAsset[]>([]);

	const [amount, setAmount] = useState<BN>(new BN(0));
	const [token, setToken] = useState<string>('');

	const [tokensRequested, setTokensRequested] = useState<string>('0');

	// const [tokensLoading, setTokensLoading] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [txnHash, setTxnHash] = useState<string>('');

	const [openSignWithVaultModal, setOpenSignWithVaultModal] = useState<boolean>(false);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [{ isQrHashed, qrAddress, qrPayload, qrResolve }, setQrState] = useState<QrState>(() => ({
		isQrHashed: false,
		qrAddress: '',
		qrPayload: new Uint8Array()
	}));

	const onAccountChange = (a: string) => {
		setAddress(a);
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		if (typeof window !== 'undefined') {
			const injectedWindow = window as Window & InjectedWindow;

			const wallet = injectedWindow.injectedWeb3[chosenWallet];

			if (!wallet) {
				// setNoExtenstion?.(true);
				return;
			}

			// setFetchAccountsLoading?.(true);
			let injected: Injected | undefined;
			try {
				injected = await new Promise((resolve, reject) => {
					const timeoutId = setTimeout(() => {
						reject(new Error('Wallet Timeout'));
					}, 60000); // wait 60 sec

					if (wallet && wallet.enable) {
						wallet
							.enable(APP_NAME)
							.then((value) => {
								clearTimeout(timeoutId);
								resolve(value);
							})
							.catch((error) => {
								reject(error);
							});
					}
				});
			} catch (err) {
				// setFetchAccountsLoading?.(false);
				console.log(err?.message);
			}
			if (!injected) {
				// setFetchAccountsLoading?.(false);
				return;
			}

			const injectedAccounts = await injected.accounts.get();

			if (injectedAccounts.length === 0) {
				// setFetchAccountsLoading?.(false);
				// setNoAccounts?.(true);
				return;
			}
			// setFetchAccountsLoading?.(false);

			setAccounts(
				injectedAccounts.map((account) => ({
					...account,
					address: getSubstrateAddress(account.address) || account.address
				}))
			);
			// if (accounts.length > 0 && api && apiReady) {
			// api.setSigner(injected.signer);
			// }
		}
	};

	useEffect(() => {
		getAccounts(Wallet.POLKADOT);
	}, []);

	useEffect(() => {
		if (accounts && accounts.length > 0) {
			setAddress(accounts[0].address);
		}
	}, [accounts]);

	useEffect(() => {
		if (!requestedAmountInDollars || !allCurrencyPrices || !tokensUsdPrice) return;

		const tokenPriceInUsd = Number(tokensUsdPrice[network]?.value) * (allCurrencyPrices.USD?.value || 1);
		const numberOfTokens = Number(requestedAmountInDollars) / Number(tokenPriceInUsd);
		setTokensRequested(String(numberOfTokens));
	}, [allCurrencyPrices, network, requestedAmountInDollars, tokensUsdPrice]);

	const updateInvoice = async (txHash: string, paidFrom: IInvoice['paid_from']) => {
		console.log('update invoice', txHash, invoiceId);
		if (!invoiceId || !txHash) return;

		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateInvoice_substrate`, {
			body: JSON.stringify({
				invoiceId,
				paid_from: paidFrom,
				status: EINVOICE_STATUS.PAID,
				transactionHash: txHash
			}),
			headers: firebaseFunctionsHeader(),
			method: 'POST'
		});
		const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
			data: any;
			error: string;
		};
		if (!invoiceError && invoiceData) {
			console.log('invoice data', invoiceData);
		}
	};

	const handleSubmit = async () => {
		if (!apis || !apis[network] || !apis[network].apiReady || !receiverAddress || !amount) return;

		await setSigner(apis[network].api, loggedInWallet, network);

		console.log('obj', {
			amount,
			api: apis[network].apiReady,
			network,
			recepientAddress: receiverAddress,
			senderAddress: getSubstrateAddress(address) || address
		});

		setLoading(true);
		try {
			const { txHash, paidFrom } = await transferFunds({
				amount,
				api: apis[network].api,
				network,
				recepientAddress: receiverAddress,
				senderAddress: getSubstrateAddress(address) || address,
				setLoadingMessages,
				setOpenSignWithVaultModal,
				setQrState,
				setTxnHash
			});
			setLoading(false);
			onCancel();
			await updateInvoice(txHash, [
				{
					...paidFrom,
					dollarValue: String(
						Number(formatBnBalance(amount, { numberAfterComma: 0, withThousandDelimitor: false }, network)) *
							Number(tokensUsdPrice[network]?.value || 0)
					)
				}
			]);
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	return (
		<div>
			<ModalComponent
				open={openSignWithVaultModal}
				onCancel={() => {
					setOpenSignWithVaultModal(false);
					setLoading(false);
				}}
				title='Authorize Transaction in Vault'
			>
				<div className='flex items-center gap-x-4'>
					<div className='rounded-xl bg-white p-4'>
						<QrDisplayPayload
							cmd={isQrHashed ? 1 : 2}
							address={address}
							genesisHash={apis[network]?.api?.genesisHash}
							payload={qrPayload}
						/>
					</div>
					<QrScanSignature
						onScan={(data) => {
							if (data && data.signature && isHex(data.signature)) {
								console.log('signature', data.signature);
								if (qrResolve) {
									qrResolve({
										id: 0,
										signature: data.signature
									});
								}
								setOpenSignWithVaultModal(false);
							}
						}}
					/>
				</div>
			</ModalComponent>
			<Form className='max-h-[68vh] overflow-y-auto px-2 pb-8'>
				<section>
					<div className='flex items-center gap-x-[10px] mt-[14px]'>
						<article className='w-[500px]'>
							<p className='text-primary font-normal mb-2 text-xs leading-[13px] flex items-center justify-between'>
								Sending from
								{address && (
									<Balance
										api={apis?.[network]?.api}
										apiReady={apis?.[network]?.apiReady}
										network={network}
										address={address}
										onChange={(balance) => setToken(balance)}
									/>
								)}
							</p>
							{userAddress ? (
								<div className='border border-solid border-primary rounded-lg px-2 py-2 h-full flex justify-between items-center'>
									<AddressComponent
										showNetworkBadge
										network={network}
										address={address}
										// fullAddress
									/>
								</div>
							) : (
								<AccountSelectionForm
									disabled={loading}
									accounts={accounts}
									address={address}
									onAccountChange={onAccountChange}
									className='w-full'
								/>
							)}
						</article>
						<article className='w-[412px] flex items-center'>
							<span className='-mr-1.5 z-0'>
								<LineIcon className='text-5xl' />
							</span>
							<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
								The transferred balance will be subtracted (along with fees) from the sender account.
							</p>
						</article>
					</div>
					<div className='w-[500px]'>
						<Divider className='border-[#505050]'>
							<SquareDownArrowIcon />
						</Divider>
					</div>
				</section>

				<section className=''>
					<div className='flex items-start gap-x-[10px]'>
						<article className='w-[500px]'>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient*</label>
							<div className='h-[50px]'>
								<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
									<AddressComponent
										address={receiverAddress}
										// fullAddress
									/>
								</div>
							</div>
						</article>
						<div className='flex flex-col gap-y-4'>
							<article className='w-[412px] flex items-center'>
								<span className='-mr-1.5 z-0'>
									<LineIcon className='text-5xl' />
								</span>
								<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
									The beneficiary will have access to the transferred fees when the transaction is included in a block.
								</p>
							</article>
						</div>
					</div>
				</section>
				<section className='mt-[15px]'>
					{!token ? (
						<p className='p-3 bg-waiting bg-opacity-10 rounded-xl font-normal text-sm text-waiting leading-[15.23px] flex items-center gap-x-2 w-full'>
							<WarningCircleIcon className='text-sm' />
							You have no Tokens in your wallet.
						</p>
					) : (
						<div className='flex items-start gap-x-[10px]'>
							<article className='w-[500px]'>
								<BalanceInput
									network={network}
									label={`Amount* (Requested: $${formatBalance(requestedAmountInDollars)})`}
									onChange={(balance) => setAmount(balance)}
									requestedAmount={requestedAmountInDollars}
									fromBalance={token}
								/>
							</article>
							<div className='flex flex-col gap-y-4'>
								<article className='w-[412px] flex items-center'>
									<span className='-mr-1.5 z-0'>
										<LineIcon className='text-5xl' />
									</span>
									<p className='p-3 bg-waiting bg-opacity-10 rounded-xl font-normal text-sm text-waiting leading-[15.23px] flex items-center gap-x-2 w-full'>
										<WarningCircleIcon className='text-sm' />
										Tokens Requested in {chainProperties[network].tokenSymbol} is {formatBalance(tokensRequested)}{' '}
										{chainProperties[network].tokenSymbol}
									</p>
								</article>
							</div>
						</div>
					)}
				</section>
			</Form>
			<section className='flex items-center gap-x-5 justify-center mt-10'>
				<CancelBtn
					className='w-[250px]'
					onClick={onCancel}
					disabled={loading}
				/>
				<ModalBtn
					loading={loading}
					disabled={
						!amount || amount.isZero() || amount.gt(new BN(token))
						// (token && Number(amount) > Number(token.balance_token))
					}
					onClick={handleSubmit}
					className='w-[250px]'
					title='Make Transaction'
				/>
			</section>
		</div>
	);
};

export default PayWithAccount;
