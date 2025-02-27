import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { useState } from 'react';
import Modal from '@common/global-ui-components/Modal';
import { CreateMultisig } from '@common/global-ui-components/CreateMultisig';
import { ENetwork } from '@common/enum/substrate';
import { IAddressBook, IMultisigCreate } from '@common/types/substrate';
import { CreateMultisigIcon } from '@common/global-ui-components/Icons';

interface IAddMultisig {
	networks: Array<ENetwork>;
	availableSignatories: Array<IAddressBook>;
	onSubmit: (values: IMultisigCreate) => Promise<void>;
	userAddress: string;
	className?: string;
	iconClassName?: string;
	size?: 'small' | 'middle' | 'large';
	disabled?: boolean;
}

export const AddMultisig = ({
	networks,
	availableSignatories,
	onSubmit,
	userAddress,
	className,
	iconClassName,
	size,
	disabled
}: IAddMultisig) => {
	const [openModal, setOpenModal] = useState(false);
	return (
		<div>
			<Button
				variant={EButtonVariant.PRIMARY}
				icon={<CreateMultisigIcon className={iconClassName} />}
				onClick={() => setOpenModal(true)}
				size={size || 'large'}
				className={className}
				disabled={disabled}
			>
				Create Multisig
			</Button>
			<Modal
				open={openModal}
				onCancel={() => setOpenModal(false)}
				title='Create Multisig'
			>
				<div className='flex flex-col gap-5'>
					<CreateMultisig
						userAddress={userAddress}
						networks={networks}
						availableSignatories={availableSignatories}
						onSubmit={onSubmit}
						onClose={() => setOpenModal(false)}
					/>
				</div>
			</Modal>
		</div>
	);
};
