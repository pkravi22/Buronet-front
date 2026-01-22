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
import { useState, useRef } from 'react';
import CreatePollModal from './components/CreatePollModal';
import CreateByteModal from './components/CreateBytePostModal';
import { useAuth } from '@/context/AuthContext';
import Home from './components/hero-page/page';
import { useUserProfile } from '@/hooks/useUserProfile';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import '../restrictScroll.css';
import { AuthRedirectHandler } from '@/components/authRedirectHandler';

const HomePage: React.FC = () => {

  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isCreateByteModalOpen, setIsCreateByteModalOpen] = useState(false);
  // State to trigger refetching of posts after a new post is created
  // This is passed as a key to PostSection to force it to re-render and refetch
  const [postsRefetchKey, setPostsRefetchKey] = useState(0);
  const { user: authUser, isLoading: isAuthLoading } = useAuth(); 
  const { userProfile, isLoading: isProfileLoading } = useUserProfile(); 
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Combine loading state, especially if the home page relies on profile data
  const isLoading = isAuthLoading || (authUser && isProfileLoading);

  // CRITICAL: Conditional rendering based on loading and auth status
  if (isAuthLoading) {
    console.log("Auth loading...", authUser);
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Checking authentication...</span>
      </div>
    );
  }
  
  // If authenticated but profile is loading, show loading
  if (authUser && isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading user profile...</span>
      </div>
    );
  }
  
  // If not authenticated, let the AuthRedirectHandler handle the redirect (assuming it's working)
 if(!authUser){
    // isLoading = false;
    return (
      <div>
        <Home/>
      </div>
    )
  }

  // Callback function to be executed when a post is successfully created in the modal
  const handlePostCreated = () => {
    // Increment the key to force PostSection to refetch its data
    setPostsRefetchKey(prev => prev + 1);
    // The modal will call onClose itself, so no need to explicitly close here
  };

  return (
    <AuthRedirectHandler>
    <div className="max-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      <div className="flex flex-1 pt-[80px]">
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem="Home" />
        {/* Placeholder is now hidden on small screens and visible on large screens */}
        {/* <div className="hidden lg:block lg:w-[239px] shrink-0" /> */}
        {/* <Navbar activeItem="Home" /> */}
        <main ref={mainRef} className="flex-1 px-4 sm:px-6 lg:mx-1 overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide"> {/* Margin is now responsive */}
          <div className="">
            <DashboardCards />
            <InsightsSection onShareArticleClick={() => setIsCreatePostModalOpen(true)} onCreatePollClick={() => setIsCreatePollModalOpen(true)} onShareByteClick={() => setIsCreateByteModalOpen(true)} />
            <PostSection postsRefetchKey={postsRefetchKey}/>
            {/* Using the new PostSection component */}  
            {/* <PostSectionOld /> */}
          </div>
        </main>
        <div className="fixed h-[21px] lg:hidden"></div> {/* Hide fixed height div on desktop */}
        <RightSidebar scrollSourceRef={mainRef} />
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
      {/* </SiteLayout> */}
    </div>
    </AuthRedirectHandler>
  );
}

export default HomePage;