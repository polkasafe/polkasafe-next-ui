import React, { useEffect, useState } from 'react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { Tooltip } from 'antd';
import Image from 'next/image';
import fallbackLogo from '@common/assets/fallbacks/fallback-token-logo.png';

function ParachainTooltipIcon({
	src,
	className,
	size = 20,
	tooltip,
	noBg
}: {
	src: string | StaticImport;
	className?: string;
	size?: number;
	tooltip?: string;
	noBg?: boolean;
}) {
	const [err, setErr] = useState<boolean>(false);

	useEffect(() => {
		setErr(false);
	}, [src]);
	return (
		<Tooltip title={tooltip}>
			<div className={`flex items-center justify-center p-[2px] rounded-md ${noBg ? 'bg-transparent' : 'bg-white'}`}>
				<Image
					className={`${className} block rounded-full`}
					height={size}
					width={size}
					src={err || src === undefined ? fallbackLogo : src}
					onError={() => setErr(true)}
					alt='Chain logo'
				/>
			</div>
		</Tooltip>
	);
}

export default ParachainTooltipIcon;
