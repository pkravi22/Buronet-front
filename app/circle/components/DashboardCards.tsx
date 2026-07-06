"use client";

import { useRouter } from 'next/navigation';

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
  if (!refLink) return;
  
  // Remove any leading slash from the prop, then add one back
  const cleanPath = refLink.startsWith('/') ? refLink : `/${refLink}`;
  router.push(cleanPath);
};

  return (
    // The component wrapper now uses classes that work for BOTH designs.
    // On small screens, it centers content. On medium screens, it behaves like a standard grid item.
    <div 
      className="w-full cursor-pointer flex justify-center md:block" // Add flex justify-center for mobile centering
      onClick={() => handleOpenClick(refLink)}
    >
      {/* SMALL SCREEN (Mobile First) Design: Circular Icon with Title Below 
        This is the default view.
      */}
      <div className="flex flex-col items-center justify-center gap-2 md:hidden">
        {/* Circular Icon Container */}
        <div 
          className={`w-16 h-16 rounded-full shadow-md flex items-center justify-center bg-white border-2 border-opacity-20 ${iconColor.replace('text-', 'border-')}`} // Use icon color for border
        >
          {/* Icon */}
          <span className={`${iconColor} scale-[1.75]`}> {/* Increase icon size */}
            {icon}
          </span>
        </div>
        {/* Title Below */}
        <h3 className="text-[#1F2937] font-medium text-xs text-center px-1 max-w-[80px] leading-tight h-8 line-clamp-2">{title}</h3>
      </div>

      {/* MEDIUM SCREEN (Desktop/Tablet) Design: Original Card Layout 
        This view is hidden by default and appears only on md screens and up.
      */}
      <div className="hidden md:block w-full h-32 bg-gradient-to-br from-[#DDECFF] to-[#E5F6FD] rounded-xl">
        <div className="h-full px-4 py-4 flex flex-col justify-between">
          {/* Top Section */}
          <div className="flex items-center">
            {/* Icon Container - Standard Square */}
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <span className={`${iconColor}`}>
                {icon}
              </span>
            </div>
            {/* Title */}
            <div className="ml-3">
              <h3 className="text-[#1F2937] font-medium text-sm">{title}</h3>
            </div>
          </div>

        <div>
          <p className={`text-[#1F2937] font-semibold ${value === "Coming Soon" ? "text-xl italic" : "text-2xl"}`}>
            {value}
          </p>

          <div className="flex items-center gap-1 mt-1">
            {trendIcon && (
              <span className={trendColor}>
                {trendIcon}
              </span>
            )}
            {/* Only show trend text if it's NOT "Coming Soon" */}
            {value !== "Coming Soon" && (
              <p className="text-xs text-[#6B7280]">{trend}</p>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardCard;