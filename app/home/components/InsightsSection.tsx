// components/InsightsSection.tsx
import { FaPen, FaPoll, FaCalendarAlt } from 'react-icons/fa';
import React from 'react'; // Import React

// --- Data for the action buttons ---
const actionButtonsData = [
  {
    icon: <FaPen size={12} />,
    title: "Share Article",
    description: "Write your thoughts",
    iconBgColor: "bg-[#F0FDF4]",
    iconColor: "text-[#22C55E]",
    actionType: "shareArticle", // Add an actionType to identify the button
  },
  {
    icon: <FaPoll size={16} />,
    title: "Create Poll",
    description: "Get community feedback",
    iconBgColor: "bg-[#ecfeff]",
    iconColor: "text-[#06b6d4]",
    actionType: "createPoll",
  },
  {
    icon: <FaCalendarAlt size={12} />,
    title: "Share Byte",
    description: "Share with your connections",
    iconBgColor: "bg-[#FAF5FF]",
    iconColor: "text-[#A855F7]",
    actionType: "shareByte",
  },
];


// --- Full-size button component ---
// FIX: Changed 'interface' to 'type'
type ActionButtonProps = (typeof actionButtonsData)[0] & {
  onClick?: (actionType: string) => void; // Add onClick prop
};

const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, description, iconBgColor, iconColor, actionType, onClick }) => {
  return (
    <button
      className="flex-1 min-w-0 w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl px-2.5 py-4 flex flex-col justify-center h-[88px]"
      onClick={() => onClick?.(actionType)}
    >
      <div className="flex items-center gap-2 w-full">
        <div className={`w-8 h-8 ${iconBgColor} rounded-xl flex items-center justify-center shrink-0`}>
          <span className={`${iconColor}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 14 })}
          </span>
        </div>
        <div className="flex flex-col min-w-0 justify-center text-left">
          <h3 className="text-gray-900 font-bold text-[13px] leading-tight truncate">{title}</h3>
          <p className="text-[11px] text-gray-500 truncate mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  );
};

// --- Compact mobile button component ---
// FIX: Changed 'interface' to 'type'
type MobileActionButtonProps = Omit<(typeof actionButtonsData)[0], 'description'> & {
  onClick?: (actionType: string) => void; // Add onClick prop
};

const MobileActionButton: React.FC<MobileActionButtonProps> = ({ icon, title, iconBgColor, iconColor, actionType, onClick }) => {
  return (
    <button
      className="flex flex-col items-center gap-2 flex-1 p-2 rounded-lg hover:bg-gray-50 transition-colors" // Made it a button and added hover
      onClick={() => onClick?.(actionType)} // Call onClick with actionType
    >
      <div className={`w-12 laptop:w-8 desktop:w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <p className="text-xs text-center text-[#4B5563] font-medium">{title}</p>
    </button>
  );
};


interface InsightsSectionProps {
  onShareArticleClick: () => void; // New prop for the click handler
  onCreatePollClick: () => void; // New prop for the click handler
  onShareByteClick: () => void; // New prop for the click handler
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ onShareArticleClick, onCreatePollClick, onShareByteClick }) => {
  const handleActionButtonClick = (actionType: string) => {
    if (actionType === "shareArticle") {
      onShareArticleClick();
    } else if (actionType === "createPoll") {
      onCreatePollClick();
    } else if (actionType === "shareByte") {
      onShareByteClick();
    }
    // Add logic for other action types (Create Poll, Host Event) here if needed
    // else if (actionType === "createPoll") { ... }
  };

  return (
    <div className="flex justify-center w-full px-4 sm:px-0">
      <div className="mt-6 bg-cyan-50 rounded-xl w-full max-w-[640px]">
        <div className="px-5 py-4">
          <h2 className="text-[#1F2937] text-lg font-bold mb-4 text-center">Share Your Professional Insights</h2>

          {/* --- Mobile View (< sm) --- */}
          <div className="sm:hidden flex justify-around items-start gap-4">
            {actionButtonsData.map(item => (
              <MobileActionButton
                key={item.title}
                {...item}
                onClick={handleActionButtonClick} // Pass the handler
              />
            ))}
          </div>

          {/* --- Desktop View (>= sm) --- */}
          <div className="hidden sm:flex flex-wrap sm:flex-nowrap gap-3">
            {actionButtonsData.map(item => (
              <ActionButton
                key={item.title}
                {...item}
                onClick={handleActionButtonClick} // Pass the handler
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;
