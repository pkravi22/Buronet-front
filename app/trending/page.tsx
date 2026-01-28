import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';

export default function TrendingPage() {
  return (
    <div className="max-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px]">
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem={"Home"} />
        <main className="flex-1 px-4 sm:px-6 lg:mx-1 overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <MainContent />
        </main>
        <div className="fixed h-[21px] lg:hidden"></div>
      </div>
    </div>
  );
} 