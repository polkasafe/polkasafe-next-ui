const getIPFSLink = (hash?: string) => {
	if (!hash) {
		return '';
	}
	return `${process.env.NEXT_PUBLIC_PINATA_HOST || ''}/ipfs/${hash}?pinataGatewayToken=${
		process.env.NEXT_PUBLIC_PINATA_API_KEY
	}`;
};

export default getIPFSLink;
