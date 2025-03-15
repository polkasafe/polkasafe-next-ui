import { useDashboardContext } from '@common/context/DashboarcContext';
import { ENetwork, ETransactionCreationType } from '@common/enum/substrate';
import { useNotification } from '@common/utils/notification';
import { Button, Form, FormInstance, Input, Spin } from 'antd';
import React, { useEffect, useState } from 'react'
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import { ApiPromise } from '@polkadot/api';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { MultisigDropdown } from '@common/global-ui-components/MultisigDropdown';
import AddressDropdown from '@common/global-ui-components/AddressDropdown';
import { DeleteIcon } from '@common/global-ui-components/Icons';
import { CirclePlusIcon } from '@common/global-ui-components/Icons';
import { BN } from '@polkadot/util';
import inputToBn from '@common/utils/inputToBn';
import { findMultisig } from '@common/utils/findMultisig';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { IMultisig, ICollator } from '@common/types/substrate';
import CollatorDropdown from '@common/global-ui-components/CollatorDropdown';

// Stake template should have 2 sections
// 1. Select Multisig
// 2. Select Collator and stake amount



function Stake({
    network,
    onClose,
    form
}: {
    network: ENetwork;
    onClose: () => void;
    form: FormInstance;
}) {
    const { multisigs, buildTransaction, addressBook = [], assets, transactionFields } = useDashboardContext();
    const [amountExceeded, setAmountExceeded] = useState<boolean>(false);

	const notification = useNotification();
    const [collators, setCollators] = useState<Array<ICollator>>([]);
    const { getApi } = useAllAPI();
    const api = getApi?.(network)?.api;
    const [addressAndAmount, setAddressAndAmount] = useState<Array<{
        address: string;
        amount: string;
    }>>([{
        address: '',
        amount: ''
    }]);

    useEffect(() => {
        if (!api) return;
        (async () => {
            const collators: any = await (api as ApiPromise).query.collatorStaking.candidates.entries();

            const collatorsData = collators.map(([key, value]: any) => ({
                address: key.toHuman()?.[0] as string,
                stake: value.toHuman()?.stake as string,
                stakers: value.toHuman()?.stakers as string
            }));

            console.log('collators', collatorsData);
            setCollators(collatorsData);
        })();
    }, [api]);

    const [selectedMultisigDetails, setSelectedMultisigDetails] = useState<{
		address: string;
		network: ENetwork;
		name: string;
		proxy?: string;
	}>({
        address: multisigs[0].address,
		network: multisigs[0].network,
		name: multisigs[0].name
	});

    const [loading, setLoading] = useState(false);

    const onAddRecipient = () => {
		setAddressAndAmount((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ address: '', amount: '' });
			return copyOptionsArray;
		});  
	};

    const onRemoveRecipient = (i: number) => {
		const copyOptionsArray = [...addressAndAmount];
		copyOptionsArray.splice(i, 1);
		setAddressAndAmount(copyOptionsArray);
	};

    const onAddressSelect = (value: string, i: number) => {
        setAddressAndAmount((prevState) => {
            const copyArray = [...prevState];
            const copyObject = { ...copyArray[i] };
            copyObject.address = value;
            copyArray[i] = copyObject;
            return copyArray;
        });
		
	};
	const onAmountChange = (a: string, i: number) => {
		setAddressAndAmount((prevState) => {
            const copyArray = [...prevState];
            const copyObject = { ...copyArray[i] };
            copyObject.amount = a;
            copyArray[i] = copyObject;
            return copyArray;
        });
	};



    const handleSubmit = async () => {
        try {
            const checkExceedingBalance = () => {
                const stakeAmounts = addressAndAmount.map((item) => (
                    inputToBn(item.amount, network)[0]
                ));
                const totalStakeAmount = stakeAmounts.reduce((acc, curr) => acc.add(curr), new BN(0));
        
                const proxyMultiSigAssets = assets
                    ?.map((a) => a.proxy || [])
                    .flat()
                    .find((a) => a.proxyAddress === selectedMultisigDetails.proxy && a.network === selectedMultisigDetails.network);
        
                const multiSigAssets = assets?.find(
                    (asset) => asset?.address === selectedMultisigDetails.address && asset?.network === network
                );
        
                const nativeBalanceBN = proxyMultiSigAssets?.free || multiSigAssets?.free;
                
                const nativeBN = inputToBn(nativeBalanceBN || '0', network)[0];
        
                if(totalStakeAmount.gt(nativeBN)) {
                    setAmountExceeded(true);
                    return true;
                }
                setAmountExceeded(false);
                return false;
            }

            const checkCollatorAddress = () => {
                const collatorAddress = addressAndAmount.map((item) => item.address);
                return collatorAddress.includes('');
            }

			const multisigId = `${selectedMultisigDetails.address}_${selectedMultisigDetails.network}`;
            const collators = addressAndAmount.map((item) => ({
                address: item.address,
                amount: inputToBn(item.amount, network)[0]
            }));

            if(checkExceedingBalance()) return;
            if(checkCollatorAddress()) {
                notification(ERROR_MESSAGES.INVALID_COLLATOR_ADDRESS);
                return;
            }

            const payload = {
                sender: findMultisig(multisigs, multisigId) as IMultisig,
                selectedProxy: selectedMultisigDetails.proxy,
                type: ETransactionCreationType.STAKE,
                collators,
                note: 'Stake to Collators'
            }

            console.log('payload', {...payload, collators: collators.map((item) => ({
                address: item.address,
                amount: item.amount.toString()
            }))});
            setLoading(true);
            await buildTransaction({ ...payload });
        } catch (error) {
            notification(ERROR_MESSAGES.TRANSACTION_FAILED);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

	return (<Spin
                spinning={loading}
                indicator={
                    <LoadingLottie
                        width={200}
                        message='Creating Your Transaction'
                    />
                }
            >
                <Form
                    layout='vertical'
                    className='flex flex-col gap-y-6 max-w-[550px]'
                    form={form}
                    onFinish={handleSubmit}
                >
                    <div>
                        <Typography
                            variant={ETypographyVariants.p}
                            className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
                        >
                            Sending from
                        </Typography>
                        <MultisigDropdown
                            multisigs={multisigs}
                            onChange={(value: { address: string; network: ENetwork; name: string; proxy?: string }) =>
                                setSelectedMultisigDetails(value)
                            }
                            assets={assets || null}
                        />
                    </div>
                    <div>
                            <Typography
                                variant={ETypographyVariants.p}
                                className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full'
                            >
                                Stake to
                            </Typography>   
                            <div className='flex flex-col gap-y-2'>
                                {
                                    addressAndAmount.map((addressAndAmount, i) => (
                                        <div className='w-full flex gap-x-2'>
                                            <Form.Item
                                                className='w-full basis-1/2'
                                                name={`addressAndAmount[${i}].address`}
                                            >
                                                <CollatorDropdown
                                                    accounts={collators}
                                                    onAccountChange={(address) => {
                                                        onAddressSelect(address, i);
                                                    }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                className='w-full basis-1/2'
                                                name={`addressAndAmount[${i}].amount`}
                                                rules={[
                                                    () => ({
                                                        validator(_, value) {
                                                            if (Number.isNaN(Number(value))) {
                                                                return Promise.reject(new Error('Enter a valid number'));
                                                            }
                                                            if (value) {
                                                                const [, isValid] = inputToBn(value, network, false);
                                                                if (!isValid) {
                                                                    return Promise.reject(new Error('Enter a valid amount'));
                                                                }
                                                            }
                                                            return Promise.resolve();
                                                        }
                                                    })
                                                ]}
                                                rootClassName='mb-3'
                                            >
                                                <Input
                                                    className='h-12 bg-bg-secondary rounded-lg'
                                                    placeholder='Amount'
                                                    onChange={(e) => {
                                                        onAmountChange(e.target.value, i);
                                                    }}
                                                    type='number'
                                                    value={addressAndAmount.amount || 0}
                                                />
                                            </Form.Item>
                                            {i !== 0 && (
                                                <Button
                                                    onClick={() => onRemoveRecipient(i)}
                                                    className='text-failure border-none outline-none bg-[#e63946]/[0.1] flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
                                                >
                                                    <DeleteIcon />
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                }
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
                    <div className='flex justify-end'>
                    <Button
                        type='primary'
                        htmlType='submit'
                    >
                        Stake
                    </Button>
                    </div>
                </Form>
        </Spin>)
}

export default Stake;
