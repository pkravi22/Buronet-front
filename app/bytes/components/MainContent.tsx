"use client";

import { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Music, UserPlus } from 'lucide-react';

interface Byte {
  id: number;
  videoUrl: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  description: string;
  likes: number;
  comments: number;
  shares: number;
  music: string;
}

const sampleBytes: Byte[] = [
  {
    id: 1,
    videoUrl: "https://readdy.ai/api/search-image?query=short%20video%20of%20a%20person%20explaining%20UPSC%20preparation%20tips%20with%20whiteboard%20animation%20and%20text%20overlays%20professional%20educational%20content%20style&width=360&height=640&seq=301&orientation=portrait",
    author: {
      name: "UPSC Mentor",
      username: "@upscmentor",
      avatar: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20man%20in%20his%2030s%20with%20friendly%20expression%20wearing%20formal%20attire%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20education%20mentor&width=80&height=80&seq=302&orientation=squarish"
    },
    description: "5 Essential Tips for UPSC Prelims Preparation #upsc #civilservices #exam",
    likes: 12500,
    comments: 234,
    shares: 567,
    music: "UPSC Preparation Tips - Original Sound"
  },
  {
    id: 2,
    videoUrl: "https://readdy.ai/api/search-image?query=short%20video%20of%20a%20person%20explaining%20banking%20exam%20preparation%20with%20animated%20graphics%20and%20text%20overlays%20professional%20educational%20content%20style&width=360&height=640&seq=303&orientation=portrait",
    author: {
      name: "Banking Expert",
      username: "@bankingexpert",
      avatar: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20woman%20in%20her%2030s%20with%20friendly%20expression%20wearing%20business%20attire%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20banking%20expert&width=80&height=80&seq=304&orientation=squarish"
    },
    description: "How to Crack IBPS PO in First Attempt #banking #ibps #career",
    likes: 8900,
    comments: 156,
    shares: 432,
    music: "Banking Exam Tips - Original Sound"
  },
  {
    id: 3,
    videoUrl: "https://readdy.ai/api/search-image?query=short%20video%20of%20a%20person%20explaining%20railway%20exam%20preparation%20with%20animated%20graphics%20and%20text%20overlays%20professional%20educational%20content%20style&width=360&height=640&seq=305&orientation=portrait",
    author: {
      name: "Railway Guide",
      username: "@railwayguide",
      avatar: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20man%20in%20his%2030s%20with%20friendly%20expression%20wearing%20railway%20uniform%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20railway%20official&width=80&height=80&seq=306&orientation=squarish"
    },
    description: "RRB JE Preparation Strategy 2025 #railway #rrb #engineering",
    likes: 7600,
    comments: 189,
    shares: 345,
    music: "Railway Exam Guide - Original Sound"
  },
  {
    id: 4,
    videoUrl: "https://readdy.ai/api/search-image?query=short%20video%20of%20a%20person%20explaining%20SSC%20CGL%20preparation%20with%20animated%20graphics%20and%20text%20overlays%20professional%20educational%20content%20style&width=360&height=640&seq=307&orientation=portrait",
    author: {
      name: "SSC Expert",
      username: "@sscexpert",
      avatar: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20an%20Indian%20woman%20in%20her%2030s%20with%20friendly%20expression%20wearing%20business%20attire%20high%20quality%20studio%20lighting%20professional%20headshot%20style%20clean%20neutral%20background%20education%20expert&width=80&height=80&seq=308&orientation=squarish"
    },
    description: "Complete SSC CGL Preparation Guide 2025 #ssc #cgl #governmentjobs",
    likes: 6800,
    comments: 145,
    shares: 289,
    music: "SSC CGL Guide - Original Sound"
  }
];

const ByteCard = ({ byte }: { byte: Byte }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="relative h-[calc(100vh-61px)] w-[360px] bg-black rounded-lg overflow-hidden">
      {/* Video/Image */}
      <img
        src={byte.videoUrl}
        alt={byte.description}
        className="w-full h-full object-cover"
      />

      {/* Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {/* Author Info */}
        <div className="flex items-center mb-4">
          <img
            src={byte.author.avatar}
            alt={byte.author.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div className="ml-3">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold">{byte.author.name}</p>
              <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <UserPlus size={14} />
                Follow
              </button>
            </div>
            <p className="text-white/80 text-sm">{byte.author.username}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white mb-4 text-sm">{byte.description}</p>

        {/* Music Info */}
        <div className="flex items-center gap-2 mb-4">
          <Music size={16} className="text-white" />
          <p className="text-white text-sm">{byte.music}</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center"
        >
          <Heart 
            size={28} 
            className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors`} 
          />
          <span className="text-white text-xs mt-1">{byte.likes}</span>
        </button>

        <button className="flex flex-col items-center">
          <MessageCircle size={28} className="text-white" />
          <span className="text-white text-xs mt-1">{byte.comments}</span>
        </button>

        <button className="flex flex-col items-center">
          <Share2 size={28} className="text-white" />
          <span className="text-white text-xs mt-1">{byte.shares}</span>
        </button>

        <button 
          onClick={() => setIsSaved(!isSaved)}
          className="flex flex-col items-center"
        >
          <Bookmark 
            size={28} 
            className={`${isSaved ? 'fill-white text-white' : 'text-white'} transition-colors`} 
          />
        </button>

        <button className="flex flex-col items-center">
          <MoreVertical size={28} className="text-white" />
        </button>
      </div>
    </div>
  );
};

const MainContent = () => {
  const [currentByteIndex, setCurrentByteIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentByteIndex < sampleBytes.length - 1) {
      setCurrentByteIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentByteIndex > 0) {
      setCurrentByteIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div 
        ref={containerRef}
        onWheel={handleScroll}
        className="w-[360px] h-[calc(100vh-61px)] overflow-hidden"
      >
        <ByteCard byte={sampleBytes[currentByteIndex]} />
      </div>
    </div>
  );
};

export default MainContent; 