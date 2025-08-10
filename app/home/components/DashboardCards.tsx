import { FaFire, FaNewspaper, FaLaptopCode, FaGraduationCap } from 'react-icons/fa';

interface UpdateCardProps {
  icon: React.ReactNode;
  title: string;
  updates: number;
  iconColor: string;
}

const updateData: UpdateCardProps[] = [
  { icon: <FaFire size={16} />, title: "Trending Topics", updates: 111, iconColor: "text-[#EF4444]" },
  { icon: <FaNewspaper size={16} />, title: "Current Affairs", updates: 49, iconColor: "text-[#3B82F6]" },
  { icon: <FaLaptopCode size={16} />, title: "Exam Updates", updates: 74, iconColor: "text-[#22C55E]" },
  { icon: <FaGraduationCap size={16} />, title: "Popular Profiles", updates: 62, iconColor: "text-[#A855F7]" },
];

const UpdateCard: React.FC<UpdateCardProps> = ({ icon, title, updates, iconColor }) => {
  return (
    <div className="w-full h-24 bg-gradient-to-br from-[#DDECFF] to-[#E3EAFF] rounded-xl">
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
        <p className="text-sm text-[#6B7280]">{updates} new updates</p>
      </div>
    </div>
  );
};

const MobileIcon: React.FC<Omit<UpdateCardProps, 'updates'>> = ({ icon, title, iconColor }) => {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <p className="text-xs text-center text-[#4B5563] font-medium">{title}</p>
    </div>
  )
}

const DashboardCards = () => {
  return (
    // This new wrapper centers the content and constrains its width
    <div className="flex justify-center w-full px-4 sm:px-0">
        <div className="w-full max-w-[640px]">
            {/* --- Mobile View (< sm) --- */}
            <div className="sm:hidden flex justify-around items-start gap-4 py-4">
                {updateData.map(card => (
                <MobileIcon key={card.title} icon={card.icon} title={card.title} iconColor={card.iconColor} />
                ))}
            </div>

            {/* --- Tablet (2x2) and Desktop (1x4) View (>= sm) --- */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:flex lg:flex-row justify-center items-center gap-4">
                {updateData.map(card => (
                <div key={card.title} className="w-full lg:flex-1">
                    <UpdateCard {...card} />
                </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default DashboardCards;