import Footer from '@/common-components/footer';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Navbar from '@/common-components/navbar';
import Sidebar from '@/common-components/sidebar';

export const metadata: Metadata = {
  title: 'Polkasafe',
  description: 'MultiSig experience on Polkadot',
};


const inter = Inter({ subsets: ['latin'] });
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div>
          <Navbar/>
          <div className="flex overflow-hidden bg-white pt-15">
            <Sidebar/>
            <div id="main-content" className="h-full w-full bg-gray-50 relative overflow-y-auto lg:ml-64">
              <main>
                <div className='w-full h-[calc(100vh-109px)] p-4 mt-[53px]'>
                  {children}
                </div>
              </main>
              <Footer/>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
