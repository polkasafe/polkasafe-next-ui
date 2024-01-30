// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import Review from './Review';

const emojis = ['😍', '🙂', '😐', '🙁', '😢'];

const Feedback = () => {
	const { userID } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [review, setReview] = useState<string>('');
	const [rating, setRating] = useState<number | null>(null);

	const [openReviewModal, setOpenReviewModal] = useState<boolean>(false);

	const handleSubmitFeedback = async () => {
		try {
			setLoading(true);

			if (!userID) {
				console.log('ERROR');
				setLoading(false);
			} else {
				if (!rating) {
					queueNotification({
						header: 'Error!',
						message: 'Please add rating.',
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}
				const addfeedbackRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addFeedbackEth`, {
					body: JSON.stringify({
						rating,
						review
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: feedbackData, error: feedbackError } = (await addfeedbackRes.json()) as {
					data: string;
					error: string;
				};

				if (feedbackError) {
					queueNotification({
						header: 'Error!',
						message: feedbackError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if (feedbackData && feedbackData === 'Success') {
					queueNotification({
						header: 'Submitted!',
						message: 'Thank you for your Feedback!',
						status: NotificationStatus.SUCCESS
					});
					setLoading(false);
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<>
			<ModalComponent
				open={openReviewModal}
				onCancel={() => setOpenReviewModal(false)}
				title='Write a Review'
			>
				<Review
					setReview={setReview}
					review={review}
					onCancel={() => setOpenReviewModal(false)}
				/>
			</ModalComponent>
			<h2 className='font-semibold text-lg leading-[22px] text-white mb-4'>Feedback</h2>
			<article className='bg-bg-main p-5 rounded-xl text-text_secondary text-sm font-normal leading-[15px]'>
				<div className='flex items-center gap-x-5 justify-between text-sm font-normal leading-[15px]'>
					<p className='text-white'>What do you think of PolkaSafe?</p>
					<button
						onClick={() => setOpenReviewModal(true)}
						className='text-primary font-medium'
					>
						Write a Review
					</button>
				</div>
				<div className='my-[34.5px] flex items-center justify-center gap-x-5'>
					{emojis.map((emoji, i) => {
						return (
							<span
								onClick={() => setRating(5 - i)}
								key={emoji}
								className={`p-[10px] border-solid  border-primary text-[32px] flex items-center justify-center ${
									rating === 5 - i ? 'bg-highlight border' : 'bg-bg-secondary'
								} cursor-pointer rounded-lg leading-none w-[52px] h-[52px]`}
							>
								{emoji}
							</span>
						);
					})}
				</div>
				<Button
					disabled={!rating}
					onClick={handleSubmitFeedback}
					size='large'
					loading={loading}
					className={`bg-highlight ${!rating ? 'text-text_secondary' : 'text-primary'} w-full border-none outline-none`}
				>
					Share Feedback
				</Button>
			</article>
		</>
	);
};

export default Feedback;
