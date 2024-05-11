import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import returnTxUrl from '@next-common/global/gnosisService';
import {
	CircleArrowDownIcon,
	CreateMultisigIcon,
	LinkIcon,
	OutlineCloseIcon
} from '@next-common/ui-components/CustomIcons';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import Loader from '@next-common/ui-components/Loader';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { IMultisigAddress, IOrganisation } from '@next-common/types';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import NetworkCard, { ParachainIcon } from '../NetworksDropdown/NetworkCard';
// eslint-disable-next-line import/no-cycle
import CreateMultisig from '../Multisig/CreateMultisig';

const LinkMultisigStep = ({
	linkedMultisigs,
	setLinkedMultisigs,
	selectedOrg
}: {
	linkedMultisigs: IMultisigAddress[];
	setLinkedMultisigs: React.Dispatch<React.SetStateAction<IMultisigAddress[]>>;
	selectedOrg?: IOrganisation;
}) => {
	const { multisigSettings } = useGlobalUserDetailsContext();
	const [selectedNetwork, setSelectedNetwork] = useState(NETWORK.ETHEREUM);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] = useState<boolean>(false);
	const [openCreateMultisigModal, setOpenCreateMultisigModal] = useState<boolean>(false);
	const [multisigs, setMultisigs] = useState<IMultisigAddress[]>([]);
	const { wallets } = useWallets();
	const connectedWallet = wallets[0];

	const fetchMultisigs = useCallback(async () => {
		if (!connectedWallet) return;
		setLoading(true);
		const txUrl = returnTxUrl(selectedNetwork);
		const provider = await wallets?.[0].getEthersProvider();
		const web3Adapter = new EthersAdapter({
			ethers,
			signerOrProvider: provider
		});
		const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
		const multisigDataFromSafe = await gnosisService.getAllSafeByOwner(connectedWallet.address);
		// eslint-disable-next-line sonarjs/no-unused-collection
		const fetchedMultisigs: IMultisigAddress[] = [];
		await Promise.all(
			multisigDataFromSafe.safes.map(async (a) => {
				const multisigInfo = await gnosisService.getMultisigData(a);
				fetchedMultisigs.push({
					address: a,
					name: multisigSettings?.[`${a}_${selectedNetwork}`]?.name || DEFAULT_ADDRESS_NAME,
					network: selectedNetwork,
					signatories: multisigInfo?.owners,
					threshold: multisigInfo?.threshold
				});
			})
		);
		setMultisigs(fetchedMultisigs);
		setLoading(false);
	}, [connectedWallet, multisigSettings, selectedNetwork, wallets]);

	useEffect(() => {
		fetchMultisigs();
	}, [fetchMultisigs]);

	const networkOptions: ItemType[] = Object.values(NETWORK).map((item) => ({
		key: item,
		label: (
			<NetworkCard
				selectedNetwork={selectedNetwork}
				key={item}
				network={item}
			/>
		)
	}));

	console.log('linked', linkedMultisigs);

	return (
		<div className='flex flex-col gap-y-5'>
			<ModalComponent
				title='Create Multisig'
				open={openCreateMultisigModal}
				onCancel={() => setOpenCreateMultisigModal(false)}
			>
				<CreateMultisig
					onComplete={(multisig) =>
						setLinkedMultisigs((prev) => [
							...prev,
							{
								address: multisig.address,
								disabled: false,
								name: multisig.name || DEFAULT_ADDRESS_NAME,
								network: multisig.network,
								signatories: multisig.signatories,
								threshold: multisig.threshold
							}
						])
					}
					onCancel={() => setOpenCreateMultisigModal(false)}
				/>
			</ModalComponent>
			<div className='rounded-xl p-6 bg-bg-main'>
				<p className='text-sm font-bold mb-2 text-white flex justify-between w-full items-center'>
					Link MultiSig(s)
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg p-1.5 bg-bg-secondary cursor-pointer min-w-[150px]'
						menu={{
							items: networkOptions,
							onClick: (e) => setSelectedNetwork(e.key as NETWORK)
						}}
					>
						<div className='flex justify-between items-center text-white gap-x-2'>
							<div className='capitalize flex items-center gap-x-2 text-sm'>
								<ParachainIcon
									size={15}
									src={chainProperties[selectedNetwork]?.logo}
								/>
								{selectedNetwork}
							</div>
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</p>
				<p className='text-xs text-text_secondary mb-5'>
					Already have a MultiSig? You can link your existing multisig with a few simple steps
				</p>
				{linkedMultisigs && linkedMultisigs.length > 0 && (
					<div className='max-h-[250px] overflow-y-auto mb-5'>
						{linkedMultisigs.map((item, i) => (
							<>
								<div className='p-2 mb-2 border border-text_placeholder rounded-xl flex justify-between items-center'>
									<AddressComponent
										address={item?.address}
										isMultisig
										showNetworkBadge
										withBadge={false}
										signatories={item?.signatories?.length}
										threshold={item?.threshold}
										network={item?.network as NETWORK}
									/>
									<button
										className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
										onClick={() =>
											setLinkedMultisigs((prev) => {
												const copyArray = [...prev];
												copyArray.splice(i, 1);
												return copyArray;
											})
										}
									>
										<OutlineCloseIcon className='text-primary w-2 h-2' />
									</button>
								</div>
								<div />
							</>
						))}
					</div>
				)}
				<div className='max-h-[250px] overflow-y-auto'>
					{loading ? (
						<Loader />
					) : multisigs && multisigs.length > 0 ? (
						multisigs
							.filter((multisig) =>
								selectedOrg ? !selectedOrg?.multisigs?.some((item) => multisig.address === item.address) : true
							)
							.filter((multisig) => !linkedMultisigs.some((item) => multisig.address === item.address))
							.map((multisig) => (
								<div className='p-2 mb-2 border border-text_placeholder rounded-xl flex justify-between items-center'>
									<AddressComponent
										address={multisig?.address}
										isMultisig
										showNetworkBadge
										withBadge={false}
										signatories={multisig?.signatories?.length}
										threshold={multisig?.threshold}
										network={multisig?.network as NETWORK}
									/>
									<PrimaryButton
										onClick={() =>
											setLinkedMultisigs((prev) => [
												...prev,
												{
													address: multisig.address,
													disabled: false,
													name: multisig.name || DEFAULT_ADDRESS_NAME,
													network: multisig.network,
													signatories: multisig.signatories,
													threshold: multisig.threshold
												}
											])
										}
										icon={<LinkIcon />}
										secondary
										className='px-3 h-full'
										size='small'
									>
										Link MultiSig
									</PrimaryButton>
								</div>
							))
					) : (
						<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>No MultiSig found in this Network</p>
						</section>
					)}
				</div>
			</div>
			<div className='flex justify-between rounded-xl p-6 bg-bg-main'>
				<div className='flex-1 pr-10'>
					<p className='text-white font-bold text-sm mb-2'>Create MultiSig</p>
					<p className='text-text_secondary text-xs max-w-[100%]'>
						MultiSig is a secure digital wallet that requires one or multiple owners to authorize the transaction.
					</p>
				</div>
				<PrimaryButton
					icon={<CreateMultisigIcon />}
					onClick={() => setOpenCreateMultisigModal(true)}
				>
					Create Multisig
				</PrimaryButton>
			</div>
		</div>
	);
};

export default LinkMultisigStep;
