import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';
import RightBar from './components/RightBar';

export default function MentorshipPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4]">
      <TopBar />
      <div className="flex flex-1 pt-[61px]">
        <div className="w-[239px]" /> {/* Placeholder for fixed navbar */}
        <Navbar activeItem="Mentorship" />
        <main className="flex-1 px-6 ml-6">
          <MainContent />
        </main>
        <RightBar />
      </div>
    </div>
  );
} 