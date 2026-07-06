"use client";

import React from 'react'; // Import React
import { useUnreadMessages } from '@/context/UnreadMessagesContext';
import { useAuth } from '@/context/AuthContext';

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
const FiUserCheck = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
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
    {/* Left page */}
    <path d="M2 4h8a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z" />
    {/* Right page */}
    <path d="M22 4h-8a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h8z" />
  </svg>
);

const FiVideo = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const FiMessageSquare = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const FiLogOut = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const FiUser = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
        className={`flex items-center mx-4 my-1 px-4 py-3 rounded-md transition-colors ${isActive
            ? 'bg-[#E5F6FD] text-[#00B4D8]'
            : 'hover:bg-gray-50 text-[#505965]'
          }`}
      >
        <div className="flex items-center w-full">
          <span className="w-6 h-6 flex items-center *:w-full *:h-full">{icon}</span>
          <span className="ml-6 text-base font-semibold">{text}</span>
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
  const { totalUnreadCount } = useUnreadMessages();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: <FiHome size={20} />, text: 'Home', href: '/home' },
    // { icon: <FiUsers size={20} />, text: 'My Circle', href: '/circle' },
    // { icon: <FiUserCheck size={20} />, text: 'Followers', href: '/followers' },
    { icon: <FiUsers size={20} />, text: 'My Circle', href: '/followers' },
    { icon: <FiVideo size={20} />, text: 'Bytes', href: '/bytes' },
    { icon: <FiBriefcase size={20} />, text: 'Jobs & Exams', href: '/jobs' },
    { icon: <FiMessageSquare size={20} />, text: 'Messaging', href: '/messaging', badge: totalUnreadCount > 0 ? totalUnreadCount : undefined }
  ];

  return (
    <>
      <style jsx>{`
        @media (min-width: 1600px) {
          nav.navbar-desktop {
            zoom: 1 !important;
          }
        }
      `}</style>
      {/* --- Desktop Sidebar (Visible on lg screens and up) --- */}
      <nav
        className={`navbar-desktop
          hidden lg:flex flex-col justify-between
          fixed top-[61px] ml-6 xl:w-[260px] lg-laptop:w-[20%] rounded-lg
          shadow-sm border border-[#E5E7EB] my-6 z-40
          min-h-[calc(100vh-61px-3rem)] ultra:min-h-[calc(90vh-61px-7rem)] xl-ultra:min-h-[calc(80vh-61px-10.5rem)] bg-white
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

        {user && (
          <div className="border-t border-[#E5E7EB] mt-auto pt-2 pb-2">
            <button 
              onClick={logout} 
              className="flex items-center mx-4 my-1 px-4 py-3 rounded-md transition-colors hover:bg-gray-50 text-[#505965] w-[calc(100%-2rem)] text-left"
            >
              <div className="flex items-center w-full">
                <span className="w-6 h-6 flex items-center shrink-0">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 border border-gray-200">
                      <FiUser size={14} />
                    </div>
                  )}
                </span>
                <span className="ml-6 text-base font-semibold">Logout</span>
                <span className="ml-auto flex items-center">
                  <FiLogOut size={20} className="text-gray-400" />
                </span>
              </div>
            </button>
          </div>
        )}
      </nav>

      {/* --- Mobile Sticky Bottom Bar (Hidden on lg screens and up) --- */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-t-md z-50">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex flex-col items-center justify-center p-2 relative w-16">
                <div className={`relative transition-colors ${item.text === activeItem ? 'text-[#00B4D8]' : 'text-gray-500'
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
      {/* <div className="h-16"></div> */}
    </>
  );
};

export default Navbar;

