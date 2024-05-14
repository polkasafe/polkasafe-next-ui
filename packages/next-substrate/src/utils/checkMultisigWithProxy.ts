export default function checkMultisigWithProxy(
	proxy: string | Array<{ address: string; name?: string }>,
	activeMultisig: string
) {
	return (
		proxy === activeMultisig ||
		(typeof proxy !== 'string' ? proxy : [])?.map((mp) => mp.address).includes(activeMultisig)
	);
}
