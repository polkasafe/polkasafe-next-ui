/* eslint-disable consistent-return */
import { ApiPromise } from '@polkadot/api';

export const getCollectionsByOwner = async (api: ApiPromise, ownerAddress: string) => {
	// Get all collection IDs
	try {
		// const collectionCount = await api.query.nfts.collectionAccount(ownerAddress);
		// console.log(collectionCount.toJSON(), 'from getCollectionsByOwner');
		const collectionCount2 = await api.query.nfts.nextCollectionId();
		console.log(collectionCount2.toJSON());
		const array = new Array(collectionCount2.toJSON()).fill(0);
		const allCollections = [];
		const collectionPromise = array.map(async (item, index) => {
			try {
				const collectionDetails = await api.query.nfts.collection(index);
				const data = collectionDetails.toJSON() as any;
				if (data.owner === ownerAddress) {
					data.id = index;
					allCollections.push(data);
				}
			} catch (error) {
				console.log(error);
			}
		});
		await Promise.all(collectionPromise);
		return allCollections;
	} catch (error) {
		console.log(error);
	}
	console.log('Collections created by toJon:');
};

export const getNextCollectionId = async (api: ApiPromise) => {
	try {
		const collectionCount = await api.query.nfts.nextCollectionId();
		console.log(collectionCount.toJSON(), 'from getNextCollectionId');
		return collectionCount.toJSON() as any;
	} catch (error) {
		console.log(error);
	}
};
