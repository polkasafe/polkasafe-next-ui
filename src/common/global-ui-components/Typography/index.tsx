/* eslint-disable react/jsx-props-no-spreading */
import React, { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export enum ETypographyVariants {
	h1 = 'h1',
	h2 = 'h2',
	h3 = 'h3',
	h4 = 'h4',
	h5 = 'h5',
	h6 = 'h6',
	p = 'p'
}

interface ITypography {
	variant: ETypographyVariants;
	className?: string;
}

function Typography({ children, variant, className, ...props }: PropsWithChildren<ITypography>) {
	switch (variant) {
		case ETypographyVariants.h1:
			return (
				<h1
					className={twMerge('text-xl font-bold', className)}
					{...props}
				>
					{children}
				</h1>
			);
		case ETypographyVariants.h2:
			return (
				<h2
					className={twMerge('', className)}
					{...props}
				>
					{children}
				</h2>
			);
		case ETypographyVariants.h3:
			return (
				<h3
					className={twMerge('', className)}
					{...props}
				>
					{children}
				</h3>
			);
		case ETypographyVariants.h4:
			return (
				<h4
					className={twMerge('', className)}
					{...props}
				>
					{children}
				</h4>
			);
		case ETypographyVariants.h5:
			return (
				<h5
					className={twMerge('', className)}
					{...props}
				>
					{children}
				</h5>
			);
		case ETypographyVariants.h6:
			return (
				<h6
					className={twMerge('', className)}
					{...props}
				>
					{children}
				</h6>
			);
		case ETypographyVariants.p:
			return (
				<p
					className={twMerge('text-xs text-text-secondary', className)}
					{...props}
				>
					{children}
				</p>
			);
		default:
			return <a {...props}>{children}</a>;
	}
}

export default Typography;
