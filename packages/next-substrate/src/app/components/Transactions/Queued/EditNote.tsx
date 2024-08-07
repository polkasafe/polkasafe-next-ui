// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import ModalBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import updateTransactionNote from '@next-substrate/utils/updateTransactionNote';

interface Props {
	note: string;
	callHash: string;
	setUpdatedNote: React.Dispatch<React.SetStateAction<string>>;
	onCancel: () => void;
}

const EditNote = ({ note, callHash, setUpdatedNote, onCancel }: Props) => {
	const { network } = useGlobalApiContext();

	const { activeMultisig } = useGlobalUserDetailsContext();

	const [newNote, setNewNote] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const handleEditNote = async () => {
		if (!newNote) return;
		try {
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			const { data: editNoteData, error: editNoteError } = await updateTransactionNote({
				callHash,
				multisigAddress: activeMultisig,
				network,
				note: newNote
			});

			if (editNoteError) {
				queueNotification({
					header: 'Error!',
					message: editNoteError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if (editNoteData) {
				queueNotification({
					header: 'Success!',
					message: 'Note Updated!',
					status: NotificationStatus.SUCCESS
				});

				setUpdatedNote(newNote);

				setLoading(false);
				onCancel();
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<Form className='my-0'>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-white font-anormal text-sm leading-[15px]'
					htmlFor='editNote'
				>
					Enter Note
				</label>
				<Form.Item
					name='editNote'
					rules={[]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input.TextArea
						placeholder='Note'
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						id='editNote'
						value={newNote}
						defaultValue={note}
						rows={4}
						onChange={(e) => setNewNote(e.target.value)}
					/>
				</Form.Item>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<ModalBtn
					disabled={!newNote}
					loading={loading}
					onClick={handleEditNote}
					title='Update'
				/>
			</div>
		</Form>
	);
};

export default EditNote;
