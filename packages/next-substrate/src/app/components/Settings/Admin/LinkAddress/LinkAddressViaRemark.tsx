import { Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import copyText from '@next-substrate/utils/copyText';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NotificationStatus } from '@next-common/types';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import ModalBtn from '../../ModalBtn';
import CancelBtn from '../../CancelBtn';

const LinkAddressViaRemark = ({ onCancel }: { onCancel: () => void }) => {
	const [txHash, setTxHash] = useState<string>('');
	const [validHash, setValidHash] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(false);
	const { address, setUserDetailsContextState } = useGlobalUserDetailsContext();

	useEffect(() => {
		if (txHash.startsWith('0x')) {
			setValidHash(true);
		} else {
			setValidHash(false);
		}
	}, [txHash]);

	const linkAddress = async () => {
		if (!txHash || !address) return;

		try {
			setLoading(true);

			const linkAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/linkAddressWithRemark`, {
				body: JSON.stringify({
					hash: txHash,
					network: 'polkadot'
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: linkAddressData, error: linkAddressError } = (await linkAddressRes.json()) as {
				data: string;
				error: string;
			};

			if (!linkAddressError && linkAddressData) {
				setLoading(false);
				queueNotification({
					header: 'Success!',
					message: 'You Address has been Linked',
					status: NotificationStatus.SUCCESS
				});
				setUserDetailsContextState((prev) => ({
					...prev,
					linkedAddresses: [...(prev.linkedAddresses || []), linkAddressData]
				}));
				onCancel();
			} else {
				setLoading(false);
				queueNotification({
					header: 'Error!',
					message: linkAddressError,
					status: NotificationStatus.ERROR
				});
			}
		} catch (error) {
			console.log('error', error);
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message: 'Something Went Wrong',
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<Form className='w-[600px]'>
			<p className='text-white mb-4'>
				Please add a remark with the text:{' '}
				<code
					className='mx-1 cursor-copy rounded-md px-2 py-1 leading-5 bg-highlight'
					onClick={() => copyText(`PolkasafeUser:${address}`)}
				>
					PolkasafeUser:{shortenAddress(address)}
				</code>{' '}
				from the address to link and input the transaction hash below.
			</p>
			<Form.Item
				name='hash'
				rules={[{ message: 'Txn Hash Required', required: true }]}
				validateStatus={txHash && !validHash ? 'error' : 'success'}
				help={txHash && !validHash && 'Please enter a valid txn hash'}
				className='border-0 outline-0 my-0 p-0'
			>
				<Input
					placeholder='Transaction Hash'
					className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
					id='hash'
					onChange={(e) => setTxHash(e.target.value)}
					value={txHash}
					disabled={loading}
				/>
			</Form.Item>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn
					onClick={onCancel}
					disabled={loading}
				/>
				<ModalBtn
					loading={loading}
					disabled={!txHash || !validHash}
					title='Link Address'
					onClick={linkAddress}
				/>
			</div>
		</Form>
	);
};

export default LinkAddressViaRemark;
