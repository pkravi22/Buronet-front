import Link from 'next/link';
import { AiOutlineHome, AiOutlineMessage } from 'react-icons/ai';
import { BsPeople } from 'react-icons/bs';
import { MdWorkOutline } from 'react-icons/md';
import { RiVipCrownLine } from 'react-icons/ri';
import { IoDocumentTextOutline } from 'react-icons/io5';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">
            <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              <AiOutlineHome className="text-xl" />
              <span>Home</span>
            </Link>
            
            <Link href="/circle" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              <BsPeople className="text-xl" />
              <span>My Circle</span>
            </Link>
            
            <Link href="/jobs" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              <MdWorkOutline className="text-xl" />
              <span>Jobs</span>
            </Link>
            
            <Link href="/membership" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              <RiVipCrownLine className="text-xl" />
              <span>Membership</span>
            </Link>
            
            <Link href="/bytes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              <IoDocumentTextOutline className="text-xl" />
              <span>Bytes</span>
            </Link>
            
            <Link href="/messaging" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              <AiOutlineMessage className="text-xl" />
              <span>Messaging</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 