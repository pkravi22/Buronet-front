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
} from 'react-icons/fi';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

const navItems: NavItem[] = [
  { href: '/home', label: 'Home', icon: FiHome },
  { href: '/circle', label: 'My Circle', icon: FiUsers },
  { href: '/bytes', label: 'Bytes', icon: FiVideo },
  { href: '/jobs', label: 'Jobs', icon: FiBriefcase },
  { href: '/exams', label: 'Exams', icon: FiBook },
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

  return (
    <nav
      className={
        'hidden laptop:block fixed top-[61px] left-6 my-6 w-16 rounded-lg shadow-sm border border-[#E5E7EB] bg-white min-h-[calc(100vh-61px-3rem)] z-40'
      }
      aria-label="Primary"
    >
      <ul className="py-5 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={
                  `w-11 h-11 flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 ${
                    active
                      ? 'bg-[#E3EAFF] text-[#5E98FF]'
                      : 'hover:bg-gray-50 text-[#505965]'
                  }`
                }
              >
                <Icon size={22} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
