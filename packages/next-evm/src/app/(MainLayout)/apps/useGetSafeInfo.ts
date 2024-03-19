import { useMemo } from 'react';
// import useChainId from '@/hooks/useChainId';
// import { useCurrentChain } from '@/hooks/useChains';
// import useIsSafeOwner from '@/hooks/useIsSafeOwner';
// import useSafeInfo from '@/hooks/useSafeInfo';
// import { getLegacyChainName } from '../utils';

const useGetSafeInfo = () => {
	// const { safe, safeAddress } = useSafeInfo();
	// const isOwner = useIsSafeOwner();
	const isOwner = true;

	// polygon mainnet 137(0x89)
	const chainId = '0x89';
	// const chain = useCurrentChain();
	// const chainName = chain?.chainName || '';
	const chainName = 'polygon';
	return useMemo(
		() => () => ({
			safeAddress: '0x4e48F24BB3D9bAF052d6382CDF39Ae271adFF8cB',
			chainId: parseInt(chainId, 10),
			owners: ['0x54a713FCE6CECD7b3A3391Dbe39f12Dc183a4e5c', '0x493BbF1977176eB42e51C6a96636dE130ea494E8'],
			threshold: 2,
			isReadOnly: !isOwner,
			network: 'POLYGON'
		}),
		[chainId, chainName, isOwner]
	);
};

export default useGetSafeInfo;
