import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { ActionButtons } from '@common/global-ui-components/ActionButtons';
import Address from '@common/global-ui-components/Address';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { IReviewTransaction } from '@common/types/substrate';
import { useState } from 'react';
import ReactJson from 'react-json-view';
import { Select, Spin } from 'antd';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { ENetwork } from '@common/enum/substrate';
import { getCurrencyLogo } from '@common/constants/currencyConstants';
import ParachainTooltipIcon from '../ParachainTooltipIcon';

interface IReviewTransactionProps {
	onSubmit: () => Promise<void>;
	onClose: () => void;
	onChangeGasToken: (value: string) => void;
	reviewTransaction: IReviewTransaction;
	disabled?: boolean;
}


const MultipleAssetsDropDown = ({ network, onChange }: { network: ENetwork; onChange: (value: string) => void }) => {
	const tokens = (networkConstants[network] as any).supportedTokens as Array<{ symbol: string; logo: any }>;
	const nativeToken = networkConstants[network].tokenSymbol;
	const options = [
		{
			value: nativeToken,
			label: (
				<span className='flex gap-2 justify-start items-center ml-2'>
					<ParachainTooltipIcon src={networkConstants[network]?.logo} />
					{networkConstants[network]?.tokenSymbol}
				</span>
			)
		}
	];
	options.push(
		...(tokens.map((token) => ({
			value: token.symbol,
			label: (
				<span className='flex gap-x-1 justify-start items-center ml-2'>
					<ParachainTooltipIcon src={getCurrencyLogo(token.symbol)} />
					{token.symbol}
				</span>
			)
		})) as any)
	);

	return (
		<Select
			className='bg-bg-secondary w-1/4 [&_.ant-select-selector]:bg-bg-secondary rounded-lg [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:p-0'
			options={options}
			defaultValue={nativeToken}
			onChange={onChange}
		/>
	);
};


export const ReviewTransaction = ({
	onSubmit,
	onClose,
	reviewTransaction,
	disabled = false,
	onChangeGasToken
}: IReviewTransactionProps) => {
	const { tx, from, to, network, name, proxyAddress, txCost } = reviewTransaction;
	const [loading, setLoading] = useState(false);
	const notification = useNotification();

	const handleSignTransaction = async () => {
		try {
			setLoading(true);
			await onSubmit();
		} catch (error) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: error instanceof Error ? error.message : String(error) });
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={200}
					message='Creating Your Transaction'
				/>
			}
		>
			<div className='flex flex-col gap-y-4'>
				<div className='p-2 bg-bg-secondary rounded-xl'>
					<div className='max-w-[480px] overflow-y-auto max-h-52 overflow-x-hidden'>
						<ReactJson
							src={tx}
							collapseStringsAfterLength={15}
							theme='bright'
							style={{ background: 'transparent', maxWidth: 450 }}
						/>
					</div>
				</div>
				<div>
					<Typography
						variant={ETypographyVariants.p}
						className='text-label font-normal mb-2 text-xs leading-3 flex items-center justify-between max-sm:w-full'
					>
						Sending from
					</Typography>
					<div className='border border-dashed border-text-disabled hover:border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'>
						<Address
							address={proxyAddress || from}
							network={network}
							isProxy={Boolean(proxyAddress)}
							showNetworkBadge
							name={name || DEFAULT_ADDRESS_NAME}
						/>
					</div>
				</div>
				{to && (
					<div>
						<Typography
							variant={ETypographyVariants.p}
							className='text-label font-normal mb-2 text-xs leading-3 flex items-center justify-between max-sm:w-full'
						>
							Sending To
						</Typography>
						<div className='border border-dashed border-text-disabled hover:border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'>
							<Address
								address={to}
								network={network}
							/>
						</div>
					</div>
				)}

				{txCost && (
					<div>
						<Typography
							variant={ETypographyVariants.p}
							className='text-label font-normal mb-2 text-xs leading-3 flex items-center justify-between max-sm:w-full'
						>
							Transaction Cost
						</Typography>
						<div className='border border-dashed border-text-disabled hover:border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-full flex items-center gap-x-2 justify-between'>
							<Typography
								variant={ETypographyVariants.p}
								className='text-text-primary'
							>
								Gas Fees: {txCost}
							</Typography>

							<MultipleAssetsDropDown
								network={network || ENetwork.ROOT}
								onChange={(value) => onChangeGasToken(value)}
							/>
						</div>
					</div>
				)}
				<div className='flex items-center gap-x-4 w-full'>
					<ActionButtons
						label='Sign Transaction'
						onClick={handleSignTransaction}
						disabled={disabled}
						onCancel={onClose}
					/>
				</div>
			</div>
		</Spin>
	);
};
