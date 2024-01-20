import '@next-evm/styles/globals.css';
import AppLayout from '@next-evm/app/components/AppLayout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (<AppLayout>{children}</AppLayout>) as React.ReactNode;
}
