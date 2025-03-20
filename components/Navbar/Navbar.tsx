"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();

  // Listen for scroll event to add shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Display username if fullName is empty
  const displayName = user?.fullName?.trim() ? user.fullName : user?.username;

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-50 bg-white ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      } transition-shadow duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JobsDB</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {[
                { name: 'หน้าแรก', href: '/' },
                { name: 'ค้นหางาน', href: '/jobs' },
                { name: 'บริษัท', href: '/companies' }
              ].map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="relative inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  <span className={`${
                    pathname === item.href 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-500 hover:text-gray-900'
                  } transition-colors duration-200`}>
                    {item.name}
                  </span>
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                      initial={false}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={displayName} 
                      className="h-8 w-8 rounded-full ring-2 ring-blue-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">@{user.username}</span>
                    {user.fullName?.trim() && (
                      <span className="text-sm text-gray-500 ml-1">({user.fullName})</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  ออกจากระบบ
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hover:text-blue-600 transition-colors">เข้าสู่ระบบ</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            >
              <span className="sr-only">เปิดเมนู</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* เมนูมือถือ */}
      <div 
        className={`sm:hidden transform ${
          isMenuOpen 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-5 opacity-0 pointer-events-none'
        } transition-all duration-200 ease-in-out`}
      >
        <div className="pt-2 pb-3 space-y-1 border-t border-gray-100">
          {[
            { name: 'หน้าแรก', href: '/' },
            { name: 'ค้นหางาน', href: '/jobs' },
            { name: 'บริษัท', href: '/companies' }
          ].map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                pathname === item.href 
                  ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
              } transition-colors`}
              onClick={() => setIsMenuOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
          {isLoggedIn && user ? (
            <div>
              <div className="flex items-center px-4 py-2">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={displayName} 
                    className="h-10 w-10 rounded-full mr-3 border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 border-2 border-white shadow-sm">
                    <span className="text-blue-600 font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">@{user.username}</p>
                  {user.fullName?.trim() && (
                    <p className="text-sm text-gray-500">{user.fullName}</p>
                  )}
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-3 pb-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/auth/login"
                className="block text-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 rounded-md shadow-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/signup"
                className="block text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-md shadow-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;