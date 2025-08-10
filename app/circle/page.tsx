import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';
import RightBar from './components/RightBar';

export default function CirclePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4]">
      <TopBar />
      <div className="flex flex-1 pt-[61px]">
        {/* Placeholder correctly collapses on smaller screens */}
        <div className="hidden lg:block lg:w-[239px] shrink-0" />
        <Navbar activeItem="My Circle" />
        <main className="flex-1 px-4 sm:px-6">
          <MainContent />
        </main>
        <RightBar />
      </div>
    </div>
  );
}