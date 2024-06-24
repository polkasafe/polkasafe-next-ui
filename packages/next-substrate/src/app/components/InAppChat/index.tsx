import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { ArrowUpOutlined } from '@ant-design/icons';
import { Button, Input, Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import dayjs from 'dayjs';
import NoMessages from './NoMessages';
import { db } from '../../../firebase-config';
import Message from './Message';

interface IMessage {
	id: string;
	from: string;
	time: Date;
	text: string;
}

const InAppChat = () => {
	const { activeOrg } = useActiveOrgContext();
	const { userID } = useGlobalUserDetailsContext();

	const [newMessage, setNewMessage] = useState<string>('');

	const [messages, setMessages] = useState<IMessage[]>([]);

	const messageRef = collection(db, 'messages');

	useEffect(() => {
		const queryMessages = query(messageRef, where('orgId', '==', activeOrg.id));

		const unSub = onSnapshot(queryMessages, (snapshot) => {
			let msgs: IMessage[] = [];
			snapshot.docs.forEach((doc) => {
				const docData = doc.data();
				msgs = [
					...msgs,
					{
						from: docData.user,
						id: doc.id,
						text: docData.text,
						time: dayjs.unix(docData.createdAt).toDate()
					}
				].sort((a, b) => (dayjs(a.time).isBefore(dayjs(b.time)) ? 1 : -1));
			});
			setMessages(msgs);
		});

		return () => unSub();
	}, [activeOrg.id, messageRef]);

	const handleSendMessage = async (e: any) => {
		e.preventDefault();
		if (newMessage === '' || !userID || !activeOrg || !activeOrg.id) return;

		await addDoc(messageRef, {
			createdAt: serverTimestamp(),
			orgId: activeOrg.id,
			text: newMessage,
			user: userID
		});

		setNewMessage('');
	};
	return (
		<Layout className='rounded-xl drop-shadow-xl h-[550px] w-[350px] bg-bg-secondary absolute right-0 bottom-0 border border-text_placeholder'>
			<Layout.Header className='bg-transparent border-b border-text_placeholder h-[50px] flex items-center gap-x-1 px-4 font-medium text-base text-white'>
				{activeOrg.name} <span className='text-xs text-text_secondary'>({activeOrg.members.length} members)</span>
			</Layout.Header>
			<Layout.Content
				className='overflow-y-hidden'
				style={{ maxHeight: 'calc(100% - 50px - 55px)' }}
			>
				{messages.length === 0 ? (
					<NoMessages />
				) : (
					<div className='p-2 flex h-full overflow-y-auto flex-col flex-col-reverse gap-y-2 w-full'>
						{messages.map((message) => (
							<Message
								key={message.id}
								text={message.text}
								from={message.from}
								time={message.time}
							/>
						))}
					</div>
				)}
			</Layout.Content>
			<Layout.Footer className='bg-transparent border-t border-text_placeholder h-[55px] flex items-center p-2 relative'>
				<Input
					placeholder='Send a Message'
					className='text-sm font-normal outline-0 placeholder:text-[#505050] rounded-lg text-white bg-bg-main h-full pr-10'
					id='existential_deposit'
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					onPressEnter={handleSendMessage}
				/>
				<Button
					onClick={handleSendMessage}
					size='small'
					shape='circle'
					icon={<ArrowUpOutlined />}
					className='bg-primary absolute right-4 outline-none border-none text-white'
				/>
			</Layout.Footer>
		</Layout>
	);
};

export default InAppChat;
