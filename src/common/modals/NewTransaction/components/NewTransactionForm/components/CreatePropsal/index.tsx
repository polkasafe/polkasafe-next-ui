// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@common/enum/substrate';
import { CancelOrKillReferendaForm } from '@common/modals/NewTransaction/components/NewTransactionForm/components/CreatePropsal/CancelOrKillReferenda';
import { useState } from 'react';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { twMerge } from 'tailwind-merge';
import { ManualProposal } from '@common/modals/NewTransaction/components/NewTransactionForm/components/CreatePropsal/ManualProposal';

const styles = {
	selectedTab: 'bg-highlight text-label border-0 py-3 px-5 text-sm font-medium',
	tab: 'bg-bg-main text-text-primary border-0 py-3 px-5 text-sm shadow-none'
};

const CreateProposal = ({ onClose }: { onClose: () => void }) => {
	const [createProposalType, selectCreateProposalType] = useState<EProposalType>(EProposalType.CANCEL);
	const tabs = [
		// {
		// label: 'Create Referenda',
		// tab: EProposalType.CREATE
		// },
		{
			label: 'Cancel Referenda',
			tab: EProposalType.CANCEL
		},
		{
			label: 'Kill Referenda',
			tab: EProposalType.KILL
		}
	];

	return (
		<div className='w-full'>
			<div className='flex justify-between items-center'>
				<div className='flex gap-x-4 items-center'>
					{tabs.map((tab) => (
						<Button
							variant={EButtonVariant.PRIMARY}
							className={twMerge(
								createProposalType === tab.tab && styles.selectedTab,
								createProposalType !== tab.tab && styles.tab
							)}
							size='large'
							onClick={() => selectCreateProposalType(tab.tab)}
						>
							{tab.label}
						</Button>
					))}
				</div>
			</div>
			{createProposalType === EProposalType.CREATE && (
				<ManualProposal
					proposalType={EProposalType.CANCEL}
					onClose={onClose}
				/>
			)}

			{createProposalType === EProposalType.CANCEL && (
				<CancelOrKillReferendaForm
					proposalType={EProposalType.CANCEL}
					onClose={onClose}
				/>
			)}
			{createProposalType === EProposalType.KILL && (
				<CancelOrKillReferendaForm
					proposalType={EProposalType.KILL}
					onClose={onClose}
				/>
			)}
		</div>
	);
};

export default CreateProposal;
