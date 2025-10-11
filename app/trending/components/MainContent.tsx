"use client";

import React, { useState } from 'react';

// --- Mock Data and Components ---
// In a real app, this data would come from an API.
const mockTrendingPosts = [
  {
    category: 'Education',
    readTime: 4,
    postedAgo: '3 hours ago',
    title: 'Online Learning Platform Sees Record Growth',
    description: 'E-learning platforms experience unprecedented user growth as digital education becomes mainstream.',
    author: { handle: '@edu_trends', pic: 'https://placehold.co/32x32/E3EAFF/5E98FF?text=E' },
    views: '892K',
    likes: '18K',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
  },
  {
    category: 'Technology',
    readTime: 5,
    postedAgo: '5 hours ago',
    title: 'New AI Chip Breakthrough',
    description: 'Revolutionary semiconductor technology promises to accelerate artificial intelligence processing capabilities.',
    author: { handle: '@tech_news', pic: 'https://placehold.co/32x32/D1FAE5/10B981?text=T' },
    views: '1.2M',
    likes: '25K',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
  },
  {
    category: 'Government',
    readTime: 6,
    postedAgo: '8 hours ago',
    title: 'Digital Voting System Implementation',
    description: 'Secure electronic voting systems roll out nationwide to enhance democratic participation and transparency.',
    author: { handle: '@gov_tech', pic: 'https://placehold.co/32x32/DBEAFE/3B82F6?text=G' },
    views: '756K',
    likes: '14K',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop',
  },
  {
    category: 'Jobs',
    readTime: 4,
    postedAgo: '1 day ago',
    title: 'Remote Work Revolution Continues',
    description: 'Companies worldwide embrace flexible work models as productivity and employee satisfaction reach new...',
    author: { handle: '@job_market', pic: 'https://placehold.co/32x32/F3E8FF/A855F7?text=J' },
    views: '2.1M',
    likes: '42K',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop',
  },
  {
    category: 'Education',
    readTime: 5,
    postedAgo: '1 day ago',
    title: 'STEM Education Initiative Launch',
    description: 'New national program aims to boost science, technology, engineering, and mathematics education...',
    author: { handle: '@edu_future', pic: 'https://placehold.co/32x32/E3EAFF/5E98FF?text=E' },
    views: '643K',
    likes: '12K',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
  },
  {
    category: 'Jobs',
    readTime: 3,
    postedAgo: '2 days ago',
    title: 'Tech Industry Job Growth',
    description: 'Technology sector continues robust hiring with record-breaking job opportunities across multiple disciplines.',
    author: { handle: '@job_market', pic: 'https://placehold.co/32x32/F3E8FF/A855F7?text=J' },
    views: '987K',
    likes: '19K',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
  },
];

const topTags = ['#UPSCPrep', '#SSCExams', '#BankPO', '#TeachingJobs', '#DefenseRecruitment', '#StatePSC', '#ExamTips'];
const filterTabs = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'Teaching', 'Defense', 'State PSC'];

// --- Sub-components for UI elements ---

const PostCard = ({ post }: { post: typeof mockTrendingPosts[0] }) => (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
            <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
            <span className="absolute top-3 left-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full">{post.category}</span>
            <button className="absolute top-3 right-3 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
        </div>
        <div className="p-4">
            <div className="text-xs text-gray-500 mb-2">
                <span>{post.readTime} min read</span> • <span>{post.postedAgo}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">{post.title}</h3>
            <p className="text-sm text-gray-600 mb-4 h-10">{post.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                    <img src={post.author.pic} alt={post.author.handle} className="w-6 h-6 rounded-full mr-2" />
                    <span>{post.author.handle}</span>
                </div>
                <div className="flex items-center space-x-4">
                     <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>{post.views}</span>
                    <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88Z"></path></svg>{post.likes}</span>
                </div>
            </div>
        </div>
    </div>
);


const TrendingTopicsPage = () => {
    const [activeTab, setActiveTab] = useState('All');

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Trending Topics</h1>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:underline flex items-center">
                        View All <span className="ml-1">→</span>
                    </a>
                </div>

                {/* Top Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {topTags.map(tag => (
                        <button key={tag} className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-1 rounded-full hover:bg-gray-100">
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {filterTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                
                {/* Count and Sort */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-600">9 articles found</p>
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option>Latest</option>
                            <option>Most Popular</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockTrendingPosts.map((post, index) => (
                        <PostCard key={index} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendingTopicsPage;
