// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { SafeInfoResponse } from '@safe-global/api-kit';
import React, { useState } from 'react';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import AddBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { IMultisigAddress, ISharedAddressBookRecord, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import { EVM_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { useActiveMultisigContext } from '@next-evm/context/ActiveMultisigContext';
import { NETWORK } from '@next-common/global/evm-network-constants';
import NameAddress from './NameAddress';
import SelectNetwork from './SelectNetwork';
import Owners from './Owners';
import Review from './Review';

interface ISignatory {
	name: string;
	address: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const LinkMultisig = ({ onCancel }: { onCancel: () => void }) => {
	const [multisigName, setMultisigName] = useState('');
	const [nameAddress, setNameAddress] = useState(true);
	const [viewOwners, setViewOwners] = useState(true);
	const [viewReviews, setViewReviews] = useState(true);
	const { address, addressBook, gnosisSafe, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { setActiveMultisigContextState } = useActiveMultisigContext();
	const [network, setNetwork] = useState<NETWORK>(NETWORK.ETHEREUM);

	const [multisigAddress, setMultisigAddress] = useState<string>('');

	const [multisigInfo, setMultisigInfo] = useState<SafeInfoResponse | null>(null);

	const [multisigData, setMultisigData] = useState<IMultisigAddress>();

	const [loading, setLoading] = useState<boolean>(false);

	const [signatoriesWithName, setSignatoriesWithName] = useState<ISignatory[]>([]);

	const [signatoriesArray, setSignatoriesArray] = useState<ISignatory[]>([
		{ address, name: addressBook?.find((item: any) => item.address === address)?.name || '' },
		{ address: '', name: '' }
	]);
	const [threshold, setThreshold] = useState<number>(2);

	const viewNameAddress = () => {
		setNameAddress(false);
	};

	const handleViewOwners = async () => {
		try {
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
				setLoading(false);
			} else {
				const info = await gnosisSafe.getMultisigData(multisigAddress);
				setMultisigInfo(info);

				// const getMultisigDataRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigDataByMultisigAddress`, {
				// 	body: JSON.stringify({
				// 		multisigAddress,
				// 		network
				// 	}),
				// 	headers: firebaseFunctionsHeader(network),
				// 	method: 'POST'
				// });

				// const { data: multisigDataRes, error: multisigError } = await getMultisigDataRes.json() as { data: IMultisigAddress, error: string };

				// if(multisigError) {

				// 	queueNotification({
				// 		header: 'Error!',
				// 		message: multisigError,
				// 		status: NotificationStatus.ERROR
				// 	});
				// 	setLoading(false);
				// 	return;
				// }

				if (info) {
					setLoading(false);
					setNameAddress(false);
					setViewOwners(false);
					setThreshold(info.threshold);
					setSignatoriesArray(info.owners.map((a: any) => ({ name: '', address: a })));
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const checkMultisig = (signatories: ISignatory[]) => {
		const signatoryAddresses = signatories.map((item) => item.address);

		setMultisigData((prevState) => {
			return {
				...prevState,
				name: multisigName,
				address: multisigAddress,
				signatories: signatoryAddresses,
				threshold,
				network,
				created_at: new Date()
			};
		});
		setSignatoriesWithName(signatories);
		setNameAddress(false);
		setViewOwners(false);
		setViewReviews(false);
	};

	const handleLinkMultisig = async () => {
		setLoading(true);
		if (multisigData) {
			try {
				const { data: createMultisigData, error: multisigError } = await nextApiClientFetch<IMultisigAddress>(
					`${EVM_API_URL}/createMultisigEth`,
					{
						signatories: signatoriesArray.map((item) => item.address),
						threshold,
						multisigName,
						safeAddress: multisigInfo?.address,
						addressBook
					},
					{ network }
				);

				onCancel();
				if (createMultisigData && !multisigError) {
					queueNotification({
						header: 'Success!',
						message: 'Multisig Linked Successfully.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							activeMultisig: multisigData.address,
							multisigAddresses:
								prevState.multisigSettings && Object.keys(prevState.multisigSettings).includes(multisigData.address)
									? [...(prevState?.multisigAddresses || [])]
									: [...(prevState?.multisigAddresses || []), multisigData],
							multisigSettings: {
								...prevState.multisigSettings,
								[`${multisigData.address}`]: {
									name: multisigData.name,
									deleted: false
								}
							}
						};
					});
					const newRecords: { [address: string]: ISharedAddressBookRecord } = {};
					multisigData.signatories.forEach((signatory) => {
						const data = addressBook.find((a) => a.address === signatory);
						newRecords[signatory] = {
							address: signatory,
							name: data?.name || DEFAULT_ADDRESS_NAME,
							email: data?.email,
							discord: data?.discord,
							telegram: data?.telegram,
							roles: data?.roles
						};
					});
					setActiveMultisigContextState((prev) => ({
						...prev,
						records: newRecords,
						multisig: multisigData.address
					}));
				}
			} catch (err) {
				console.log(err);
				queueNotification({
					header: 'Error!',
					message: 'Invalid Multisig',
					status: NotificationStatus.ERROR
				});
			}
		} else {
			queueNotification({
				header: 'Error!',
				message: 'Invalid Multisig',
				status: NotificationStatus.ERROR
			});
		}

		setLoading(false);
	};

	return nameAddress ? (
		<div>
			<SelectNetwork
				network={network}
				setNetwork={setNetwork}
			/>
			<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
				<CancelBtn onClick={onCancel} />
				<AddBtn
					title='Continue'
					onClick={viewNameAddress}
				/>
			</div>
		</div>
	) : (
		<div>
			{viewOwners ? (
				<div>
					<NameAddress
						network={network}
						multisigName={multisigName}
						setMultisigName={setMultisigName}
						setMultisigAddress={setMultisigAddress}
					/>
					<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
						<CancelBtn onClick={onCancel} />
						<AddBtn
							disabled={!multisigAddress || !multisigName}
							title='Continue'
							loading={loading}
							onClick={handleViewOwners}
						/>
					</div>
				</div>
			) : (
				<div>
					{viewReviews ? (
						<div>
							<Owners
								signatoriesArray={signatoriesArray}
								setSignatoriesWithName={setSignatoriesArray}
							/>
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={onCancel} />

								<AddBtn
									disabled={
										signatoriesArray.length < 1 ||
										threshold > signatoriesArray.length ||
										signatoriesArray.some((item) => item.address === '')
									}
									title='Continue'
									onClick={() => checkMultisig(signatoriesArray)}
								/>
							</div>
						</div>
					) : (
						<div>
							<Review
								multisigName={multisigName}
								multisigData={multisigData}
								signatories={signatoriesWithName}
							/>
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={onCancel} />
								<AddBtn
									loading={loading}
									title='Link Multisig'
									onClick={handleLinkMultisig}
								/>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default LinkMultisig;
