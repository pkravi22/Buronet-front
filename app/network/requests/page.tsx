"use client";

import { User, Check, X, ArrowLeft, Clock, Settings, UserCheck, ShieldAlert } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { AlertModal } from '@/components/AlertModal';
import Link from 'next/link';

const RequestsPage = () => {
  const { 
    pendingRequests, 
    networkMetrics,
    isLoading, 
    error, 
    acceptRequest, 
    declineRequest, 
    clearError 
  } = useConnections();

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {error && <AlertModal duration={4000} message={error} type="error" onClose={clearError} />}

      {/* Main Container: Max-width 1124px is standard for desktop dashboards */}
      <div className="max-w-[1124px] mx-auto pt-8 px-4 lg:px-0">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* LEFT SIDEBAR: Standard Desktop Navigation Pattern */}
          <aside className="w-full md:w-[280px] shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-gray-900">Manage Network</h2>
              </div>
              <nav className="flex flex-col">
                <Link href="/circle" className="px-4 py-3 flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium">Back to Circle</span>
                </Link>
                <div className="px-4 py-3 flex items-center justify-between text-blue-600 bg-blue-50/50 border-r-4 border-blue-600">
                  <div className="flex items-center gap-3">
                    <UserCheck size={18} />
                    <span className="text-sm font-bold">Invitations</span>
                  </div>
                  <span className="text-xs font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                </div>
              </nav>
            </div>

            {/* Quick Stats Widget */}
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Insights</h3>
               <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Total Connections</span>
                  <span className="font-bold text-gray-900">{networkMetrics?.totalConnections || 0}</span>
               </div>
            </div>
          </aside>

          {/* RIGHT CONTENT: The actual requests list */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b flex justify-between items-center bg-white">
                <h1 className="text-lg font-bold text-gray-900">
                  Pending Invitations
                </h1>
              </div>

              {isLoading ? (
                <div className="p-20 flex justify-center"><LoadingSpinner /></div>
              ) : pendingRequests.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {pendingRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-5">
                        {/* Enlarged Desktop Avatar */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200 shadow-inner group-hover:scale-105 transition-transform">
                          <User size={32} className="text-blue-500" />
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-lg hover:underline cursor-pointer">
                            {request.sender?.firstName} {request.sender?.lastName}
                          </span>
                          <span className="text-gray-600 text-sm max-w-[400px] leading-relaxed">
                            {request.sender?.headline || "No headline provided"}
                          </span>
                          <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-1 text-gray-400">
                                <Clock size={12} />
                                <span className="text-[11px]">2 days ago</span>
                             </div>
                             <span className="text-[11px] text-blue-600 font-medium">
                               3 mutual connections
                             </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Wider for Desktop */}
                      <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                        <button 
                          onClick={() => declineRequest(request.id)}
                          className="flex-1 sm:flex-none px-5 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition-all border border-transparent"
                        >
                          Ignore
                        </button>
                        <button 
                          onClick={() => acceptRequest(request.id)}
                          className="flex-1 sm:flex-none px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-md active:scale-95"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="p-20 text-center">
                  <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                     <User size={48} className="text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-xl">No pending invitations</h3>
                  <p className="text-gray-500 mt-2 max-w-[300px] mx-auto">
                    Try searching for colleagues or classmates to grow your network.
                  </p>
                  <Link href="/circle" className="inline-block mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-shadow shadow-lg">
                    Find People
                  </Link>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;