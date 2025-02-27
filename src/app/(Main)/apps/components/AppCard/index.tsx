import { ESupportedApps, ETransactionCreationType } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import Modal from '@common/global-ui-components/Modal';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import NewTransaction from '@common/modals/NewTransaction';
import { SendTransaction } from '@substrate/app/(Main)/components/SendTransaction';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import Image from 'next/image';
import { Fragment, ReactNode, useState } from 'react';

interface IAppCard {
	name: ESupportedApps;
	description: string;
	logo: ReactNode;
	url: string;
	supportedNetworks: Array<string>;
}

export const AppCard = ({ name, description, logo, url, supportedNetworks }: IAppCard) => {
	const [openModal, setOpenModal] = useState(false);

	return (
		<Fragment>
			<div
				className='w-96 bg-bg-secondary p-4 rounded-2xl flex flex-col gap-3 cursor-pointer'
				onClick={() => setOpenModal(true)}
			>
				{logo}
				<div>
					<Typography
						variant={ETypographyVariants.h1}
						className='capitalize'
					>
						{name.split('_').join(' ')}
					</Typography>
					<Typography variant={ETypographyVariants.p}>{description}</Typography>
				</div>
				<div className='flex flex-col gap-1'>
					<Typography
						variant={ETypographyVariants.p}
						className='font-bold text-white'
					>
						Available Networks
					</Typography>
					<div className='flex gap-y-1 gap-x-2 flex-wrap'>
						{supportedNetworks.slice(0, 7).map((network) => {
							return (
								<Typography
									variant={ETypographyVariants.p}
									className='m-0 bg-bg-main rounded-lg p-1 px-3 text-white capitalize'
								>
									{network.toLowerCase()}
								</Typography>
							);
						})}
						{supportedNetworks.length > 7 && (
							<Typography
								variant={ETypographyVariants.p}
								className='m-0 bg-bg-main rounded-lg p-1 px-3 text-white capitalize'
							>
								+{supportedNetworks.length - 7} more
							</Typography>
						)}
					</div>
				</div>
			</div>
			{(name === ESupportedApps.POLKASSEMBLY || name === ESupportedApps.ASTAR) && (
				<Modal
					open={openModal}
					onCancel={() => {
						setOpenModal(false);
					}}
					title={name}
				>
					<div className='w-[440px] flex flex-col gap-4'>
						<div>
							{logo}
							<div>
								<Typography
									variant={ETypographyVariants.h1}
									className='capitalize'
								>
									{name.split('_').join(' ')}
								</Typography>
								<Typography variant={ETypographyVariants.p}>{description}</Typography>
							</div>
							<div className='flex flex-col gap-1'>
								<Typography variant={ETypographyVariants.p}>Available Networks</Typography>
								<div className='flex gap-y-1 gap-x-2 flex-wrap'>
									{supportedNetworks.map((network) => {
										return (
											<Typography
												variant={ETypographyVariants.p}
												className='m-0 bg-bg-main-dark rounded-lg p-1 px-3 text-white capitalize'
											>
												{network.toLowerCase()}
											</Typography>
										);
									})}
								</div>
							</div>
						</div>
						<div className='w-full'>
							<Button
								fullWidth
								variant={EButtonVariant.PRIMARY}
								onClick={() => {
									window.open(url, '_blank');
								}}
							>
								Open App
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{(name === ESupportedApps.SET_IDENTITY || name === ESupportedApps.DELEGATE) && (
				<SendTransaction
					address={null}
					proxyAddress={null}
				>
					<NewTransaction
						transactionType={
							name === ESupportedApps.SET_IDENTITY
								? ETransactionCreationType.SET_IDENTITY
								: ETransactionCreationType.DELEGATE
						}
						openModal={openModal}
						setOpenModal={setOpenModal}
					/>
				</SendTransaction>
			)}
		</Fragment>
	);
};
