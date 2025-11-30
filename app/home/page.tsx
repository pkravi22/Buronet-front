'use client';
import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import RightSidebar from '../home/components/RightSidebar';
import DashboardCards from '../home/components/DashboardCards';
import InsightsSection from '../home/components/InsightsSection';
import PostSectionOld from '../home/components/PostSectionOld';
import PostSection from '../home/components/PostSection'; // Updated import for new PostSection
import SiteLayout from '@/components/SiteLayout';
import CreatePostModal from './components/CreatePostModal';
import { useState } from 'react';
import CreatePollModal from './components/CreatePollModal';
import CreateByteModal from './components/CreateBytePostModal';
import { useAuth } from '@/context/AuthContext';
import Home from './components/hero-page/page';

const HomePage: React.FC = () => {

  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isCreateByteModalOpen, setIsCreateByteModalOpen] = useState(false);
  const { user, isLoading=false } = useAuth();

  // State to trigger refetching of posts after a new post is created
  // This is passed as a key to PostSection to force it to re-render and refetch
  const [postsRefetchKey, setPostsRefetchKey] = useState(0);

  // Callback function to be executed when a post is successfully created in the modal
  const handlePostCreated = () => {
    // Increment the key to force PostSection to refetch its data
    setPostsRefetchKey(prev => prev + 1);
    // The modal will call onClose itself, so no need to explicitly close here
  };

  if(!user){
    // isLoading = false;
    return (
      <div>
        <Home/>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-[#EEF0F4]">
      {/* <TopBar /> */}
      <SiteLayout>
        <div className="h-16"></div>
      <div className="flex flex-1">
        {/* Placeholder is now hidden on small screens and visible on large screens */}
        {/* <div className="hidden lg:block lg:w-[239px] shrink-0" /> */}
        {/* <Navbar activeItem="Home" /> */}
        <main className="flex-1 px-4 sm:px-6 lg:mx-1 laptop:w-[80%]"> {/* Margin is now responsive */}
          <div className="mt-6">
            <DashboardCards />
            <InsightsSection onShareArticleClick={() => setIsCreatePostModalOpen(true)} onCreatePollClick={() => setIsCreatePollModalOpen(true)} onShareByteClick={() => setIsCreateByteModalOpen(true)} />
            <PostSection postsRefetchKey={postsRefetchKey}/>
            {/* Using the new PostSection component */}
            <PostSectionOld />
          </div>
        </main>
        <RightSidebar />
      </div>
      <CreatePostModal
        isOpen={isCreatePostModalOpen} // Controls modal visibility
        onClose={() => setIsCreatePostModalOpen(false)} // Function to close the modal
        onPostCreated={handlePostCreated} // Callback for when a post is successfully created
      />
      <CreatePollModal
        isOpen={isCreatePollModalOpen} // Controls modal visibility
        onClose={() => setIsCreatePollModalOpen(false)} // Function to close the modal
        onPostCreated={handlePostCreated} // Callback for when a poll is successfully created
      />
      <CreateByteModal
        isOpen={isCreateByteModalOpen} // Controls modal visibility
        onClose={() => setIsCreateByteModalOpen(false)} // Function to close the modal
      />
      </SiteLayout>
    </div>
  );
}

export default HomePage;