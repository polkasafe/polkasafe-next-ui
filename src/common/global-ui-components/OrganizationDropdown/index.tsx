import Dropdown from '@common/global-ui-components/Dropdown';

interface IOrganizationDropdown {
	organizationList: Array<{ label: string; value: string }>;
	selectedOrganization: string;
	onOrganizationChange: (value: string) => void;
	placeholder?: string;
}

const SELECT_ORGANIZATION = 'Select Organization';

function OrganizationDropdown({
	organizationList,
	selectedOrganization,
	onOrganizationChange,
	placeholder
}: IOrganizationDropdown) {
	return (
		<div>
			<Dropdown
				placeholder={placeholder || SELECT_ORGANIZATION}
				options={organizationList}
				value={selectedOrganization}
				onChange={onOrganizationChange}
			/>
		</div>
	);
}

export default OrganizationDropdown;
