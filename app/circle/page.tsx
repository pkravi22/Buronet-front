import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';
import RightBar from './components/RightBar';

export default function CirclePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      <div className="flex flex-1 pt-[61px]">
        {/* Placeholder correctly collapses on smaller screens */}
        <div className="hidden lg:block xl:w-[270px] laptop:w-[245px] left-6 shrink-0" />
        <Navbar activeItem="My Circle" />
        <main className="w-[100%] flex-1 px-4 sm:px-6 xl:w-full laptop:w-[50%] laptop:ml-3">
          <MainContent />
        </main>
        <div className="fixed h-[21px]"></div>
        <RightBar />
      </div>
    </div>
  );
}