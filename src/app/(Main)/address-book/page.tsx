import { AddressBookTable } from '@substrate/app/(Main)/address-book/components/AddressBookTable';
import { LOGIN_URL } from '@substrate/app/global/end-points';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import { redirect } from 'next/navigation';

export default function AddressBook() {
	const user = getUserFromCookie();
	if (!user) {
		redirect(LOGIN_URL);
	}

	return (
		<div className='bg-bg-main rounded-3xl p-5 h-full'>
			<AddressBookTable />
		</div>
	);
}
