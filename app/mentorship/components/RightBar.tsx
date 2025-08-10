"use client";

interface Mentor {
  id: number;
  name: string;
  designation: string;
  photo: string;
  expertise: string[];
  rating: number;
  reviews: number;
  experience: number;
  price: string;
  availability: string;
}

interface Category {
  id: number;
  name: string;
  count: number;
  gradient: string;
}

const featuredMentors: Mentor[] = [
  { id: 1, name: "Rajesh Kumar, IAS", designation: "Joint Secretary, Ministry of Finance", photo: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20man%20in%20his%2040s%20with%20dignified%20expression%20wearing%20formal%20administrative%20service%20uniform%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20government%20official&width=120&height=120&seq=65&orientation=squarish", expertise: ["UPSC Preparation", "Public Administration", "Economic Policy"], rating: 4.9, reviews: 156, experience: 15, price: "₹2,500", availability: "Available this week" },
  { id: 2, name: "Michael Rodriguez", designation: "Marketing Director at Netflix", photo: "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520Latino%2520man%2520in%2520his%252040s%2520with%2520friendly%2520expression%252C%2520wearing%2520business%2520casual%2520attire%252C%2520high%2520quality%2520studio%2520lighting%252C%2520professional%2520headshot%2520style%252C%2520clean%2520neutral%2520background%252C%2520marketing%2520executive&width=120&height=120&seq=66&orientation=squarish", expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"], rating: 4.8, reviews: 96, experience: 12, price: "$90", availability: "Limited availability" }
];

const mentorCategories: Category[] = [
  { id: 1, name: "Research & Development", count: 245, gradient: "from-blue-500 to-indigo-600" },
  { id: 2, name: "Technology", count: 189, gradient: "from-indigo-500 to-purple-600" },
  { id: 3, name: "Design", count: 176, gradient: "from-purple-500 to-pink-600" }
];

const RightBar = () => {
  // Use static data for upcoming sessions, recommended mentors, and resources
  return (
    <div className="w-[287px] mr-6 mt-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#1F2937] font-medium">Upcoming Sessions</h2>
            <span className="text-[#6B7280] text-sm">2 sessions</span>
          </div>
          <div className="space-y-4">
            {/* Example session */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Today, 3:00 PM
                </span>
                <button className="text-gray-400 hover:text-red-600">
                  <span>X</span>
                </button>
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520an%2520Asian%2520woman%2520in%2520her%252030s%2520with%2520confident%2520expression%252C%2520wearing%2520business%2520attire%252C%2520high%2520quality%2520studio%2520lighting%252C%2520professional%2520headshot%2520style%252C%2520clean%2520neutral%2520background%252C%2520tech%2520industry%2520professional&width=80&height=80&seq=73&orientation=squarish"
                  alt="Dr. Emily Chen"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-sm">Dr. Emily Chen</h3>
                  <p className="text-xs text-gray-500">Product Strategy Session</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-50 transition cursor-pointer">
                  Reschedule
                </button>
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition cursor-pointer">
                  Join Meeting
                </button>
              </div>
            </div>
          </div>
          <button className="w-full text-[#2563EB] font-medium mt-[40px] py-2 hover:bg-[#F3F4F6] rounded">
            View All Sessions
          </button>
        </div>

        <div className="mt-6 mb-10">
          <h2 className="text-[#1F2937] font-medium mb-4">Recommended Mentors</h2>
          <div className="space-y-4">
            {featuredMentors.slice(0, 2).map((mentor) => (
              <div key={mentor.id} className="flex justify-between items-center">
                <div className="flex">
                  <img
                    src={mentor.photo}
                    alt={mentor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="text-[#1F2937] font-medium text-sm">{mentor.name}</h3>
                    <p className="text-[#6B7280] text-xs">{mentor.designation}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < Math.floor(mentor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        {mentor.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F4F6] rounded">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM12 8.7H8.7V12H7.3V8.7H4V7.3H7.3V4H8.7V7.3H12V8.7Z" fill="#2563EB"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button className="w-full text-[#2563EB] font-medium mt-[40px] py-2 hover:bg-[#F3F4F6] rounded">
            View All Mentors
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-[#1F2937] font-medium mb-4">Resources</h2>
          <div className="space-y-4">
            {mentorCategories.slice(0, 3).map((category) => (
              <div key={category.id} className="bg-[#F9FAFB] rounded-xl p-4">
                <div className="flex">
                  <div className={`w-10 h-10 bg-[#DBE9FE] rounded-lg flex items-center justify-center`}>
                    <span className="text-[#2563EB]">★</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-[#1F2937] font-medium text-sm">{category.name}</h3>
                    <p className="text-[#6B7280] text-xs">{category.count} mentors</p>
                  </div>
                </div>
                <button className="w-full mt-4 h-[34px] bg-white border border-[#BFD9FE] text-[#2563EB] font-medium rounded flex items-center justify-center hover:bg-[#F8FAFC]">
                  Explore
                </button>
              </div>
            ))}
          </div>
          <button className="w-full text-[#2563EB] font-medium mt-[40px] py-2 hover:bg-[#F3F4F6] rounded">
            View All Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightBar; 