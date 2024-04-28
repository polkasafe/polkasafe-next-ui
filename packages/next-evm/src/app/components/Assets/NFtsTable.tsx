// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { INFTAsset } from '@next-common/types';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { chainProperties } from 'next-common/global/evm-network-constants';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import openseaLogo from '@next-common/assets/icons/opensea-logo.png';
import zerionLogo from '@next-common/assets/icons/zerion-logo.png';
import Image from 'next/image';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import SendFundsForm, { ETransactionTypeEVM } from '../SendFunds/SendFundsForm';
import NoAssets from './NoAssets';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

interface IAssetsProps {
	nfts: { [multisigAddress: string]: INFTAsset[] };
}
const NFTsTable: FC<IAssetsProps> = ({ nfts }) => {
	const [openTransactionModal, setOpenTransactionModal] = useState(false);
	const { activeOrg } = useActiveOrgContext();
	const { notOwnerOfSafe, activeMultisig } = useGlobalUserDetailsContext();
	const [selectedNFT, setSeletedNFT] = useState<INFTAsset>();

	const [viewNFT, setViewNFT] = useState<boolean>(false);

	const [allOrgNFTs, setAllOrgNFTs] = useState<INFTAsset[]>([]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-unused-collection
		const allNfts: INFTAsset[] = [];
		if (!activeOrg || !activeOrg.multisigs || activeOrg.multisigs.length === 0) return;

		activeOrg.multisigs.forEach((item) => {
			if (nfts[item.address]) {
				nfts[item.address].forEach((n) => {
					allNfts.push(n);
				});
			}
		});
		setAllOrgNFTs(allNfts);
	}, [activeOrg, nfts]);

	const nftsArray = activeMultisig ? nfts[activeMultisig] : allOrgNFTs;

	return (
		<div className='text-sm font-medium leading-[15px]'>
			<ModalComponent
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Send Funds</h3>}
				open={openTransactionModal}
				onCancel={() => setOpenTransactionModal(false)}
			>
				<SendFundsForm
					transactionType={ETransactionTypeEVM.SEND_NFT}
					onCancel={() => setOpenTransactionModal(false)}
					defaultNFT={selectedNFT}
				/>
			</ModalComponent>
			{selectedNFT && (
				<ModalComponent
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>{selectedNFT.name}</h3>}
					open={viewNFT}
					onCancel={() => setViewNFT(false)}
				>
					<div className='flex flex-col justify-center items-center text-white text-lg gap-y-4'>
						<Image
							height={300}
							width={300}
							className='rounded-md'
							src={selectedNFT.imageUri}
							alt={selectedNFT.tokenNameWithID}
						/>
						<p>{selectedNFT.tokenNameWithID}</p>
					</div>
				</ModalComponent>
			)}
			<article className='grid grid-cols-4 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>Collection</span>
				<span className='col-span-1'>Token ID</span>
				<span className='col-span-1'>Links</span>
				<span className='col-span-1'>Action</span>
			</article>
			{nfts && nftsArray.length > 0 ? (
				nftsArray?.map((nft, index) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { tokenAddress, tokenNameWithID, name, imageUri, tokenId, logoURI, network } = nft;
					return (
						<>
							<article
								onClick={() => {
									setSeletedNFT(nft);
									setViewNFT(true);
								}}
								className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white cursor-pointer'
								key={index}
							>
								<div className='col-span-1 flex items-center gap-x-2'>
									<Image
										height={50}
										width={50}
										className='rounded-md'
										src={imageUri}
										alt={tokenNameWithID}
									/>
									<div>
										<p
											title={name}
											className='hidden sm:block max-w-md text-ellipsis overflow-hidden mb-1'
										>
											{name}
										</p>
										<p className='text-xs text-text_secondary flex items-center gap-x-2'>
											<span>{shortenAddress(tokenAddress)}</span>
											<button
												onClick={(e) => {
													e.stopPropagation();
													copyText(tokenAddress);
												}}
											>
												<CopyIcon className='hover:text-primary' />
											</button>
											<a
												onClick={(e) => e.stopPropagation()}
												href={`${chainProperties[network].blockExplorer}/address/${tokenAddress}`}
												target='_blank'
												rel='noreferrer'
											>
												<ExternalLinkIcon />
											</a>
										</p>
									</div>
								</div>
								<p
									title={tokenNameWithID}
									className='sm:w-auto overflow-hidden flex items-center text-ellipsis col-span-1 text-sm'
								>
									{tokenNameWithID}
								</p>
								<p className='sm:w-auto col-span-1 flex items-center gap-x-2'>
									<a
										onClick={(e) => e.stopPropagation()}
										target='_blank'
										href={`${chainProperties[network].blockExplorer}/token/${tokenAddress}?a=${tokenId}`}
										rel='noreferrer'
									>
										<ParachainIcon
											size={23}
											src={chainProperties[network]?.logo}
										/>
									</a>
									<a
										onClick={(e) => e.stopPropagation()}
										target='_blank'
										href={`https://opensea.io/assets/${chainProperties[
											network
										].tokenSymbol.toLocaleLowerCase()}/${tokenAddress}/${tokenId}`}
										rel='noreferrer'
									>
										<ParachainIcon
											tooltip='OpenSea'
											src={openseaLogo}
											size={23}
										/>
									</a>
									<a
										onClick={(e) => e.stopPropagation()}
										target='_blank'
										href={`https://app.zerion.io/nfts/${network}/${tokenAddress}:${tokenId}`}
										rel='noreferrer'
									>
										<ParachainIcon
											tooltip='Zerion'
											src={zerionLogo}
											size={23}
										/>
									</a>
								</p>
								<p className='flex items-center'>
									<PrimaryButton
										onClick={(e) => {
											e.stopPropagation();
											setSeletedNFT(nft);
											setOpenTransactionModal(true);
										}}
										className={` text-white w-fit ${
											chainProperties[network].tokenSymbol !== name ? 'bg-secondary' : 'bg-primary'
										}`}
										disabled={notOwnerOfSafe}
									>
										<p className='font-normal text-sm'>Send</p>
									</PrimaryButton>
								</p>
							</article>
							{nftsArray.length !== index ? <Divider className='bg-text_secondary my-0' /> : null}
						</>
					);
				})
			) : (
				<NoAssets />
			)}
		</div>
	);
};

export default NFTsTable;
