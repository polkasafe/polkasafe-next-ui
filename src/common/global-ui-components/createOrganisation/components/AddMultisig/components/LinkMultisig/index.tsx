import { LinkMultisig } from '@common/global-ui-components/LinkMultisig';
import { ILinkMultisig } from '@common/types/substrate';

export const LinkMultisigOrganisation = ({
	networks,
	linkedMultisig,
	onRemoveSubmit,
	availableMultisig,
	onSubmit,
	fetchMultisig,
	className
}: ILinkMultisig) => {
	return (
		<div>
			<LinkMultisig
				networks={networks}
				linkedMultisig={linkedMultisig}
				availableMultisig={availableMultisig}
				onSubmit={onSubmit}
				onRemoveSubmit={onRemoveSubmit}
				fetchMultisig={fetchMultisig}
				className={className}
			/>
		</div>
	);
};
