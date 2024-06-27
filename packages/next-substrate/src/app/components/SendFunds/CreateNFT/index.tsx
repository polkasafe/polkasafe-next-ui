import { networks } from '@next-common/global/networkConstants';
import AddressComponent from '@next-common/ui-components/AddressComponent';

import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';

import React, { useEffect, useState } from 'react';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { ApiPromise } from '@polkadot/api';
import queueNotification from '@next-common/ui-components/QueueNotification';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import setSigner from '@next-substrate/utils/setSigner';
import Loader from '@next-common/ui-components/Loader';
import { handleUploadData, handleUploadImage } from './uploadToIpfs';
import { getCollectionsByOwner, getNextCollectionId } from './utils/getAllCollectionByAddress';
import executeTx from '../../Apps/CreateProposal/utils/executeTx';
import CreateNFTForm from './components/CreateNFTForm';
import CreateCollectionForm from './components/CreateCollectionForm';

function CreateNFT() {
	const { apis } = useGlobalApiContext();
	const { activeOrg } = useActiveOrgContext();
	const { activeMultisig, address, loggedInWallet } = useGlobalUserDetailsContext();
	const [selectedProxyName, setSelectedProxyName] = useState<string>('');
	const [selectedMultisig, setSelectedMultisig] = useState<string>(
		activeMultisig || activeOrg?.multisigs?.[0]?.address || ''
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [multisigBalance, setMultisigBalance] = useState<string>('');

	const [fileList, setFileList] = useState([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [nftFormState, setNftFormState] = useState({
		attributes: '',
		description: '',
		name: ''
	});

	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const [isProxy, setIsProxy] = useState<boolean>(false);
	const [collection, setCollection] = useState<Array<any>>(null);
	const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
	const multisig = activeOrg?.multisigs?.find(
		(item) => item.address === selectedMultisig || checkMultisigWithProxy(item.proxy, selectedMultisig)
	);

	const [showCreateCollection, setShowCreateCollection] = useState<boolean>(false);

	const multisigOptionsWithProxy: IMultisigAddress[] = [];

	activeOrg?.multisigs?.forEach((item) => {
		if (item.proxy) {
			if (typeof item.proxy === 'string') {
				multisigOptionsWithProxy.push({ ...item, proxy: item.proxy });
			} else {
				item.proxy.map((mp) =>
					multisigOptionsWithProxy.push({ ...item, name: mp.name || item.name, proxy: mp.address })
				);
			}
		}
	});

	console.log(multisigOptionsWithProxy);

	const multisigOptions: ItemType[] = multisigOptionsWithProxy?.map((item) => ({
		key: JSON.stringify({ ...item, isProxy: true }),
		label: (
			<AddressComponent
				isMultisig
				isProxy
				name={item.name}
				showNetworkBadge
				network={item.network}
				withBadge={false}
				address={item.proxy as string}
			/>
		)
	}));

	activeOrg?.multisigs?.forEach((item) => {
		multisigOptions.push({
			key: JSON.stringify({ ...item, isProxy: false }),
			label: (
				<AddressComponent
					isMultisig
					showNetworkBadge
					network={item.network}
					withBadge={false}
					address={item.address}
				/>
			)
		});
	});

	const network = activeOrg?.multisigs?.filter((m) => m.address === selectedMultisig)?.[0].network;

	const onFileChange = (info) => {
		const f = [...info.fileList].slice(-1);
		setFileList(f);
	};

	const handleSubmit = async (values: any) => {
		const { name, description, attributes } = values;
		setLoading(true);

		const jsonData = {
			attributes: {},
			description,
			image: '',
			name
		};
		attributes.split(',').forEach((attr) => {
			const [key, value] = attr.split(':').map((item) => item.trim());
			jsonData.attributes[key] = value;
		});

		try {
			// Upload Image first and add URL to JSON
			const imageUrl = await handleUploadImage(fileList[0].originFileObj);
			jsonData.image = imageUrl;

			// Now upload the full JSON
			const hash = await handleUploadData(jsonData);
			const jsonUrl = `https://rose-select-sole-942.mypinata.cloud/ipfs/${hash}`;
			console.log(jsonUrl);
			if (!jsonUrl || !imageUrl) {
				queueNotification({
					header: 'Error',
					// eslint-disable-next-line sonarjs/no-duplicate-string
					message: 'Failed to upload data',
					status: NotificationStatus.ERROR
				});
				return;
			}
			const api = apis[network].api as ApiPromise;
			const itemId = (collection.filter((col) => col.id === selectedCollection)[0]?.items || 0) + 1;

			const mintTx = api.tx.nfts.mint(selectedCollection, itemId, selectedMultisig, null);
			const setMetaDataTx = api.tx.nfts.setMetadata(selectedCollection, itemId, jsonUrl);

			const tx = api.tx.utility.batchAll([mintTx, setMetaDataTx]);

			await setSigner(api, loggedInWallet, network);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const queueItemData = await executeTx({
				address,
				api: apis[network].api,
				apiReady: apis[network].apiReady,
				isProxy,
				multisig,
				network,
				setLoadingMessages,
				tip: '0',
				tx
			});
			setLoading(false);
		} catch (error) {
			queueNotification({
				header: 'Error',
				message: error || error.message || 'Failed to upload data',
				status: NotificationStatus.ERROR
			});
			console.log('Error uploading data: ', error);
		}
	};

	const handleCreateCollectionSubmit = async (values: any) => {
		const { name, description } = values;
		setLoading(true);

		const jsonData = {
			description,
			image: '',
			name
		};
		try {
			// Upload Image first and add URL to JSON
			const imageUrl = await handleUploadImage(fileList[0].originFileObj);
			jsonData.image = imageUrl;

			// Now upload the full JSON
			const hash = await handleUploadData(jsonData);
			// const jsonUrl = `https://rose-select-sole-942.mypinata.cloud/ipfs/${hash}`;
			if (!imageUrl || !hash) {
				queueNotification({
					header: 'Error',
					message: 'Failed to upload data',
					status: NotificationStatus.ERROR
				});
				return;
			}
			const api = apis[network].api as ApiPromise;
			const createTx = api.tx.nfts.create(selectedMultisig, {
				maxSupply: null,
				mintSettings: {
					defaultItemSettings: 0,
					endBlock: null,
					mintType: { Issuer: null },
					price: null,
					startBlock: null
				},
				settings: 0
			});
			const collectionId = await getNextCollectionId(api);
			const setMetaDataTx = api.tx.nfts.setCollectionMetadata(collectionId, hash);

			const tx = api.tx.utility.batchAll([createTx, setMetaDataTx]);

			await setSigner(api, loggedInWallet, network);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const queueItemData = await executeTx({
				address,
				api: apis[network].api,
				apiReady: apis[network].apiReady,
				isProxy,
				multisig,
				network,
				setLoadingMessages,
				tip: '0',
				tx
			});
			setLoading(false);
		} catch (error) {
			queueNotification({
				header: 'Error',
				message: error || error.message || 'Failed to upload data',
				status: NotificationStatus.ERROR
			});
			console.log('Error uploading data: ', error);
		}
	};

	useEffect(() => {
		setLoading(true);
		getCollectionsByOwner(apis[network].api, selectedMultisig)
			.then((data) => {
				console.log(data, 'collection owner');
				setCollection(data);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [apis, network, selectedMultisig]);

	console.log(collection && collection.length > 0, 'selectedCollection');

	return (
		<div className='m-auto w-full'>
			{loading ? (
				<div className='w-full min-h-[300px]'>
					<Loader
						size='large'
						text={loadingMessages}
						className='mt-28'
					/>
				</div>
			) : [networks.STATEMINE, networks.STATEMINT].includes(network) ? (
				collection && collection.length > 0 && !showCreateCollection ? (
					<CreateNFTForm
						onClickCreateCollection={setShowCreateCollection}
						handleSubmit={handleSubmit}
						collection={collection || []}
						onFileChange={onFileChange}
						loading={loading}
						selectedMultisig={selectedMultisig}
						setSelectedMultisig={setSelectedMultisig}
						setIsProxy={setIsProxy}
						setSelectedProxyName={setSelectedProxyName}
						setMultisigBalance={setMultisigBalance}
						selectedCollection={selectedCollection}
						setSelectedCollection={setSelectedCollection}
						isProxy={isProxy}
						selectedProxyName={selectedProxyName}
						network={network}
						multisigOptions={multisigOptions}
						apis={apis}
					/>
				) : (
					<CreateCollectionForm
						handleSubmit={handleCreateCollectionSubmit}
						onFileChange={onFileChange}
						collection={collection || []}
						loading={loading}
						selectedMultisig={selectedMultisig}
						setSelectedMultisig={setSelectedMultisig}
						setIsProxy={setIsProxy}
						setSelectedProxyName={setSelectedProxyName}
						setMultisigBalance={setMultisigBalance}
						isProxy={isProxy}
						selectedProxyName={selectedProxyName}
						network={network}
						multisigOptions={multisigOptions}
						apis={apis}
					/>
				)
			) : (
				<p className='text-text_main'>This multisigs does not support nft creation</p>
			)}
		</div>
	);
}

export default CreateNFT;
