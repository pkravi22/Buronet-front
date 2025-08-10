// app/Navbar.tsx
"use client";

import { FiHome, FiUsers, FiBriefcase, FiBook, FiVideo, FiMessageSquare, FiX } from 'react-icons/fi';
import Link from 'next/link';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  isActive: boolean;
  badge?: number;
}

interface NavbarProps {
  isNavOpen: boolean;
  closeNav: () => void;
  activeItem?: string | null;
}

const NavItem = ({ icon, text, href, isActive, badge }: NavItemProps) => {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center mx-4 my-1 px-4 py-3 rounded-md transition-colors ${
          isActive
            ? 'bg-[#E3EAFF] text-[#5E98FF]'
            : 'hover:bg-gray-50 text-[#505965]'
        }`}
      >
        <div className="flex items-center w-full">
          <span className="w-5 h-5 flex items-center">{icon}</span>
          <span className="ml-8 text-sm font-medium">{text}</span>
          {badge && (
            <span className="ml-auto bg-[#EF4444] text-white text-xs rounded-full px-2 py-0.5">
              {badge}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
};


const Navbar = ({ isNavOpen, closeNav, activeItem }: NavbarProps) => {
  // NO state or standalone button logic here anymore.

  const navItems = [
    { icon: <FiHome size={20} />, text: 'Home', href: '/home' },
    { icon: <FiUsers size={20} />, text: 'My Circle', href: '/circle' },
    { icon: <FiBriefcase size={20} />, text: 'Jobs', href: '/jobs' },
    { icon: <FiBook size={20} />, text: 'Mentorship', href: '/mentorship' },
    { icon: <FiVideo size={20} />, text: 'Bytes', href: '/bytes' },
    { icon: <FiMessageSquare size={20} />, text: 'Messaging', href: '/messaging', badge: 3 }
  ];

  return (
    <>
      {/* Overlay for mobile view, appears when nav is open */}
      {isNavOpen && (
        <div 
          onClick={closeNav} 
          className="lg:hidden fixed inset-0 bg-black/30 z-30" 
        />
      )}

      {/* Navbar Panel */}
      <nav
        className={`
          fixed top-0 left-0 h-full bg-white z-40 transition-transform transform
          ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:h-auto lg:top-[61px] lg:left-6 lg:w-[260px] lg:rounded-lg
          lg:shadow-sm lg:border lg:border-[#E5E7EB] lg:my-6
          lg:min-h-[calc(100vh-61px-3rem)] shadow-xl border-r
        `}
      >
        <div className="flex justify-between items-center p-4 lg:hidden">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={closeNav} aria-label="Close navigation menu">
            <FiX size={24} />
          </button>
        </div>
        <ul className="py-5">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={item.text === activeItem}
            />
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;