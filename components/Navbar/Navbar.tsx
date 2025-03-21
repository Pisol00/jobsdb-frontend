"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Briefcase, 
  Building2, 
  Menu, 
  X, 
  Settings, 
  Bell, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Define interface for nav items
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

// Define the nav items (มีการสร้างไว้นอก component เพื่อไม่ให้ re-render)
const navItems: NavItem[] = [
  { 
    name: 'หน้าแรก', 
    href: '/',
    icon: <Home className="w-4 h-4" />
  },
  { 
    name: 'ค้นหางาน', 
    href: '/jobs',
    icon: <Briefcase className="w-4 h-4" />
  },
  { 
    name: 'บริษัท', 
    href: '/companies',
    icon: <Building2 className="w-4 h-4" />
  }
];

// Memoized NavLink component
const NavLink = memo(({ 
  item, 
  pathname, 
  onClick 
}: { 
  item: NavItem; 
  pathname: string;
  onClick?: () => void;
}) => {
  const isActive = pathname === item.href;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
      }`}
    >
      <span className="flex items-center gap-2">
        {item.icon}
        {item.name}
      </span>
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 mx-3 bg-blue-600"
          initial={false}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

// Memoized MobileNavLink
const MobileNavLink = memo(({ 
  item, 
  pathname, 
  index, 
  onClick 
}: { 
  item: NavItem; 
  pathname: string; 
  index: number;
  onClick: () => void;
}) => {
  const isActive = pathname === item.href;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
          isActive
            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
        }`}
      >
        {item.icon}
        {item.name}
      </motion.div>
    </Link>
  );
});

MobileNavLink.displayName = 'MobileNavLink';

// Memoized UserMenu for desktop
const UserMenu = memo(({ 
  user, 
  displayName, 
  userInitial, 
  onLogout 
}: { 
  user: any; 
  displayName: string; 
  userInitial: string;
  onLogout: () => void;
}) => {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative rounded-full h-9 w-9 p-0 text-gray-500"
          >
            <span className="sr-only">การแจ้งเตือน</span>
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>การแจ้งเตือน</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2 text-sm text-gray-500 text-center">
            ไม่มีการแจ้งเตือนใหม่
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 px-2 rounded-full hover:bg-gray-100"
          >
            <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
              <AvatarImage src={user.profileImage} alt={displayName} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                @{user.username}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>โปรไฟล์</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>ตั้งค่า</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 text-red-600 cursor-pointer"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

UserMenu.displayName = 'UserMenu';

// Main Navbar Component
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();

  // Memoized handlers
  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute derived values only once
  const displayName = user?.fullName?.trim() ? user.fullName : user?.username;
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : '?';

  // Precompute class strings
  const headerClass = `sticky top-0 z-50 w-full ${
    scrolled 
      ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm' 
      : 'bg-white'
  } transition-all duration-300`;

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={headerClass}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo และชื่อ */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center gap-2 select-none transition-transform hover:scale-105"
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-200">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobsDB
              </span>
              <Badge variant="outline" className="hidden sm:flex text-xs font-medium bg-blue-50 text-blue-600 border-blue-100">
                TH
              </Badge>
            </Link>
          </div>

          {/* เมนูหลักสำหรับ desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} pathname={pathname} />
            ))}
          </nav>

          {/* ปุ่มเข้าสู่ระบบ/ออกจากระบบสำหรับ desktop */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {isLoggedIn && user ? (
              <UserMenu 
                user={user} 
                displayName={displayName} 
                userInitial={userInitial}
                onLogout={handleLogout}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700 hover:text-blue-600"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* ปุ่มแฮมเบอร์เกอร์สำหรับมือถือ */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">เปิดเมนู</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - แสดงเฉพาะเมื่อจำเป็น */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
              {navItems.map((item, index) => (
                <MobileNavLink 
                  key={item.name} 
                  item={item} 
                  pathname={pathname} 
                  index={index}
                  onClick={closeMenu}
                />
              ))}
            </div>

            {isLoggedIn && user ? (
              <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm">
                <div className="flex items-center px-4 py-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={user.profileImage} alt={displayName} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{displayName}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                    >
                      <User className="h-5 w-5" />
                      โปรไฟล์
                    </motion.div>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeMenu}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                    >
                      <Settings className="h-5 w-5" />
                      ตั้งค่า
                    </motion.div>
                  </Link>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    ออกจากระบบ
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-2 border-t border-gray-200 bg-gray-50/80">
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="block w-full px-4 py-2 text-center font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md shadow-sm"
                  >
                    เข้าสู่ระบบ
                  </motion.div>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={closeMenu}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="block w-full px-4 py-2 text-center font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-md shadow-md"
                  >
                    สมัครสมาชิก
                  </motion.div>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;