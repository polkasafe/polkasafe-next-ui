// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import React, { useState } from 'react';
import CancelBtn from '@next-substrate/app/components/Multisig/CancelBtn';
import AddBtn from '@next-substrate/app/components/Multisig/ModalBtn';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import { chainProperties } from '@next-common/global/networkConstants';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import _createMultisig from '@next-substrate/utils/_createMultisig';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';

import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
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
	const { address, addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const [multisigAddress, setMultisigAddress] = useState<string>('');

	const [multisigData, setMultisigData] = useState<IMultisigAddress>();

	const [loading, setLoading] = useState<boolean>(false);

	const [signatoriesWithName, setSignatoriesWithName] = useState<ISignatory[]>([]);

	const [signatoriesArray, setSignatoriesArray] = useState<ISignatory[]>([
		{ address, name: addressBook?.find((item) => item.address === address)?.name || '' },
		{ address: '', name: '' }
	]);
	const [threshold, setThreshold] = useState<number>(2);

	const viewNameAddress = () => {
		setNameAddress(false);
	};

	const handleMultisigBadge = async (signatories: string[], multisigThreshold: number, multiName: string) => {
		try {
			// const signature = localStorage.getItem('signature');

			if (!address) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			const substrateAddress = getSubstrateAddress(address);
			if (!signatories.map((add) => getSubstrateAddress(add)).includes(substrateAddress || '')) {
				queueNotification({
					header: 'Error!',
					message: 'Signatories does not have your Address.',
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}
			let proxyAddress = null;
			if (!['alephzero'].includes(network)) {
				const response = await fetch(`https://${network}.api.subscan.io/api/scan/events`, {
					body: JSON.stringify({
						row: 1,
						page: 0,
						module: 'proxy',
						call: 'PureCreated',
						address: multisigAddress
					}),
					headers: SUBSCAN_API_HEADERS,
					method: 'POST'
				});

				const responseJSON = await response.json();
				if (responseJSON.data.count !== 0) {
					const params = JSON.parse(responseJSON.data?.events[0]?.params);
					proxyAddress = getEncodedAddress(params[0]?.value, network);
				}
			}
			const { data: createMultisigData, error: multisigError } = await nextApiClientFetch<IMultisigAddress>(
				`${SUBSTRATE_API_URL}/createMultisig`,
				{
					signatories,
					threshold: multisigThreshold,
					multisigName: multiName,
					proxyAddress
				}
			);

			if (multisigError) {
				queueNotification({
					header: 'Error!',
					message: multisigError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if (createMultisigData) {
				queueNotification({
					header: 'Success!',
					message: 'Multisig Linked',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				onCancel();
				setUserDetailsContextState((prevState) => {
					return {
						...prevState,
						activeMultisig: createMultisigData.address,
						multisigAddresses: [...(prevState?.multisigAddresses || []), createMultisigData],
						multisigSettings: {
							...prevState?.multisigSettings,
							[`${createMultisigData.address}_${createMultisigData.network}`]: {
								name: multiName,
								deleted: false
							}
						}
					};
				});
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleViewOwners = async () => {
		try {
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
				setLoading(false);
			} else {
				const { data: multisigDataRes, error: multisigError } = await nextApiClientFetch<IMultisigAddress>(
					`${SUBSTRATE_API_URL}/getMultisigDataByMultisigAddress`,
					{
						multisigAddress,
						network
					}
				);

				if (multisigError) {
					queueNotification({
						header: 'Error!',
						message: multisigError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if (multisigDataRes) {
					setLoading(false);

					setMultisigData(multisigDataRes);
					const signatoryArray = multisigDataRes.signatories.map((a: string) => {
						return {
							address: a,
							name: ''
						};
					});
					setSignatoriesWithName(
						signatoryArray.map((signatory) => {
							const signatoryAddress = getEncodedAddress(signatory.address, network);
							return {
								...signatory,
								name: addressBook.find((item) => item.address === signatoryAddress)?.name || '',
								address: signatoryAddress || signatory.address
							};
						})
					);
					setNameAddress(false);
					setViewOwners(false);
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleViewReviews = () => {
		setNameAddress(false);
		setViewOwners(false);
		setViewReviews(false);
	};

	const checkMultisig = (signatories: ISignatory[]) => {
		const signatoryAddresses = signatories.map((item) => item.address);
		const response = _createMultisig(signatoryAddresses, threshold, chainProperties[network].ss58Format);
		if (
			response &&
			response.multisigAddress &&
			getEncodedAddress(response.multisigAddress, network) === multisigAddress
		) {
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
		} else {
			queueNotification({
				header: 'Error!',
				message: 'No Multisig found with these Signatories.',
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleLinkMultisig = () => {
		setLoading(true);
		if (multisigData) {
			const name = multisigName || multisigData?.name || DEFAULT_MULTISIG_NAME;
			handleMultisigBadge(multisigData.signatories, multisigData.threshold, name);
		} else {
			queueNotification({
				header: 'Error!',
				message: 'Invalid Multisig',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	return nameAddress ? (
		<div>
			<SelectNetwork />
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
						multisigName={multisigName}
						setMultisigName={setMultisigName}
						multisigAddress={multisigAddress}
						setMultisigAddress={setMultisigAddress}
					/>
					<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
						<CancelBtn onClick={onCancel} />
						<AddBtn
							disabled={!multisigAddress || !getSubstrateAddress(multisigAddress)}
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
								multisigThreshold={multisigData?.threshold}
								threshold={threshold}
								setThreshold={setThreshold}
								setSignatoriesArray={setSignatoriesArray}
								signatoriesArray={signatoriesArray}
								signatories={signatoriesWithName}
								setSignatoriesWithName={setSignatoriesWithName}
							/>
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={onCancel} />
								{signatoriesWithName.length && multisigData?.threshold ? (
									<AddBtn
										title='Continue'
										onClick={handleViewReviews}
									/>
								) : (
									<AddBtn
										disabled={
											signatoriesArray.length < 2 ||
											threshold < 2 ||
											threshold > signatoriesArray.length ||
											signatoriesArray.some((item) => item.address === '')
										}
										title='Check Multisig'
										onClick={() => checkMultisig(signatoriesArray)}
									/>
								)}
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
