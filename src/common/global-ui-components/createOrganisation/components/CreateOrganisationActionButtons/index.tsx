import { useOrgStepsContext } from '@common/context/CreateOrgStepsContext';
import { ECreateOrganisationSteps } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { ArrowLeftCircle, ArrowRightCircle, CircleCheckIcon } from '@common/global-ui-components/Icons';

interface ICreateOrganisationActionButtons {
	loading: boolean;
	onCancelClick?: () => void;
	onNextClick?: () => void;
	nextButtonDisabled?: boolean;
}

export const CreateOrganisationActionButtons = ({
	loading,
	onCancelClick,
	onNextClick,
	nextButtonDisabled
}: ICreateOrganisationActionButtons) => {
	const { step } = useOrgStepsContext();
	return (
		<div className='flex w-full justify-between mt-5'>
			<Button
				variant={EButtonVariant.DANGER}
				disabled={loading}
				fullWidth
				loading={loading}
				onClick={onCancelClick}
				icon={<ArrowLeftCircle className='text-sm' />}
				size='large'
			>
				Back
			</Button>
			<Button
				htmlType='submit'
				disabled={nextButtonDisabled || loading}
				variant={EButtonVariant.PRIMARY}
				fullWidth
				loading={Boolean(loading)}
				onClick={onNextClick}
				size='large'
				icon={step === ECreateOrganisationSteps.REVIEW && <CircleCheckIcon />}
			>
				{step === ECreateOrganisationSteps.REVIEW ? 'Confirm' : 'Next'}
				{step !== ECreateOrganisationSteps.REVIEW && <ArrowRightCircle className='text-sm' />}
			</Button>
		</div>
	);
};
