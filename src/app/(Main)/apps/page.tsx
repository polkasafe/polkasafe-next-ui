import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { ISearchParams } from '@common/types/substrate';
import { AppList } from '@substrate/app/(Main)/apps/components/AppList';
import { LOGIN_URL } from '@substrate/app/global/end-points';
import { redirect } from 'next/navigation';

interface IApps {
	searchParams: ISearchParams;
}

export default function Apps({ searchParams }: IApps) {
	const { _multisig, _organisation, _network, _tab } = searchParams;
	if (!_organisation && !_multisig) {
		redirect(LOGIN_URL);
	}

	return (
		<div className='rounded-3xl bg-bg-main p-8 h-full flex flex-col gap-y-4'>
			<Typography variant={ETypographyVariants.h1}>All Apps</Typography>
			<AppList />
		</div>
	);
}
