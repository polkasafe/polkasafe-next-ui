/* eslint-disable @typescript-eslint/naming-convention */
const baseUrl = 'https://api.pinata.cloud/pinning/';

export const handleUploadImage = async (file: File) => {
	if (!file) {
		return;
	}
	const formData = new FormData();
	formData.append('file', file);
	const response = await fetch(`${baseUrl}pinFileToIPFS`, {
		body: formData,
		headers: {
			'Access-Control-Allow-Origin': '*',
			pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
			pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!
		},
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error('Failed to upload file');
	}

	const data = await response.json();
	// eslint-disable-next-line consistent-return
	return data.IpfsHash ? `https://rose-select-sole-942.mypinata.cloud/ipfs/${data.IpfsHash}` : '';
};

export const handleUploadData = async (data: any) => {
	if (!data) {
		return;
	}
	const response = await fetch(`${baseUrl}pinJSONToIPFS`, {
		body: JSON.stringify(data),
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
			pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
			pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!
		},
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error('Failed to upload file');
	}

	const ipfs = await response.json();
	// eslint-disable-next-line consistent-return
	return ipfs.IpfsHash || '';
};
