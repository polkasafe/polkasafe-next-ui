import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AutoComplete, FormInstance, Form } from 'antd';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { CirclePlusIcon, DeleteIcon, OutlineCloseIcon } from '@common/global-ui-components/Icons';
import BN from 'bn.js';
import BalanceInput from '@common/global-ui-components/BalanceInput';
import { ENetwork } from '@common/enum/substrate';
import Button from '@common/global-ui-components/Button';
import Address from '@common/global-ui-components/Address';
import { MULTIPLE_CURRENCY_NETWORKS } from '@common/constants/multipleCurrencyNetworks';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { IMultisigAssets } from '@common/types/substrate';
import inputToBn from '@common/utils/inputToBn';

interface IRecipientInputs {
	autocompleteAddresses: Array<any>;
	form: FormInstance;
	setDisableSubmit?: Dispatch<SetStateAction<boolean>>;
	selectedMultisig: {
		address: string;
		network: ENetwork;
		name: string;
		proxy?: string;
	};
	assets?: IMultisigAssets[];
}

const getDecimalByToken = (token: string, network: ENetwork) => {
	const tokens = (networkConstants[network] as any).supportedTokens;
	const tokenData = tokens.find((t: any) => t.symbol === token);
	return tokenData?.decimals;
};

export const RecipientsInputs = ({
	autocompleteAddresses,
	form,
	setDisableSubmit,
	assets,
	selectedMultisig
}: IRecipientInputs) => {
	const { network } = selectedMultisig;
	const [recipientAndAmount, setRecipientAndAmount] = useState([
		{
			amount: new BN('0'),
			recipient: '',
			currency: networkConstants[network].tokenSymbol
		}
	]);
	const [amountExceeded, setAmountExceeded] = useState<boolean>(false);

	const [validRecipient, setValidRecipient] = useState<boolean[]>([true]);

	const isSelected = (recipient: string) => {
		return getSubstrateAddress(String(recipient)) !== null;
	};
	const onRecipientChange = (value: string, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.recipient = value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onAmountChange = (a: BN, i: number, currency?: string) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.amount = a;
			copyObject.currency = currency || '';
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddRecipient = () => {
		const nativeToken = networkConstants[network].tokenSymbol;
		setRecipientAndAmount((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ amount: new BN(0), recipient: '', currency: nativeToken });
			return copyOptionsArray;
		});
	};

	const onRemoveRecipient = (i: number) => {
		const copyOptionsArray = [...recipientAndAmount];
		copyOptionsArray.splice(i, 1);
		setRecipientAndAmount(copyOptionsArray);
	};

	useEffect(() => {
		if (!recipientAndAmount) return;
		const isValid: boolean[] = [];
		recipientAndAmount.forEach((item, i) => {
			if (item.recipient && !getSubstrateAddress(item.recipient)) {
				isValid.push(false);
				setValidRecipient((prev) => {
					const copyArray = [...prev];
					copyArray[i] = false;
					return copyArray;
				});
			} else {
				isValid.push(true);
				setValidRecipient((prev) => {
					const copyArray = [...prev];
					copyArray[i] = true;
					return copyArray;
				});
			}
		});
		if (!isValid.includes(false)) {
			form.setFieldsValue({ recipients: recipientAndAmount });
		}
	}, [form, recipientAndAmount]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!assets || !setDisableSubmit || !selectedMultisig) return;
		const proxyMultiSigAssets = assets
			?.map((a) => a.proxy || [])
			.flat()
			.find((a) => a.proxyAddress === selectedMultisig.proxy && a.network === selectedMultisig.network);

		const multiSigAssets = assets?.find(
			(asset) => asset?.address === selectedMultisig.address && asset?.network === network
		);

		const checkRecipient = recipientAndAmount.filter((item) => !item.recipient || !item.amount || item.amount.isZero());
		if (checkRecipient.length) {
			setDisableSubmit(true);
			return;
		}
		setDisableSubmit(false);

		const selectedAccountAssets = proxyMultiSigAssets || multiSigAssets;

		if (selectedAccountAssets) {
			const [nativeBalanceBN] = inputToBn(
				selectedAccountAssets.free || '0',
				network,
				false,
				getDecimalByToken(selectedAccountAssets.symbol, network)
			);
			const [usdcBalanceBN] = inputToBn(
				selectedAccountAssets?.usdc?.free || '0',
				network,
				false,
				getDecimalByToken('USDC', network)
			);

			const [usdtBalanceBN] = inputToBn(
				selectedAccountAssets?.usdt?.free || '0',
				network,
				false,
				getDecimalByToken('USDT', network)
			);

			const totalAmounts: { [symbol: string]: BN } = {
				[selectedAccountAssets.symbol]: new BN(0),
				USDC: new BN(0),
				USDT: new BN(0)
			};

			recipientAndAmount.forEach((item) => {
				const token = item.currency;
				totalAmounts[token] = totalAmounts[token] ? totalAmounts[token].add(item.amount) : item.amount;
			});

			if (
				totalAmounts[selectedAccountAssets.symbol]?.gt(nativeBalanceBN) ||
				totalAmounts.USDC?.gt(usdcBalanceBN) ||
				totalAmounts.USDT?.gt(usdtBalanceBN)
			) {
				setDisableSubmit(true);
				setAmountExceeded(true);
				return;
			}
			setDisableSubmit(false);
			setAmountExceeded(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMultisig, recipientAndAmount, assets]);

	return (
		<div>
			<div className='flex flex-col gap-y-3 max-h-72 overflow-y-auto pr-1'>
				<div className='flex flex-col gap-1'>
					{recipientAndAmount?.map(({ recipient }, i) => (
						<div
							key={`${recipient}_${i}`}
							className='flex items-start gap-x-2 justify-center max-sm:w-full max-sm:flex-col'
						>
							<div className='w-[60%] max-sm:w-full'>
								<label className='text-label font-normal text-xs leading-[13px] block mb-[5px]'>Recipient*</label>

								<Form.Item
									name='recipient'
									rules={[{ required: true }]}
									help={
										(!recipient && 'Recipient Address is Required') ||
										(!validRecipient[i] && 'Please add a valid Address')
									}
									className='border-0 outline-0 my-0 p-0'
									validateStatus={recipient && validRecipient[i] ? 'success' : 'error'}
								>
									<div className='h-[50px]'>
										{recipient && isSelected(recipient) ? (
											<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center w-full'>
												<Address
													address={recipient}
													network={network}
												/>
												<button
													className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
													onClick={() => {
														onRecipientChange('', i);
													}}
												>
													<OutlineCloseIcon className='text-primary w-2 h-2' />
												</button>
											</div>
										) : (
											<AutoComplete
												className='[&>div>span>input]:px-[12px] w-full [&_.ant-select-selector]:bg-bg-secondary'
												filterOption={(inputValue, options) => {
													return inputValue && options?.value
														? getSubstrateAddress(String(options?.value) || '') === getSubstrateAddress(inputValue)
														: true;
												}}
												options={autocompleteAddresses}
												id='recipient'
												placeholder='Send to Address..'
												value={recipientAndAmount[i].recipient}
												onChange={(value) => onRecipientChange(value, i)}
											/>
										)}
									</div>
								</Form.Item>
							</div>
							<div className='flex items-center gap-x-2 w-[40%]'>
								<BalanceInput
									network={network}
									amountExceeded={amountExceeded}
									label='Amount*'
									formName={`recipients[${i}].amount`}
									onChange={(balance, currency) => onAmountChange(balance, i, currency)}
									multipleCurrency={MULTIPLE_CURRENCY_NETWORKS.includes(network)}
									className='w-full'
								/>
								{i !== 0 && (
									<Button
										onClick={() => onRemoveRecipient(i)}
										className='text-failure border-none outline-none bg-[#e63946]/[0.1] flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
									>
										<DeleteIcon />
									</Button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
			<div className='flex items-center gap-x-3'>
				<Button
					className={`bg-transparent p-0 border-none outline-none shadow-none text-sm ${amountExceeded ? 'text-text-disabled' : 'text-label'}`}
					onClick={onAddRecipient}
					icon={<CirclePlusIcon className={`${amountExceeded ? 'text-text-disabled' : 'text-label'}`} />}
					disabled={amountExceeded}
				>
					Add Another
				</Button>
				{amountExceeded && <span className='text-xs text-failure'>Insufficient Balance in Selected Multisig</span>}
			</div>
		</div>
	);
};
