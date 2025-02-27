import { useCallback, useState } from 'react';
import Modal from '@common/global-ui-components/Modal';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { ENetwork } from '@common/enum/substrate';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { QrScanAddress } from '@polkadot/react-qr';
import InfoBox from '@common/global-ui-components/InfoBox';
import type { HexString } from '@polkadot/util/types';

interface IPolkadotVaultModal {
	openVaultModal: boolean;
	onClose: () => void;
	setVaultNetwork?: React.Dispatch<React.SetStateAction<string>>;
	setAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>;
	setFetchAccountsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Scanned {
	content: string;
	isAddress: boolean;
	genesisHash: HexString | null;
	name?: string;
}

export const PolkadotVaultModal = ({
	openVaultModal,
	onClose,
	setVaultNetwork,
	setAccounts,
	setFetchAccountsLoading
}: IPolkadotVaultModal) => {
	const [selectedNetwork, setSelectedNetwork] = useState(ENetwork.POLKADOT);

	const networkOptions: ItemType[] = Object.values(ENetwork).map((n) => ({
		key: n,
		label: (
			<span className='text-white flex items-center gap-x-2 capitalize'>
				<ParachainTooltipIcon src={networkConstants[n]?.logo} />
				{n}
			</span>
		)
	}));

	const onNetworkChange = (e: any) => {
		setSelectedNetwork(e.key);
		setVaultNetwork?.(e.key);
	};

	const onScan = useCallback(
		(scanned: Scanned): void => {
			setAccounts([
				{
					address: scanned.isAddress ? scanned.content : '',
					name: scanned.name || DEFAULT_ADDRESS_NAME
				}
			]);
			onClose();
			setFetchAccountsLoading?.(false);
		},
		[onClose, setAccounts, setFetchAccountsLoading]
	);

	const onError = useCallback((err: Error): void => {
		console.log('error', err);
	}, []);

	return (
		<Modal
			open={openVaultModal}
			onCancel={onClose}
			title='Scan your Address QR'
		>
			<>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer mb-2'
					menu={{
						items: networkOptions,
						onClick: onNetworkChange
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						<span className='flex items-center gap-x-2 capitalize'>
							<ParachainTooltipIcon src={networkConstants[selectedNetwork]?.logo} />
							{selectedNetwork}
						</span>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
				<InfoBox message={`Please Scan your ${selectedNetwork} Address QR in Polkadot Vault`} />
				<QrScanAddress
					isEthereum={false}
					onError={onError}
					onScan={onScan}
				/>
			</>
		</Modal>
	);
};
