"use client";

import React from 'react';
import { useUnreadMessages } from '@/context/UnreadMessagesContext';

const Link = ({ href, className, children }: { href: string; className: string; children: React.ReactNode }) => (
  <a href={href} className={className}>{children}</a>
);

const FiHome = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const FiUsers = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const FiBriefcase = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);
const FiBook = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4h8a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z" />
    <path d="M22 4h-8a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h8z" />
  </svg>
);

const FiVideo = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const FiMessageSquare = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  isActive: boolean;
  badge?: number;
}

const NavItem = ({ icon, text, href, isActive, badge }: NavItemProps) => {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center justify-center p-2 relative w-16 transition-colors ${
          isActive ? 'text-[#00B4D8]' : 'text-gray-500'
        }`}
      >
        <div className="flex flex-col items-center">
          {React.cloneElement(icon as React.ReactElement, { size: 24 })}
          {badge && (
            <span className="absolute top-[-4px] right-[-8px] bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {badge}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
};

interface BytesNavbarProps {
  activeItem?: string | null;
}

const BytesNavbar = ({ activeItem }: BytesNavbarProps) => {
  const { totalUnreadCount } = useUnreadMessages();

  const navItems = [
    { icon: <FiHome size={20} />, text: 'Home', href: '/home' },
    { icon: <FiUsers size={20} />, text: 'My Circle', href: '/followers' },
    { icon: <FiVideo size={20} />, text: 'Bytes', href: '/bytes' },
    { icon: <FiBriefcase size={20} />, text: 'Jobs & Exams', href: '/jobs' },
    { icon: <FiMessageSquare size={20} />, text: 'Messaging', href: '/messaging', badge: totalUnreadCount > 0 ? totalUnreadCount : undefined }
  ];

  return (
    <nav className="w-full bg-white border-t border-gray-200 shadow-t-md z-50">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={item.text === activeItem}
          />
        ))}
      </ul>
    </nav>
  );
};

export default BytesNavbar;
