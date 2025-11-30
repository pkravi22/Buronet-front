import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';
import RightBar from './components/RightBar';

export default function CirclePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      {/* FIX: Set to flex-col on mobile, switch to flex-row on large screens (lg) */}
      <div className="flex flex-col lg:flex-row flex-1 pt-[61px]">
        {/* Placeholder: Keep hidden on mobile, only appears when Navbar is fixed on desktop */}
        <div className="hidden lg:block w-[20%] ml-4 xl:w-[270px] desktop:ml-0 desktop:w-[245px] left-6 shrink-0" />
        
        <Navbar activeItem="My Circle" />
        
        {/* FIX: Remove width constraints for mobile flow, let it be full width */}
        <main className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] desktop:ml-3">
          <MainContent />
        </main>
        
        <div className="fixed h-[21px] lg:hidden"></div> {/* Hide fixed height div on desktop */}
        
        {/* RightBar is rendered last in the JSX, so in flex-col mode, it flows naturally below MainContent. */}
        <RightBar />
      </div>
    </div>
  );
}