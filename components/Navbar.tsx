"use client";

import React from 'react'; // Import React

// --- Mock Implementations to Resolve Errors ---
// In a real Next.js project, you would install `react-icons` and `next`
// These mocks allow the component to be displayed in this environment.

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
const FiVideo = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const FiMessageSquare = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);


// --- Reusable NavItem component for the Desktop Sidebar ---
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

// --- Main Navbar Component ---
interface NavbarProps {
  activeItem?: string | null;
}

const Navbar = ({ activeItem }: NavbarProps) => {
  const navItems = [
    { icon: <FiHome size={20} />, text: 'Home', href: '/home' },
    { icon: <FiUsers size={20} />, text: 'My Circle', href: '/circle' },
    { icon: <FiVideo size={20} />, text: 'Bytes', href: '/bytes' },
    { icon: <FiBriefcase size={20} />, text: 'Jobs', href: '/jobs' },
    { icon: <FiBriefcase size={20} />, text: 'Exams', href: '/exams' },
    { icon: <FiMessageSquare size={20} />, text: 'Messaging', href: '/messaging'}
  ];

  return (
    <>
      {/* --- Desktop Sidebar (Visible on lg screens and up) --- */}
      <nav
        className={`
          hidden lg:block
          fixed top-[61px] left-6 w-[260px] rounded-lg
          shadow-sm border border-[#E5E7EB] my-6
          min-h-[calc(100vh-61px-3rem)] bg-white
        `}
      >
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

      {/* --- Mobile Sticky Bottom Bar (Hidden on lg screens and up) --- */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-t-md z-50">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex flex-col items-center justify-center p-2 relative w-16">
                 <div className={`relative transition-colors ${
                    item.text === activeItem ? 'text-[#5E98FF]' : 'text-gray-500'
                  }`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                  {/* {item.badge && (
                    <span className="absolute top-[-4px] right-[-8px] bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )} */}
                 </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Add padding to the bottom of the body on mobile to prevent content from being hidden behind the nav bar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;

