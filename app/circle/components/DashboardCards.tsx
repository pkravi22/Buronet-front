"use client";

import { TrendingUp, Users, UserPlus, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import {useRouter} from 'next/navigation';


// --- INTERFACES ---
interface DashboardCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  iconColor: string;
  trendIcon?: React.ReactNode;
  trendColor?: string;
  refLink?: string;
}


// --- CHILD COMPONENTS ---
const DashboardCard = ({ title, value, trend, icon, iconColor, trendIcon, trendColor = "text-[#16A34A]", refLink }: DashboardCardProps) => {
  const router = useRouter();

  const handleOpenClick = (refLink: string | undefined) => {
    if (refLink) {
      router.push(`/${refLink}`);
    }
  };

  return (
  <div className="w-full h-32 bg-gradient-to-br from-[#DDECFF] to-[#E3EAFF] rounded-xl" onClick={() => handleOpenClick(refLink)}>
    <div className="h-full px-4 py-4 flex flex-col justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
          <span className={`${iconColor}`}>
            {icon}
          </span>
        </div>
        <div className="ml-3">
          <h3 className="text-[#1F2937] font-medium text-sm">{title}</h3>
        </div>
      </div>
      <div>
        <p className="text-[#1F2937] text-2xl font-semibold">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {trendIcon && (
            <span className={`${trendColor}`}>
              {trendIcon}
            </span>
          )}
          <p className="text-xs text-[#6B7280]">{trend}</p>
        </div>
      </div>
    </div>
  </div>)
};

// Note: This file also contains other components like NetworkCard and the main MainContent component.
// I have provided only the requested DashboardCard component and its props here.

export default DashboardCard;
