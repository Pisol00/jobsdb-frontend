import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';

import { Noto_Sans_Thai } from 'next/font/google'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'เว็บหางาน | ค้นหางานที่ใช่สำหรับคุณ',
  description: 'ค้นหาตำแหน่งงานที่เหมาะกับคุณได้ที่นี่ - เว็บหางานชั้นนำที่รวบรวมตำแหน่งงานคุณภาพจากบริษัทชั้นนำทั่วประเทศ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={notoSansThai.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}