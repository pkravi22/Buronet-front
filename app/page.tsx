import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Feed from '@/components/Feed';
import Trending from '@/components/Trending';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Feed />
            </div>
            
            <div className="lg:col-span-1">
              <Trending />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
