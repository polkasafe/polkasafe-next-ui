/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EProposalType, ENetwork, ETransactionCreationType } from '@common/enum/substrate';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { BN } from '@polkadot/util';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import { useCallback, useEffect, useState } from 'react';
import { Form, Spin, Tooltip } from 'antd';
import _ from 'lodash';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { DangerTriangleIcon, OutlineCloseIcon } from '@common/global-ui-components/Icons';
import formatBnBalance from '@common/utils/formatBnBalance';
import { InfoCircleOutlined } from '@ant-design/icons';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import Markdown from '@common/global-ui-components/Markdown';
import { useDashboardContext } from '@common/context/DashboarcContext';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { MultisigDropdown } from '@common/global-ui-components/MultisigDropdown';
import { findMultisig } from '@common/utils/findMultisig';
import { IMultisig } from '@common/types/substrate';
import Input from '@common/global-ui-components/Input';

const ZERO_BN = new BN(0);

export function ManualProposal({ proposalType, onClose }: { proposalType: EProposalType; onClose: () => void }) {
	const { getApi } = useAllAPI();
	const { multisigs, buildTransaction, assets } = useDashboardContext();
	const notification = useNotification();
	const [loading, setLoading] = useState(false);
	const [submissionDeposit, setSubmissionDeposit] = useState<BN | null>(null);
	const [error, setError] = useState<string>('');
	const [postData, setPostData] = useState<{ title: string; content: string; index: string }>({
		content: '',
		index: '',
		title: ''
	});
	const [selectedMultisig, setSelectedMultisigDetails] = useState<{
		address: string;
		network: ENetwork;
		name: string;
		proxy?: string;
	}>({
		address: multisigs[0].address,
		network: multisigs[0].network,
		name: multisigs[0].name
	});
	const apiAtom = getApi(selectedMultisig?.network);
	const api = apiAtom?.api;
	const [availableBalance, setAvailableBalance] = useState<BN | null>(null);
	const formName = 'kill-or-cancel-ref-form';

	const handleSubmit = async () => {
		if (!api) {
			return;
		}

		if (!postData.index || !selectedMultisig || !error) {
			return;
		}
		setLoading(true);
		try {
			const multisigId = `${selectedMultisig.address}_${selectedMultisig.network}`;
			const payload = {
				sender: findMultisig(multisigs, multisigId) as IMultisig,
				proxyAddress: selectedMultisig.proxy,
				type: ETransactionCreationType.CREATE_PROPOSAL,
				proposalType,
				postIndex: postData.index
			};

			await buildTransaction(payload);
		} catch (err) {
			console.log(':( transaction failed');
			console.error('ERROR:', err);
			notification(ERROR_MESSAGES.INVALID_TRANSACTION);
		} finally {
			setLoading(false);
		}
	};

	const getReferendaData = async (index: string) => {
		if (!index) {
			setError('');
			console.log('invalid index');
			return;
		}
		if (!selectedMultisig) return;
		setLoading(true);
		try {
			const response = await fetch(`https://${selectedMultisig.network}.polkassembly.io/api/v1/getTitleAndContent`, {
				body: JSON.stringify({ index }),
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': '018db5c6-7225-70bc-8b5c-51202c78ec75',
					'x-network': selectedMultisig?.network
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
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!api || !selectedMultisig) return;

		api.query?.system
			?.account(selectedMultisig.proxy || selectedMultisig.address)
			.then((res: any) => {
				const balanceStr = res?.data?.free?.toString() || '0';
				setAvailableBalance(balanceStr);
			})
			.catch((e) => console.error(e));
	}, [selectedMultisig, api]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDebounceData = useCallback(_.debounce(getReferendaData, 500), []);

	useEffect(() => {
		if (!api) return;
		const userSubmissionDeposit = api?.consts?.referenda?.submissionDeposit || ZERO_BN;
		setSubmissionDeposit(userSubmissionDeposit as any);
	}, [api]);

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={150}
					message='loading...'
				/>
			}
		>
			<div className='w-full mt-4'>
				{availableBalance && submissionDeposit && new BN(availableBalance).lt(submissionDeposit) && (
					<section className='mb-2 text-sm border border-waiting bg-[#ff9f1c]/[0.1] p-3 px-2 rounded-lg flex items-center gap-x-2 my-3'>
						<DangerTriangleIcon className='text-waiting text-lg' />
						<Typography variant={ETypographyVariants.p}>
							Please maintain minimum{' '}
							{formatBnBalance(
								String(submissionDeposit.toString()),
								{ numberAfterComma: 3, withUnit: true },
								selectedMultisig?.network || ''
							)}{' '}
							balance for these transactions:
						</Typography>
					</section>
				)}
				<Form name={formName}>
					<div>
						<Typography
							variant={ETypographyVariants.p}
							className='text-label font-normal mb-2 text-xs leading-[13px] flex items-center justify-between max-sm:w-full text-primary'
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

					<div className='mt-3 flex flex-col gap-1'>
						<div className='flex gap-1 items-center'>
							<Typography
								variant={ETypographyVariants.p}
								className='text-label font-normal text-xs leading-[13px] flex items-center justify-between max-sm:w-full text-primary'
							>
								Referenda Index*
							</Typography>
							<Tooltip
								title={
									proposalType === EProposalType.CANCEL
										? 'Enter referendum number you want to cancel'
										: 'Enter referendum number you want to kill'
								}
								getPopupContainer={(triggerNode) => triggerNode}
								className='text-primary'
							>
								<InfoCircleOutlined />
							</Tooltip>
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
							className='mb-1'
						>
							<Input
								type='number'
								placeholder='Enter Referenda Index'
								onChange={(e) => handleDebounceData(e.target.value)}
							/>
						</Form.Item>
					</div>
				</Form>
				{!loading && postData.index && postData.content && postData.title && (
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
				)}
				{error && postData.index && <span className='text-[#FF4D4F] text-xs'>{error}</span>}
				<div className='flex items-center gap-x-4 w-full mt-2'>
					<div className='w-full'>
						<Button
							fullWidth
							size='large'
							onClick={onClose}
							variant={EButtonVariant.DANGER}
							icon={<OutlineCloseIcon className='text-failure' />}
						>
							Cancel
						</Button>
					</div>
					<div className='w-full mt-4'>
						<Button
							fullWidth
							disabled={
								!(
									new BN(availableBalance || ZERO_BN).lt(submissionDeposit || ZERO_BN) &&
									!postData.index &&
									!selectedMultisig &&
									!error &&
									Boolean(postData.title) &&
									Boolean(postData.content)
								)
							}
							htmlType='submit'
							size='large'
							variant={EButtonVariant.PRIMARY}
							onClick={handleSubmit}
						>
							{proposalType === EProposalType.CANCEL ? 'Cancel' : 'Kill'} Referendum
						</Button>
					</div>
				</div>
			</div>
		</Spin>
	);
}
