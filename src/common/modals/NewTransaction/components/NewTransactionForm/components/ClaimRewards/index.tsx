import { useDashboardContext } from '@common/context/DashboarcContext';
import { ENetwork, ETransactionCreationType } from '@common/enum/substrate';
import { useNotification } from '@common/utils/notification';
import { Button, Form, FormInstance, Input, Spin } from 'antd';
import React, { useState } from 'react'
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { MultisigDropdown } from '@common/global-ui-components/MultisigDropdown';
import { findMultisig } from '@common/utils/findMultisig';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { IMultisig } from '@common/types/substrate';

// Stake template should have 2 sections
// 1. Select Multisig
// 2. Select Collator and stake amount



function ClaimRewards({
    form
}: {
    form: FormInstance;
}) {
    const { multisigs, buildTransaction, assets } = useDashboardContext();

	const notification = useNotification();

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


    const handleSubmit = async () => {
        try {

            const multisigId = `${selectedMultisigDetails.address}_${selectedMultisigDetails.network}`;

            const payload = {
                sender: findMultisig(multisigs, multisigId) as IMultisig,
                selectedProxy: selectedMultisigDetails.proxy,
                type: ETransactionCreationType.CLAIM_REWARDS,
                note: 'Claim Rewards'
            }

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
                            Claim Rewards for
                        </Typography>
                        <MultisigDropdown
                            multisigs={multisigs}
                            onChange={(value: { address: string; network: ENetwork; name: string; proxy?: string }) =>
                                setSelectedMultisigDetails(value)
                            }
                            assets={assets || null}
                        />
                    </div>
                    <div className='flex justify-end'>
                    <Button
                        type='primary'
                        htmlType='submit'
                    >
                        Claim Rewards
                    </Button>
                    </div>
                </Form>
        </Spin>)
}

export default ClaimRewards;
