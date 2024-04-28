import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { EAssetType, EINVOICE_STATUS, IAsset, NotificationStatus } from '@next-common/types';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Divider, Form } from 'antd';
import { LineIcon, SquareDownArrowIcon, WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import Balance from '@next-evm/ui-components/Balance';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import BalanceInput from '@next-evm/ui-components/BalanceInput';
import formatBalance from '@next-evm/utils/formatBalance';
import Loader from '@next-common/ui-components/Loader';
// import addNewTransaction from '@next-evm/utils/addNewTransaction';
import queueNotification from '@next-common/ui-components/QueueNotification';
import createTokenTransferParams from '@next-evm/utils/createTokenTransaferParams';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import ModalBtn from '../../Settings/ModalBtn';
import CancelBtn from '../../Settings/CancelBtn';

const PayWithAccount = ({
	network,
	receiverAddress,
	requestedAmountInDollars,
	onCancel,
	invoiceId
}: {
	network: NETWORK;
	receiverAddress: string;
	requestedAmountInDollars: string;
	onCancel: () => void;
	invoiceId: string;
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];
	const { connectWallet } = usePrivy();

	const [address, setAddress] = useState<string>(connectedWallet?.address || '');

	const [allAssets, setAllAssets] = useState<IAsset[]>([]);

	const [amount, setAmount] = useState('0');
	const [token, setToken] = useState<IAsset>(null);

	const [tokensRequested, setTokensRequested] = useState<string>('0');

	const [tokensLoading, setTokensLoading] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (allAssets) {
			setToken(allAssets[0]);
		}
	}, [allAssets]);

	useEffect(() => {
		if (!connectedWallet || !connectedWallet.address) return;
		console.log('connected wallet', connectedWallet);
		setAddress(connectedWallet.address);
	}, [connectedWallet]);

	useEffect(() => {
		if (!address) return;
		const fetchBalance = async () => {
			setTokensLoading(true);
			const data = await fetch(
				`https://api.covalenthq.com/v1/${
					chainProperties[network].covalentNetworkName || ''
				}/address/${address}/balances_v2/?key=${process.env.NEXT_PUBLIC_COVALENT_API_KEY}`,
				{ method: 'GET' }
			);

			const res = await data.json();
			console.log('res', res);
			const tokensArray = res.data.items;
			const assets: IAsset[] = tokensArray
				?.filter((item: any) => item?.contract_ticker_symbol)
				?.map((t: any) => {
					const balance = ethers.BigNumber.from(t?.balance);
					return {
						balance_token: ethers.utils.formatUnits(
							balance.toString(),
							t?.contract_decimals || chainProperties[network].decimals
						),
						balance_usd: String(t?.quote),
						fiat_conversion: String(t?.quote_rate),
						logoURI: t?.logo_url || chainProperties[network]?.logo,
						name: t?.contract_ticker_symbol || chainProperties[network].tokenSymbol,
						symbol: t?.contract_display_name || chainProperties[network].tokenSymbol,
						tokenAddress: t?.contract_address,
						token_decimals: t?.contract_decimals || chainProperties[network].decimals,
						type: t?.native_token ? EAssetType.NATIVE_TOKEN : EAssetType.ERC20
					};
				});
			console.log('assets', assets);
			setAllAssets(assets);
			setTokensLoading(false);
		};
		fetchBalance();
	}, [address, connectedWallet, network]);

	useEffect(() => {
		if (!requestedAmountInDollars || !token) return;

		const numberOfTokens = Number(requestedAmountInDollars) / Number(token.fiat_conversion);
		setTokensRequested(String(numberOfTokens));
	}, [requestedAmountInDollars, token]);

	const updateInvoice = async (transactionHash: string) => {
		if (!invoiceId || !transactionHash || !connectedWallet) return;

		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateInvoice_eth`, {
			body: JSON.stringify({
				invoiceId,
				status: EINVOICE_STATUS.PAID,
				transactionHash
			}),
			headers: firebaseFunctionsHeader(connectedWallet.address),
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
		if (!connectedWallet || !connectedWallet.address || !address) return;
		setLoading(true);
		try {
			const provider = await connectedWallet.getEthersProvider();
			const signer = provider.getSigner(connectedWallet.address);
			if (!signer) {
				console.log('No signer found');
				setLoading(false);
				return;
			}

			const transactionData = createTokenTransferParams(
				[receiverAddress],
				[ethers.utils.parseUnits(amount, token?.token_decimals || 'ether').toString()],
				[token]
			);
			const tx = await signer.sendTransaction(transactionData as MetaTransactionData);
			console.log('tx', tx);
			const wait = await tx.wait();
			console.log('txhash', wait);
			// await addNewTransaction({
			// address,
			// amount: ethers.utils.parseUnits(amount.toString(), 'ether').toString(),
			// callData: '',
			// callHash: transactionHash,
			// executed: true,
			// network,
			// note: '',
			// safeAddress: address,
			// to,
			// type: 'sent'
			// });
			queueNotification({
				header: 'Success!',
				message: 'You have successfully completed the transaction. ',
				status: NotificationStatus.SUCCESS
			});
			onCancel();
			await updateInvoice(wait?.transactionHash || '');
		} catch (err) {
			console.log('error from handleSubmit sendNativeToken', err);
			queueNotification({
				header: 'Error!',
				message: 'Please try again',
				status: NotificationStatus.ERROR
			});
		}

		setLoading(false);
	};

	return !address ? (
		<div className='w-full h-full flex items-center justify-center'>
			<PrimaryButton onClick={connectWallet}>Connect Wallet</PrimaryButton>
		</div>
	) : tokensLoading ? (
		<Loader />
	) : (
		<div>
			<Form className='max-h-[68vh] overflow-y-auto px-2 pb-8'>
				<section>
					<div className='flex items-center gap-x-[10px] mt-[14px]'>
						<article className='w-[500px]'>
							<p className='text-primary font-normal mb-2 text-xs leading-[13px] flex items-center justify-between'>
								Sending from
								<Balance
									network={network}
									address={address}
								/>
							</p>
							<div className='border border-solid border-primary rounded-lg px-2 py-2 h-full flex justify-between items-center'>
								<AddressComponent
									showNetworkBadge
									network={network}
									address={address}
									fullAddress
								/>
							</div>
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
										fullAddress
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
									assets={allAssets}
									token={token}
									onTokenChange={(t) => {
										setToken(t);
										console.log('token', t);
									}}
									label={`Amount* (Requested: $${formatBalance(requestedAmountInDollars)})`}
									onChange={(balance) => setAmount(balance)}
									requestedAmount={requestedAmountInDollars}
								/>
							</article>
							<div className='flex flex-col gap-y-4'>
								<article className='w-[412px] flex items-center'>
									<span className='-mr-1.5 z-0'>
										<LineIcon className='text-5xl' />
									</span>
									<p className='p-3 bg-waiting bg-opacity-10 rounded-xl font-normal text-sm text-waiting leading-[15.23px] flex items-center gap-x-2 w-full'>
										<WarningCircleIcon className='text-sm' />
										Tokens Requested in {token.name} is {formatBalance(tokensRequested)} {token.name}
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
						!amount ||
						Number.isNaN(Number(amount)) ||
						Number(amount) === 0 ||
						(token && Number(amount) > Number(token.balance_token))
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
