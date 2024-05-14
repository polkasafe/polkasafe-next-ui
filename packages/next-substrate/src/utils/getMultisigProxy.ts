export default function getMultisigProxy(proxy: string | Array<{ address: string; name?: string }>) {
	if (!proxy) {
		return '';
	}
	if (typeof proxy === 'string') {
		return proxy;
	}
	return proxy[0]?.address || '';
}
