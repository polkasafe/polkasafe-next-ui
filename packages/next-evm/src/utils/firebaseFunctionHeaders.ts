/* eslint-disable @typescript-eslint/naming-convention */
const firebaseFunctionsHeader = (address?: string, network?: string, contentType?: string) => ({
	Accept: 'application/json',
	'Content-Type': contentType || 'application/json',
	'x-address': address || localStorage.getItem('address') || '',
	'x-token': localStorage.getItem('privy:token').split('"')[1] || '',
	'x-network': network || ''
});

export default firebaseFunctionsHeader;
