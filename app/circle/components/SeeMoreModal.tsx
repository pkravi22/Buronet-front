import { SuggestedUserDto } from "@/lib/types/connections";
import { NetworkCard } from "./NetworkCard";

// Place this component outside of MainContent
interface SeeMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: SuggestedUserDto[];
  onConnectClick: (receiverId: string) => Promise<void>;
}

const SeeMoreModal: React.FC<SeeMoreModalProps> = ({ isOpen, onClose, title, users, onConnectClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#EEF0F4] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-[#1F2937]">{title}</h2>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Modal Body: User Grid */}
                <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <NetworkCard 
                                key={user.id} 
                                user={user} 
                                onConnectClick={onConnectClick} 
                                isConnected={false} // Assuming all users in 'See More' are not yet connected
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-[#6B7280] py-8">No more profiles found in this category.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeeMoreModal;