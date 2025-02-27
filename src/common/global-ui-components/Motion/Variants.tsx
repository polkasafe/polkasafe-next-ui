import React, { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

const list = {
	visible: { opacity: 1 },
	hidden: { opacity: 0 }
};

const item = {
	visible: { opacity: 1, x: 0 },
	hidden: { opacity: 0, x: -100 }
};

export function ListVariantMotion({ children }: PropsWithChildren) {
	return (
		<motion.div
			initial='hidden'
			animate='visible'
			variants={list}
		>
			{children}
		</motion.div>
	);
}

export function ItemVariantMotion({ children }: PropsWithChildren) {
	return <motion.div variants={item}>{children}</motion.div>;
}
