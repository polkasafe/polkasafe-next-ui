import { Select } from 'antd';
import Address from '@common/global-ui-components/Address';
import { ENetwork } from '@common/enum/substrate';
import { IAddressBook } from '@common/types/substrate';
import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';

interface IAddressInput {
	addresses: Array<IAddressBook>;
	network: ENetwork;
	placeholder?: string;
}

export const AddressInput = ({ addresses, placeholder, network }: IAddressInput) => {
	const handleSearch = (search: string) => {
		if (getSubstrateAddress(search) === null) {
			return;
		}
		addresses.push({ address: search, name: DEFAULT_ADDRESS_NAME });
	};

	return (
		<Select
			showSearch
			placeholder={placeholder}
			defaultActiveFirstOption={false}
			suffixIcon={null}
			filterOption={false}
			onSearch={handleSearch}
			notFoundContent={null}
			options={(addresses || []).map((addressObject) => ({
				value: addressObject.address,
				label: (
					<Address
						address={addressObject.address}
						name={addressObject.name || DEFAULT_ADDRESS_NAME}
						network={network}
					/>
				)
			}))}
		/>
	);
};
