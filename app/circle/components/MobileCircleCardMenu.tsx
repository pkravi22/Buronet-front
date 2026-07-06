// MobileCircleCardMenu.tsx
"use client";

import React from 'react';
import { SuggestedUserDto } from '@/lib/types/connections'; // Assuming this path is correct

// Assuming DashboardCardProps are defined in your project
interface DashboardCardProps {
    title: string;
    icon: React.ReactElement;
    iconColor: string;
    refLink: string;
}

interface MobileCircleCardMenuProps {
    cards: DashboardCardProps[];
}

const MobileCircleCardMenu: React.FC<MobileCircleCardMenuProps> = ({ cards }) => {
  return (
    <div className="py-4 px-4 sm:px-0 bg-white shadow-sm sm:shadow-none rounded-b-xl sm:rounded-none">
      <div className="grid grid-cols-4 gap-4">
        {cards.slice(0, 4).map((card, index) => (
          <a
            key={index}
            href={card.refLink}
            className="flex flex-col items-center justify-start text-center group"
          >
            <div 
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-1 transition-colors duration-200`}
              // Use inline style to apply the dynamic color to the background
              style={{ backgroundColor: card.iconColor.replace('text', 'bg').replace('text-', 'bg-') }}
            >
              {/* Clone the icon and enforce white text color */}
              {React.cloneElement(card.icon, { size: 24, className: 'text-white' })}
            </div>
            <p className="text-xs font-medium text-[#4B5563] group-hover:text-[#0096c7] transition-colors duration-200 leading-tight">
              {card.title.split(' ').slice(0, 2).join(' ')} 
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MobileCircleCardMenu;