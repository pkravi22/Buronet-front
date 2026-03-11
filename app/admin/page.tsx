'use client';

import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { AlertModal } from '@/components/AlertModal';
import { postApi } from '@/lib/api';
import TopBar from '@/components/TopBar';

const AdminPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [urlInput, setUrlInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoBack = () => {
    router.back();
  };

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Link href="/home" className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleDeleteAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!urlInput.trim()) {
      setErrorMessage('Please enter a URL');
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await postApi('/cloudinary/delete-assets', { url: urlInput });
      setSuccessMessage('Asset deleted successfully');
      setUrlInput('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to delete asset');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <TopBar />
      {successMessage && <AlertModal duration={3000} message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}
      {errorMessage && <AlertModal duration={4000} message={errorMessage} type="error" onClose={() => setErrorMessage('')} />}

      {/* Main Container with TopBar margin */}
      <div className="max-w-[1124px] mx-auto pt-6 px-4 sm:px-6 lg:px-0 mt-[61px]">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          
          {/* LEFT SIDEBAR */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-[77px]">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-gray-900">Admin Panel</h2>
              </div>
              <nav className="flex flex-col">
                <button onClick={handleGoBack} className="px-4 py-3 flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors text-sm sm:text-base w-full text-left">
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium">Go Back</span>
                </button>
                
                <button
                  className="px-4 py-3 flex items-center gap-3 text-blue-600 bg-blue-50/50 border-r-4 border-blue-600 transition-colors text-sm sm:text-base"
                >
                  <Trash2 size={18} />
                  <span className="text-sm font-bold">Delete Assets</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-white">
                <h1 className="text-base sm:text-lg font-bold text-gray-900">Delete Bytes/Assets</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Remove assets from Cloudinary by providing their URL</p>
              </div>

              <div className="p-4 sm:p-6">
                <form onSubmit={handleDeleteAsset} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Asset URL
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="url"
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={isDeleting}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the full URL of the asset you want to delete from Cloudinary
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isDeleting || !urlInput.trim()}
                    className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isDeleting ? (
                      <>
                        <LoadingSpinner />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        <span>Delete Asset</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Info Box */}
                <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">How to use</h3>
                  <ul className="text-xs sm:text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Copy the full URL of the asset you want to delete</li>
                    <li>Paste it in the URL field above</li>
                    <li>Click "Delete Asset" to remove it from Cloudinary</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
