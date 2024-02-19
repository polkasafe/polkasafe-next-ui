import '@next-substrate/styles/globals.css';
import AppLayout from '@next-substrate/app/components/AppLayout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (<AppLayout>{children}</AppLayout>) as React.ReactNode;
}
