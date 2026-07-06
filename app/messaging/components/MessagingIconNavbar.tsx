"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiUsers,
  FiVideo,
  FiBriefcase,
  FiBook,
  FiMessageSquare,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';
import { useUnreadMessages } from '@/context/UnreadMessagesContext';
import { useAuth } from '@/context/AuthContext';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

const navItems: NavItem[] = [
  { href: '/home', label: 'Home', icon: FiHome },
  { href: '/followers', label: 'My Circle', icon: FiUsers },
  { href: '/bytes', label: 'Bytes', icon: FiVideo },
  { href: '/jobs', label: 'Jobs & Exams', icon: FiBriefcase },
  { href: '/messaging', label: 'Messaging', icon: FiMessageSquare },
];

const isActivePath = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  if (href === '/home') return pathname === '/home';
  if (href === '/messaging') return pathname.startsWith('/messaging');
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function MessagingIconNavbar() {
  const pathname = usePathname();
  const { totalUnreadCount } = useUnreadMessages();
  const { logout, user } = useAuth();

  return (
    <nav
      className={
        'hidden laptop:flex flex-col justify-between fixed top-[61px] left-6 my-6 w-16 rounded-lg shadow-sm border border-[#E5E7EB] bg-white h-[calc(100vh-61px-3rem)] ultra:h-[calc((100vh/1.25)-4rem)] xl-ultra:h-[calc((100vh/1.45)-4rem)] z-40'
      }
      aria-label="Primary"
    >
      <ul className="py-5 flex flex-col items-center gap-2 flex-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          const showBadge = item.href === '/messaging' && totalUnreadCount > 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={
                  `w-11 h-11 flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0096c7] focus:ring-offset-2 ${
                    active
                      ? 'bg-[#E5F6FD] text-[#00B4D8]'
                      : 'hover:bg-gray-50 text-[#505965]'
                  }`
                }
              >
                <div className="relative">
                  <Icon size={22} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-0.5">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      
      {user && (
        <div className="border-t border-[#E5E7EB] w-full flex justify-center pt-2 pb-5 mt-auto">
          <button
            onClick={logout}
            title="Logout"
            className="w-11 h-11 flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0096c7] hover:bg-gray-50 text-[#505965]"
          >
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} className="w-6 h-6 rounded-full object-cover" alt="Profile" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 border border-gray-200">
                <FiUser size={14} />
              </div>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
