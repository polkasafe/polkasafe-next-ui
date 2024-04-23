/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import formatBnBalance from '@next-substrate/utils/formatBnBalance';
import { BN, BN_HUNDRED } from '@polkadot/util';
import { Form, Input, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import Markdown from '@next-common/ui-components/Markdown';
import HelperTooltip from '@next-common/ui-components/HelperTooltip';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NotificationStatus, PostOrigin } from '@next-common/types';
import setSigner from '@next-substrate/utils/setSigner';
import _ from 'lodash';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import { EKillOrCancel } from '../types';
import createPreImage from '../utils/createPreimage';
import executeTx from '../utils/executeTx';

const ZERO_BN = new BN(0);

export default function CancelOrKillReferendaForm({
	selectedMultisig,
	isProxySelected,
	type,
	seTransactionData
}: {
	selectedMultisig: string;
	isProxySelected: boolean;
	type: EKillOrCancel;
	seTransactionData: React.Dispatch<any>;
}) {
	const { api, apiReady } = useGlobalApiContext();
	const { loggedInWallet, address } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const multisigAddresses = activeOrg.multisigs;
	const currentMultisig = multisigAddresses?.find(
		(item) =>
			item.address === selectedMultisig ||
			getEncodedAddress(item.address, item.network) === selectedMultisig ||
			item.proxy === selectedMultisig
	);
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const [submissionDeposit, setSubmissionDeposit] = useState<BN>(ZERO_BN);
	const [error, setError] = useState<string>('');
	const [postData, setPostData] = useState<{ title: string; content: string; index: string }>({
		content: '',
		index: '',
		title: ''
	});
	const [availableBalance, setAvailableBalance] = useState('0');

	const [form] = Form.useForm();
	const formName = 'kill-or-cancel-ref-form';

	const handleSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}
		if (!loggedInWallet || !postData.index) {
			return;
		}
		await setSigner(api, loggedInWallet);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const proposal =
				type === EKillOrCancel.CANCEL
					? api.tx.referenda.cancel(Number(postData.index))
					: api.tx.referenda.kill(Number(postData.index));
			const proposalPreImage = createPreImage(api, proposal);
			const preImageTx = proposalPreImage.notePreimageTx;
			const origin: any = { Origins: PostOrigin.REFERENDUM_CANCELLER };
			const proposalTx = api.tx.referenda.submit(
				origin,
				{ Lookup: { hash: proposalPreImage.preimageHash, len: proposalPreImage.preimageLength } },
				{ After: BN_HUNDRED }
			);
			const mainTx = api.tx.utility.batchAll([preImageTx, proposalTx as any]);

			const data = await executeTx({
				address,
				api,
				apiReady,
				isProxy: isProxySelected,
				multisig: currentMultisig,
				network: currentMultisig?.network,
				setLoadingMessages: (message: string) => {
					setLoadingStatus({ isLoading: true, message });
				},
				tx: mainTx as any
			});
			seTransactionData({ ...data, network: currentMultisig?.network });
		} catch (err) {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', err);
			queueNotification({
				header: 'Failed!',
				message: err.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const getReferendaData = async (index: string) => {
		if (!index) {
			setError('');
			console.log('invalid index');
			return;
		}
		setLoadingStatus({ isLoading: true, message: 'fetching proposal details' });
		try {
			const response = await fetch(`https://${currentMultisig.network}.polkassembly.io/api/v1/getTitleAndContent`, {
				body: JSON.stringify({ index }),
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': '018db5c6-7225-70bc-8b5c-51202c78ec75',
					'x-network': currentMultisig.network
				},
				method: 'POST'
			});
			const data = await response.json();

			if (data.message) {
				setError(data.message);
				console.log({
					content: '',
					index,
					title: ''
				});
				setPostData({
					content: '',
					index,
					title: ''
				});
				return;
			}
			setPostData({ ...data, index });
			setError('');
		} catch (e) {
			setError(e.message);
		} finally {
			setLoadingStatus({ isLoading: false, message: '' });
		}
	};

	useEffect(() => {
		if (!api || !apiReady || !selectedMultisig) return;

		api.query?.system
			?.account(selectedMultisig)
			.then((res) => {
				const balanceStr = res?.data?.free?.toString() || '0';
				setAvailableBalance(balanceStr);
			})
			.catch((e) => console.error(e));
	}, [selectedMultisig, api, apiReady]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDebounceData = useCallback(_.debounce(getReferendaData, 500), []);

	useEffect(() => {
		if (!api || !apiReady) return;
		const userSubmissionDeposit = api?.consts?.referenda?.submissionDeposit || ZERO_BN;
		setSubmissionDeposit(userSubmissionDeposit as any);
	}, [api, apiReady]);

	return (
		<Spin
			spinning={loadingStatus.isLoading}
			indicator={<LoadingLottie message={loadingStatus.message} />}
		>
			<div className='w-full'>
				{new BN(availableBalance || '0').lte(submissionDeposit) && (
					<section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2 mt-2'>
						<WarningCircleIcon />
						<p>
							Please maintain minimum{' '}
							{formatBnBalance(
								String(submissionDeposit.toString()),
								{ numberAfterComma: 3, withUnit: true },
								currentMultisig?.network
							)}{' '}
							balance for these transactions:
						</p>
					</section>
				)}
				<Form
					form={form}
					name={formName}
					onFinish={handleSubmit}
				>
					<div className='mt-3 flex flex-col gap-1'>
						<div className='flex gap-1 items-center'>
							<label className='text-primary font-normal text-xs leading-[13px] block'>
								<span className='flex items-center'>Referenda Index</span>
							</label>
							<HelperTooltip
								text={
									type === EKillOrCancel.CANCEL
										? 'Enter referendum number you want to cancel'
										: 'Enter referendum number you want to kill'
								}
							/>
						</div>
						<Form.Item
							name='referenda-index'
							rules={[
								{
									message: 'Please enter referenda index',
									required: true
								},
								{
									validator: (__, value) => {
										if (!value || (value && Number(value) > -1)) {
											return Promise.resolve();
										}
										return Promise.reject(new Error('Please enter a positive number'));
									}
								}
							]}
						>
							<Input
								type='number'
								className='rounded-md px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								placeholder='Enter Referenda Index'
								onChange={(e) => handleDebounceData(e.target.value)}
							/>
						</Form.Item>
					</div>
				</Form>

				{loadingStatus.isLoading && (
					<div className='flex flex-col items-center justify-center'>
						{/* <Loader /> */}
						{loadingStatus.isLoading && (
							<span className='text-pink_primary dark:text-pink-dark-primary'>{loadingStatus.message}</span>
						)}
					</div>
				)}
				{!error && !loadingStatus.isLoading && postData && (postData?.title || postData?.content) && (
					<>
						<Form
							name='post-content-form'
							layout='vertical'
							initialValues={postData}
						>
							<div className='flex flex-col gap-1'>
								<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
									<span className='flex items-center'>Title</span>
								</label>
								<Form.Item name='title'>
									<Input
										defaultValue={postData?.title}
										value={postData?.title}
										className='rounded-md py-2 text-black opacity-70 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										disabled
									/>
								</Form.Item>
							</div>
							<div className='flex flex-col gap-1'>
								<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
									<span className='flex items-center'>Content</span>
								</label>
								<Markdown
									imgHidden
									className='post-content cursor-not-allowed rounded-md border-[1px] border-solid border-[#dddddd] bg-[#f5f5f5] px-3 py-2 opacity-70 dark:border-[#3B444F] dark:bg-section-dark-overlay
								dark:text-blue-dark-high '
									md={postData.content}
								/>
							</div>
						</Form>
						<div className='mt-6 flex items-center justify-end space-x-3'>
							<PrimaryButton
								onClick={handleSubmit}
								className='w-min'
								disabled={new BN(availableBalance || '0').lte(submissionDeposit)}
							>
								{type === EKillOrCancel.CANCEL ? 'Cancel' : 'Kill'} Referendum
							</PrimaryButton>
						</div>
					</>
				)}
				{error && postData.index && <span className='text-[#FF4D4F]'>{error}</span>}
			</div>
		</Spin>
	);
}
