import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { IWatchList } from '@common/types/substrate';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { Form, Spin } from 'antd';
import { useState } from 'react';
import { useNotification } from '@common/utils/notification';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import { watchlistFormFields } from '@common/modals/Watchlist/AddWatchlist/utils/form';
import { SelectNetwork } from '@common/global-ui-components/SelectNetwork';
import { ENetwork } from '@common/enum/substrate';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
export const AddWatchlistForm = ({
	initialValue,
	onSubmit
}: {
	initialValue: IWatchList;
	onSubmit: (value: IWatchList) => Promise<void>;
}) => {
	const [selectedNetwork, setSelectedNetwork] = useState<ENetwork>(Object.values(ENetwork)[0]);
	const [loading, setLoading] = useState(false);
	const notification = useNotification();
	const handleSubmit = async (values: IWatchList) => {
		try {
			const { address, name } = values;
			if (!address || !name) {
				notification(ERROR_MESSAGES.ADD_ADDRESS_FAILED);
				return;
			}

			const payload = {
				address,
				name,
				network: selectedNetwork
			};
			setLoading(true);
			await onSubmit(payload);
			notification(SUCCESS_MESSAGES.ADD_ADDRESS_SUCCESS);
		} catch (error) {
			notification({ ...ERROR_MESSAGES.ADD_ADDRESS_FAILED, description: error || error.message });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={200}
					message='Adding Address to Address Book'
				/>
			}
		>
			<Form
				initialValues={initialValue}
				layout='vertical'
				onFinish={handleSubmit}
			>
				{watchlistFormFields.map((field) => {
					return (
						<Form.Item
							key={field.name}
							name={field.name}
							label={field.label}
							rules={field.rules}
							required={field.required}
						>
							{field.input}
						</Form.Item>
					);
				})}
				<Form.Item>
					<h1 className='text-label mb-2 max-sm:text-xs'>Select Network</h1>
					<SelectNetwork
						networks={Object.values(networkConstants)
							.filter((network) => !network.disabled)
							.map((network) => network.key)}
						selectedNetwork={selectedNetwork}
						onChange={(network) => setSelectedNetwork(network)}
					/>
				</Form.Item>
				<Button
					variant={EButtonVariant.PRIMARY}
					fullWidth
					htmlType='submit'
				>
					Submit
				</Button>
			</Form>
		</Spin>
	);
};
