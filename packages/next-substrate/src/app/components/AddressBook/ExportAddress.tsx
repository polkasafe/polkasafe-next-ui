// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import AddBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { ISharedAddressBookRecord } from '@next-common/types';

const ExportAdress = ({
	records,
	onCancel
}: {
	records: { [address: string]: ISharedAddressBookRecord };
	onCancel: () => void;
}) => {
	const downloadFile = ({ data, fileName, fileType }: { data: any; fileName: string; fileType: string }) => {
		// Create a blob with the data we want to download as a file
		const blob = new Blob([data], { type: fileType });
		// Create an anchor element and dispatch a click event on it
		// to trigger a download
		const a = document.createElement('a');
		a.download = fileName;
		a.href = typeof window !== 'undefined' && window.URL.createObjectURL(blob);
		const clickEvt = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window
		});
		a.dispatchEvent(clickEvt);
		a.remove();
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const exportToJson = () => {
		// e.preventDefault();
		downloadFile({
			data: JSON.stringify(records),
			fileName: 'address-book.json',
			fileType: 'text/json'
		});
		onCancel();
	};

	const exportToCsv = () => {
		// Headers for each column
		const headers = ['Name,Address,Email,Discord,Telegram,Roles'];

		// Convert users data to a csv
		const usersCsv =
			records &&
			Object.keys(records).reduce(
				(acc, a) => {
					const { name, address, email, discord, telegram, roles } = records[a];
					acc.push(
						[
							name,
							address,
							email || '-',
							discord || '-',
							telegram || '-',
							roles && roles.length ? roles.join(',') : '-'
						].join(',')
					);
					return acc;
				},
				['']
			);

		downloadFile({
			data: [...headers, ...usersCsv].join('\n'),
			fileName: 'address-book.csv',
			fileType: 'text/csv'
		});
		onCancel();
	};

	return (
		<div className='flex flex-col w-[560px]'>
			<div className='flex items-left justify-left'>
				<p className='mr-2 text-white'>You are about to export a JSON file with</p>
				<div className='bg-highlight text-primary px-2 rounded-md'>
					{Object.keys(records).length} address book entries
				</div>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<AddBtn
					onClick={exportToCsv}
					title='Export'
				/>
			</div>
		</div>
	);
};

export default ExportAdress;
