// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';

interface Props {
	className?: string;
}

const Loader = ({ className }: Props) => {
	return <div className={`h-1 rounded-[4px] ${className}`} />;
};

export default Loader;
