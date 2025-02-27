import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

export const ScaleMotion = ({ children, scale }: PropsWithChildren<{ scale?: number }>) => (
	<motion.div whileHover={{ scale: scale || 1.025 }}>{children}</motion.div>
);
