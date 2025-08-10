"use client";

import { TrendingUp, Hash, UserPlus } from 'lucide-react';

const trendingTopics = [
  { id: 1, name: "UPSC Preparation", posts: "2.5K posts" },
  { id: 2, name: "Banking Exams", posts: "1.8K posts" },
  { id: 3, name: "Railway Jobs", posts: "1.2K posts" },
  { id: 4, name: "SSC CGL", posts: "950 posts" },
  { id: 5, name: "Defense Exams", posts: "780 posts" }
];

const suggestedCreators = [
  {
    id: 1,
    name: "UPSC Mentor",
    username: "@upscmentor",
    avatar: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20man%20in%20his%2030s%20with%20friendly%20expression%20wearing%20formal%20attire%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20education%20mentor&width=80&height=80&seq=307&orientation=squarish",
    followers: "125K"
  },
  {
    id: 2,
    name: "Banking Expert",
    username: "@bankingexpert",
    avatar: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20woman%20in%20her%2030s%20with%20friendly%20expression%20wearing%20business%20attire%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20banking%20expert&width=80&height=80&seq=308&orientation=squarish",
    followers: "98K"
  },
  {
    id: 3,
    name: "Railway Guide",
    username: "@railwayguide",
    avatar: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20man%20in%20his%2030s%20with%20friendly%20expression%20wearing%20railway%20uniform%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20railway%20official&width=80&height=80&seq=309&orientation=squarish",
    followers: "75K"
  }
];

const RightSidebar = () => {
  return (
    <div className="w-[320px] p-6">
      {/* Trending Topics */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-[#3B82F6]" />
          <h2 className="text-[#1F2937] font-semibold">Trending Topics</h2>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-[#3B82F6]" />
                <span className="text-[#1F2937] font-medium">{topic.name}</span>
              </div>
              <span className="text-[#6B7280] text-sm">{topic.posts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Creators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#1F2937] font-semibold">Suggested Creators</h2>
          <button className="text-[#3B82F6] text-sm hover:text-[#2563EB]">See All</button>
        </div>
        <div className="space-y-4">
          {suggestedCreators.map((creator) => (
            <div key={creator.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-[#1F2937] font-medium">{creator.name}</p>
                  <p className="text-[#6B7280] text-sm">{creator.followers} followers</p>
                </div>
              </div>
              <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <UserPlus size={14} />
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar; 