import { ESettingsTab } from '@common/enum/substrate';
import { ISearchParams } from '@common/types/substrate';
import { Actions } from '@substrate/app/(Main)/settings/components/Actions';
import { CREATE_ORGANISATION_URL, LOGIN_URL } from '@substrate/app/global/end-points';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface ISettings {
	searchParams: Promise<ISearchParams>;
}

export default async function Settings({ searchParams }: ISettings) {
	const user = getUserFromCookie();
	if (!user) {
		redirect(LOGIN_URL);
	}
	const { _organisation, _tab = ESettingsTab.SIGNATORIES } = await searchParams;
	if (!_organisation) {
		//  if not found redirect to login page
		redirect(CREATE_ORGANISATION_URL);
	}

	return (
		<div className='bg-bg-main rounded-3xl p-5 h-full'>
			<Suspense key={_organisation}>
				<Actions
					organisation={_organisation as string}
					selectedTab={_tab as ESettingsTab}
				/>
			</Suspense>
		</div>
	);
}
