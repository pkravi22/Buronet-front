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
        <main className="flex-1 px-4 sm:px-6 xl:w-full laptop:w-[50%] laptop:ml-3">
          <MainContent />
        </main>
        <div className="fixed h-[21px]"></div>
        <RightBar />
      </div>
    </div>
  );
}

// export default function CirclePage() {
//   return (
//     <div className="min-h-screen flex flex-col bg-[#EEF0F4] pb-6">
//       <TopBar />
//       <div className="flex flex-1 pt-[61px] justify-center"> {/* Added justify-center */}
//         
//         {/* LEFT SIDEBAR/NAVBAR: Hidden on mobile, appears on large screens (lg) */}
//         <Navbar activeItem="My Circle" />
//         
//         {/* MAIN CONTENT/FEED: Full width on mobile, constrained max-width in the center on desktop */}
//         <main className="flex-1 w-full max-w-[640px] px-0 sm:px-4">
//           <MainContent />
//         </main>
//         
//         {/* RIGHT SIDEBAR (assuming RightBar is complex/heavy): Hidden on large screens, appears on extra large screens (xl) */}
//         <RightBar/>
//       </div>
//     </div>
//   );
// }