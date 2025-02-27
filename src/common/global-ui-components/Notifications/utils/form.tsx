import { ETriggers } from '@common/enum/substrate';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';

export const notificationForm = [
	{
		label: (
			<Typography
				variant={ETypographyVariants.p}
				className='text-white'
			>
				New Transaction needs to be signed
			</Typography>
		),
		value: ETriggers.INIT_MULTISIG_TRANSFER
	},
	{
		label: (
			<Typography
				variant={ETypographyVariants.p}
				className='text-white'
			>
				Transaction has been signed and executed
			</Typography>
		),
		value: ETriggers.EXECUTED_TRANSACTION
	},
	{
		label: (
			<Typography
				variant={ETypographyVariants.p}
				className='text-white'
			>
				Transaction has been cancelled
			</Typography>
		),
		value: ETriggers.CANCELLED_TRANSACTION
	},
	{
		label: (
			<Typography
				variant={ETypographyVariants.p}
				className='text-white'
			>
				Get reminders from other signatories
			</Typography>
		),
		value: ETriggers.APPROVAL_REMINDER
	},
	{
		label: (
			<Typography
				variant={ETypographyVariants.p}
				className='text-white'
			>
				For Pending Transactions remind signers every
			</Typography>
		),
		value: ETriggers.SCHEDULED_APPROVAL_REMINDER
	}
];
