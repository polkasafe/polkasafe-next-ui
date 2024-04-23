// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import Identicon from '@polkadot/react-identicon';
import { Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import LoadingLottie from '~assets/lottie-graphics/Loading';
import CancelBtn from '@next-substrate/app/components/Multisig/CancelBtn';
import AddBtn from '@next-substrate/app/components/Multisig/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import Balance from '@next-common/ui-components/Balance';
import { CheckOutlined, WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import ProxyImpPoints from '@next-common/ui-components/ProxyImpPoints';
import formatBnBalance from '@next-substrate/utils/formatBnBalance';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import setSigner from '@next-substrate/utils/setSigner';
import transferAndProxyBatchAll from '@next-substrate/utils/transferAndProxyBatchAll';

import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { networks } from '@next-common/global/networkConstants';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import Loader from '../../UserFlow/Loader';
import AddProxySuccessScreen from './AddProxySuccessScreen';
import AddProxyFailedScreen from './AddProxyFailedScreen';

interface IMultisigProps {
	onCancel?: () => void;
	homepage?: boolean;
	signatories?: string[];
	threshold?: number;
	setProxyInProcess?: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const AddProxy: React.FC<IMultisigProps> = ({ onCancel, signatories, threshold, homepage, setProxyInProcess }) => {
	const { address: userAddress, activeMultisig, loggedInWallet } = useGlobalUserDetailsContext();
	const { apis } = useGlobalApiContext();
	const { activeOrg } = useActiveOrgContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');

	const multisig = activeOrg?.multisigs?.find((item) => item.address === activeMultisig);

	const network = multisig.network || networks.POLKADOT;

	const [txnHash, setTxnHash] = useState<string>('');

	const [multisigBalance, setMultisigBalance] = useState<BN>(new BN(0));
	const [reservedProxyDeposit, setReservedProxyDeposit] = useState<BN>(new BN(0));
	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));

	useEffect(() => {
		if (!apis || !apis[network] || !apis[network].apiReady || !activeMultisig) return;

		const { api } = apis[network];

		const depositBase = api.consts.multisig.depositBase.toString();
		const depositFactor = api.consts.multisig.depositFactor.toString();
		setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));

		api.query?.system
			?.account(activeMultisig)
			.then((res) => {
				const balanceStr = res?.data?.free;
				setMultisigBalance(balanceStr);
			})
			.catch((e) => console.error(e));

		setReservedProxyDeposit(
			(api.consts.proxy.proxyDepositFactor as unknown as BN)
				.muln(1)
				.iadd(api.consts.proxy.proxyDepositBase as unknown as BN)
				.add((api.consts.balances.existentialDeposit as unknown as BN).muln(2))
		);
	}, [activeMultisig, apis, network]);

	const createProxy = async () => {
		if (!apis || !apis[network] || !apis[network].apiReady) return;

		await setSigner(apis[network].api, loggedInWallet, network);

		setLoading(true);
		console.log(formatBnBalance(reservedProxyDeposit, { numberAfterComma: 7, withUnit: true }, network));
		setLoadingMessages(
			multisigBalance.lt(reservedProxyDeposit)
				? `A Base Amount (${formatBnBalance(
						reservedProxyDeposit.sub(multisigBalance),
						{ numberAfterComma: 3, withUnit: true },
						network
				  )}) will be transfered to Multisig to Create a Proxy.`
				: 'Proxy Creation in Progress'
		);
		try {
			await transferAndProxyBatchAll({
				amount: multisigBalance.lt(reservedProxyDeposit) ? reservedProxyDeposit.sub(multisigBalance) : new BN(0),
				api: apis[network].api,
				multisigAddress: multisig?.address || activeMultisig,
				network,
				recepientAddress: activeMultisig,
				senderAddress: getSubstrateAddress(userAddress) || userAddress,
				setLoadingMessages,
				setTxnHash,
				signatories: signatories || multisig?.signatories || [],
				threshold: threshold || multisig?.threshold || 2
			});
			setSuccess(true);
			setLoading(false);
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoading(false);
		}
	};

	return success ? (
		<AddProxySuccessScreen
			txnHash={txnHash}
			createdBy={userAddress}
			threshold={multisig?.threshold || 2}
			signatories={multisig?.signatories || []}
			successMessage='Proxy creation in progress!'
			waitMessage='All threshold signatories need to sign the Transaction to Create a Proxy.'
			onDone={() => {
				setProxyInProcess?.(true);
				onCancel?.();
			}}
		/>
	) : failure ? (
		<AddProxyFailedScreen
			userAddress={userAddress}
			txnHash={txnHash}
		/>
	) : (
		<Spin
			spinning={loading}
			indicator={<LoadingLottie message={loadingMessages} />}
		>
			{!homepage && (
				<div className='flex justify-center gap-x-4 items-center mb-5 w-full'>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>
							<CheckOutlined />
						</div>
						<p className='text-text_secondary'>Create Multisig</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]' />
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p>Create Proxy</p>
					</div>
				</div>
			)}
			<div className='w-full flex justify-center mb-3'>
				<ProxyImpPoints />
			</div>
			<div className='text-primary mb-2'>Signed As</div>
			<div className='mb-4 p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center gap-x-4'>
				<div className='flex items-center justify-center w-10 h-10'>
					<Identicon
						className='image identicon mx-2'
						value={userAddress}
						size={30}
						theme='polkadot'
					/>
				</div>
				<div className='flex flex-col gap-y-[6px]'>
					<h4 className='font-medium text-sm leading-[15px] text-white'>
						{activeOrg?.addressBook?.find((a) => a.address === userAddress)?.name}
					</h4>
					<p className='text-text_secondary font-normal text-xs leading-[13px]'>{userAddress}</p>
				</div>
				<Balance
					network={network}
					api={apis?.[network]?.api}
					apiReady={apis?.[network]?.apiReady}
					address={userAddress}
				/>
			</div>

			<section className='mb-4 w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[16px] flex items-center gap-x-[11px]'>
				<span>
					<WarningCircleIcon className='text-base' />
				</span>
				<p>
					A small deposit of ({formatBnBalance(reservedProxyDeposit, { numberAfterComma: 3, withUnit: true }, network)}{' '}
					+ {formatBnBalance(totalDeposit, { numberAfterComma: 3, withUnit: true }, network)}) should be present in your
					Account and approval would be required from threshold signatories to Create a Proxy.
				</p>
			</section>

			<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
				<CancelBtn onClick={onCancel} />
				<AddBtn
					title='Create Proxy'
					onClick={createProxy}
				/>
			</div>
		</Spin>
	);
};

export default AddProxy;
