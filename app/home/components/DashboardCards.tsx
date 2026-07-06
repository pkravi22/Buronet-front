// import { Link } from 'lucide-react';
// import { FaFire, FaNewspaper, FaLaptopCode, FaGraduationCap } from 'react-icons/fa';
// import {useRouter} from 'next/navigation';

// const router = useRouter();

// interface UpdateCardProps {
//   icon: React.ReactNode;
//   title: string;
//   updates: number;
//   iconColor: string;
//   refLink?: string;
// }

// const updateData: UpdateCardProps[] = [
//   { icon: <FaFire size={16} />, title: "Trending Topics", updates: 111, iconColor: "text-[#EF4444]", refLink: "" },
//   { icon: <FaNewspaper size={16} />, title: "Current Affairs", updates: 49, iconColor: "text-[#06b6d4]", refLink: "/current-affairs" },
//   { icon: <FaLaptopCode size={16} />, title: "Exam Updates", updates: 74, iconColor: "text-[#22C55E]", refLink: "" },
//   { icon: <FaGraduationCap size={16} />, title: "Popular Profiles", updates: 62, iconColor: "text-[#A855F7]", refLink: "" },
// ];

//  const handleOpenClick = (refLink: string) => {
//     if (refLink && refLink !== "") {
//       // Navigate to the specified link
//       router.push(`/${refLink}`);
//     }
//   };

// const UpdateCard: React.FC<UpdateCardProps> = ({ icon, title, updates, iconColor, refLink }) => {
//   return (
//     <div className="w-full h-24 bg-gradient-to-br from-[#DDECFF] to-[#E5F6FD] rounded-xl" onClick={() => handleOpenClick(refLink || "")}>
//       <div className="h-full px-4 py-4 flex flex-col justify-between">
//         <div className="flex items-center">
//           <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
//             <span className={`${iconColor}`}>
//               {icon}
//             </span>
//           </div>
//           <div className="ml-3">
//             <h3 className="text-[#1F2937] font-medium text-[12px]">{title}</h3>
//           </div>
//         </div>
//         <p className="text-[12px] text-[#6B7280]">{updates} new updates</p>
//       </div>
//     </div>
//   );
// };

// const MobileIcon: React.FC<Omit<UpdateCardProps, 'updates'>> = ({ icon, title, iconColor, refLink }) => {
//   return (
//     <div className="flex flex-col items-center gap-2 flex-1">
//       <div className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center ${iconColor}`}>
//         {icon}
//       </div>
//       <p className="text-xs text-center text-[#4B5563] font-medium">{title}</p>
//     </div>
//   )
// }

// const DashboardCards = () => {
//   return (
//     // This new wrapper centers the content and constrains its width
//     <div className="flex justify-center w-full px-4 sm:px-0">
//         <div className="w-full max-w-[640px]">
//             {/* --- Mobile View (< sm) --- */}
//             <div className="sm:hidden flex justify-around items-start gap-4 py-4">
//                 {updateData.map(card => (
//                   // <Link key={card.title} href={card.refLink}>
//                     <MobileIcon icon={card.icon} title={card.title} iconColor={card.iconColor}/>
//                   // </Link>
//                 ))}
//             </div>

//             {/* --- Tablet (2x2) and Desktop (1x4) View (>= sm) --- */}
//             <div className="hidden sm:grid sm:grid-cols-2 lg:flex lg:flex-row justify-center items-center gap-4">
//                 {updateData.map(card => (
//                 // <Link key={card.title} href={card.refLink}>
//                   <div key={card.title} className="w-full lg:flex-1" onClick={() => handleOpenClick(card.refLink || "")}>
//                       <UpdateCard {...card} />
//                   </div>
//                 // </Link>
//                 ))}
//             </div>
//         </div>
//     </div>
//   );
// };

// export default DashboardCards;

import React from 'react';
import { Link } from 'lucide-react';
import { FaFire, FaNewspaper, FaLaptopCode, FaGraduationCap } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Interfaces for component props
interface UpdateCardProps {
  icon: React.ReactNode;
  title: string;
  updates: number;
  iconColor: string;
  refLink?: string;
}

// Data for the cards
const updateData: UpdateCardProps[] = [
  { icon: <FaFire size={16} />, title: "Trending Topics", updates: 0, iconColor: "text-[#EF4444]", refLink: "/trending" },
  { icon: <FaNewspaper size={16} />, title: "Current Affairs", updates: 0, iconColor: "text-[#06b6d4]", refLink: "/current-affairs" },
  { icon: <FaLaptopCode size={16} />, title: "Exam Updates", updates: 0, iconColor: "text-[#22C55E]", refLink: "/exam-updates" },
  { icon: <FaGraduationCap size={16} />, title: "Popular Profiles", updates: 0, iconColor: "text-[#A855F7]", refLink: "/followers" },
];

const UpdateCard: React.FC<UpdateCardProps> = ({ icon, title, updates, iconColor }) => {
  return (
    <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl px-2.5 py-4 flex flex-col justify-center h-[88px]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-50 rounded-xl flex shrink-0 items-center justify-center">
          <span className={`${iconColor}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 14 })}
          </span>
        </div>
        <div className="flex flex-col min-w-0 justify-center">
          <h3 className="text-gray-900 font-bold text-[13px] leading-tight truncate">{title}</h3>
          <p className="text-[11px] text-gray-500 truncate mt-0.5">{updates != 0 ? `${updates} new updates` : `All ${title}`}</p>
        </div>
      </div>
    </div>
  );
};

// Reusable component for mobile view
const MobileIcon: React.FC<Omit<UpdateCardProps, 'updates'>> = ({ icon, title, iconColor }) => {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <p className="text-xs text-center text-[#4B5563] font-medium">{title}</p>
    </div>
  );
};

// Main functional component
const DashboardCards = () => {
  const router = useRouter();

  const handleOpenClick = (refLink: string | undefined) => {
    // Only navigate if a valid refLink exists
    if (refLink && refLink !== "") {
      router.push(refLink);
    }
  };

  return (
    // This new wrapper centers the content and constrains its width
    <div className="flex justify-center w-full px-4 sm:px-0">
      <div className="w-full max-w-[640px]">
        {/* --- Mobile View (< sm) --- */}
        <div className="sm:hidden flex justify-around items-start gap-4 py-4">
          {updateData.map(card => (
            <div 
              key={card.title} 
              className="flex-1"
              onClick={() => handleOpenClick(card.refLink)}
            >
              <MobileIcon icon={card.icon} title={card.title} iconColor={card.iconColor} />
            </div>
          ))}
        </div>

        {/* --- Tablet (2x2) and Desktop (1x4) View (>= sm) --- */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:flex lg:flex-row justify-center items-center gap-4">
          {updateData.map(card => (
            <div 
              key={card.title} 
              className="w-full lg:flex-1 cursor-pointer"
              onClick={() => handleOpenClick(card.refLink)}
            >
              <UpdateCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
