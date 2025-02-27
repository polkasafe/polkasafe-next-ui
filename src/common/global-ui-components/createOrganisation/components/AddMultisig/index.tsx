import { useOrganisationContext } from '@common/context/CreateOrganisationContext';
import { useOrgStepsContext } from '@common/context/CreateOrgStepsContext';
import { ECreateOrganisationSteps } from '@common/enum/substrate';
import { LinkMultisigOrganisation } from '@common/global-ui-components/createOrganisation/components/AddMultisig/components/LinkMultisig';
import { CreateOrganisationActionButtons } from '@common/global-ui-components/createOrganisation/components/CreateOrganisationActionButtons';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { AddMultisig } from '@common/modals/AddMultisig';

export const AddMultisigsToOrganisation = () => {
	const {
		networks,
		availableSignatories,
		onCreateMultisigSubmit,
		linkedMultisig,
		multisigs,
		onRemoveMultisig,
		fetchMultisig,
		onLinkedMultisig,
		userAddress
	} = useOrganisationContext();
	const { setStep } = useOrgStepsContext();

	return (
		<div>
			<Typography
				variant={ETypographyVariants.p}
				className='text-lg font-bold mb-2 text-white'
			>
				Create/Link Multisig
			</Typography>
			<Typography
				variant={ETypographyVariants.p}
				className='text-sm text-text-secondary mb-5'
			>
				MultiSig is a secure digital wallet that requires one or multiple owners to authorize the transaction.
			</Typography>
			<div className='w-full mb-4'>
				<div className='flex justify-between rounded-xl p-6 bg-bg-main'>
					<div className='flex-1 pr-10'>
						<p className='text-white font-bold text-base'>Create MultiSig</p>
					</div>
					<AddMultisig
						userAddress={userAddress}
						networks={networks}
						availableSignatories={availableSignatories}
						onSubmit={onCreateMultisigSubmit}
					/>
				</div>
			</div>

			<LinkMultisigOrganisation
				networks={networks}
				linkedMultisig={linkedMultisig}
				availableMultisig={multisigs}
				onSubmit={onLinkedMultisig}
				fetchMultisig={fetchMultisig}
				onRemoveSubmit={onRemoveMultisig}
			/>

			<CreateOrganisationActionButtons
				loading={false}
				onNextClick={() => setStep(ECreateOrganisationSteps.REVIEW)}
				onCancelClick={() => setStep(ECreateOrganisationSteps.ORGANISATION_DETAILS)}
				nextButtonDisabled={linkedMultisig.length === 0}
			/>
		</div>
	);
};
