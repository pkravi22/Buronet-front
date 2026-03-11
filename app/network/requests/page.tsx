"use client";

import { User, ArrowLeft, Clock, UserCheck, Send, Users } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { AlertModal } from '@/components/AlertModal';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/dates';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { get } from '@/lib/api';
import { ConnectionDto } from '@/lib/types/connections';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

const RequestsPage = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'received' | 'sent' | 'connections' | null;
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'connections'>(initialTab || 'received');
  const [connectionsList, setConnectionsList] = useState<ConnectionDto[]>([]);
  const [connectionsPage, setConnectionsPage] = useState(1);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [hasMoreConnections, setHasMoreConnections] = useState(true);

  const { 
    pendingRequests, 
    pendingOutgoingRequests,
    networkMetrics,
    isLoading, 
    error, 
    acceptRequest, 
    declineRequest, 
    clearError 
  } = useConnections({ includeOutgoingPending: true });

  const fetchConnections = useCallback(async (page: number) => {
    try {
      setLoadingConnections(true);
      // The endpoint returns a paginated object: { page, pageSize, totalCount, totalPages, data }
      const res = await get<any>(`/connections/all?page=${page}&pageSize=10`);
      
      const newConnections = res?.data || res?.Data || [];
      const totalPages = res?.totalPages || res?.TotalPages || 0;

      if (newConnections.length > 0) {
        setConnectionsList(prev => page === 1 ? newConnections : [...prev, ...newConnections]);
        // specific check for pagination end
        setHasMoreConnections(page < totalPages);
      } else {
        if (page === 1) setConnectionsList([]);
        setHasMoreConnections(false);
      }
    } catch (error) {
      console.error("Failed to fetch connections", error);
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'connections') {
        fetchConnections(1);
        setConnectionsPage(1);
        setHasMoreConnections(true); 
    }
  }, [activeTab, fetchConnections]);

  const loadMoreConnections = () => {
    const nextPage = connectionsPage + 1;
    setConnectionsPage(nextPage);
    fetchConnections(nextPage);
  };

  const sortedPendingRequests = [...pendingRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedOutgoingRequests = [...pendingOutgoingRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                  <span className="text-sm font-medium">Back to My Circle</span>
                </Link>
                
                <button
                  onClick={() => setActiveTab('received')}
                  className={`px-4 py-3 flex items-center justify-between transition-colors ${
                    activeTab === 'received' 
                      ? 'text-blue-600 bg-blue-50/50 border-r-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck size={18} />
                    <span className={`text-sm ${activeTab === 'received' ? 'font-bold' : 'font-medium'}`}>Invitations</span>
                  </div>
                  {pendingRequests.length > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'received' ? 'bg-blue-100' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {pendingRequests.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('sent')}
                  className={`px-4 py-3 flex items-center justify-between transition-colors ${
                    activeTab === 'sent' 
                      ? 'text-blue-600 bg-blue-50/50 border-r-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Send size={18} />
                    <span className={`text-sm ${activeTab === 'sent' ? 'font-bold' : 'font-medium'}`}>Sent Requests</span>
                  </div>
                  {pendingOutgoingRequests.length > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'sent' ? 'bg-blue-100' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {pendingOutgoingRequests.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('connections')}
                  className={`px-4 py-3 flex items-center justify-between transition-colors ${
                    activeTab === 'connections' 
                      ? 'text-blue-600 bg-blue-50/50 border-r-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} />
                    <span className={`text-sm ${activeTab === 'connections' ? 'font-bold' : 'font-medium'}`}>Total Connections</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'connections' ? 'bg-blue-100' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {networkMetrics?.totalConnections || 0}
                  </span>
                </button>
              </nav>
            </div>

          </aside>

          {/* RIGHT CONTENT: The actual requests list */}
          <main className="flex-1 space-y-6">
            
            {activeTab === 'received' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b flex justify-between items-center bg-white">
                  <h1 className="text-lg font-bold text-gray-900">
                    Pending Invitations
                  </h1>
                </div>

                {isLoading ? (
                  <div className="p-20 flex justify-center"><LoadingSpinner /></div>
                ) : sortedPendingRequests.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {sortedPendingRequests.map((request) => (
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
                            <Link href={`/profile/${request.sender?.id}`}>
                              <span className="font-bold text-gray-900 text-lg hover:underline cursor-pointer">
                                {request.sender?.firstName} {request.sender?.lastName}
                              </span>
                            </Link>
                            <span className="text-gray-600 text-sm max-w-[400px] leading-relaxed">
                              {request.sender?.headline || "No headline provided"}
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-gray-400">
                                  <Clock size={12} />
                                  <span className="text-[11px]">{formatTimeAgo(request.createdAt)}</span>
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
            )}

            {activeTab === 'sent' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b flex justify-between items-center bg-white">
                  <h1 className="text-lg font-bold text-gray-900">
                    Sent Requests
                  </h1>
                </div>

                {isLoading ? (
                  <div className="p-20 flex justify-center"><LoadingSpinner /></div>
                ) : sortedOutgoingRequests.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {sortedOutgoingRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-5">
                          {/* Avatar */}
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200 shadow-inner group-hover:scale-105 transition-transform">
                            <User size={32} className="text-blue-500" />
                          </div>
                          
                          <div className="flex flex-col">
                            <Link href={`/profile/${request.receiver?.id}`}>
                              <span className="font-bold text-gray-900 text-lg hover:underline cursor-pointer">
                                {request.receiver?.firstName} {request.receiver?.lastName}
                              </span>
                            </Link>
                            <span className="text-gray-600 text-sm max-w-[400px] leading-relaxed">
                              {request.receiver?.headline || "No headline provided"}
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-gray-400">
                                  <Clock size={12} />
                                  <span className="text-[11px]">{formatTimeAgo(request.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                          <span className="px-5 py-2 bg-gray-100 text-gray-500 font-semibold rounded-lg border border-gray-200 cursor-default">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-gray-400">
                    No sent requests found.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b flex justify-between items-center bg-white">
                  <h1 className="text-lg font-bold text-gray-900">
                    My Connections ({networkMetrics?.totalConnections || 0})
                  </h1>
                </div>

                {loadingConnections && connectionsPage === 1 ? (
                  <div className="p-20 flex justify-center"><LoadingSpinner /></div>
                ) : connectionsList.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {connectionsList.map((connection) => (
                      <div 
                        key={connection.id} 
                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors group"
                      >
                         <div className="flex items-center gap-5">
                          <Link href={`/profile/${connection.connectedUserId}`}>
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                                {connection.connectedUserProfilePictureUrl ? (
                                    <img src={getProfileImageUrl(connection.connectedUserProfilePictureUrl)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-blue-500" />
                                )}
                            </div>
                          </Link>
                          
                          <div className="flex flex-col">
                            <Link href={`/profile/${connection.connectedUserId}`}>
                                <span className="font-bold text-gray-900 text-lg hover:underline cursor-pointer">
                                {connection.connectedUser?.firstName} {connection.connectedUser?.lastName}
                                </span>
                            </Link>
                            <span className="text-gray-600 text-sm max-w-[400px] leading-relaxed">
                              {connection.connectedUser?.headline || connection.connectedUserHeadline || "No headline"}
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-gray-400">
                                  <Clock size={12} />
                                  <span className="text-[11px]">Connected {formatTimeAgo(connection.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                            <Link 
                                href={`/messaging?userId=${connection.connectedUserId}`}
                                className="px-5 py-2 border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 rounded-full transition-all text-sm"
                            >
                                Message
                            </Link>
                        </div>
                      </div>
                    ))}
                    
                    {hasMoreConnections && (
                        <div className="p-4 flex justify-center border-t border-gray-100">
                            <button
                                onClick={loadMoreConnections}
                                disabled={loadingConnections}
                                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loadingConnections ? 'Loading...' : 'Load more connections'}
                            </button>
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="p-20 text-center">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users size={48} className="text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-xl">No connections yet</h3>
                    <p className="text-gray-500 mt-2 max-w-[300px] mx-auto">
                      Start building your network by connecting with people you know.
                    </p>
                    <Link href="/circle" className="inline-block mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-shadow shadow-lg">
                      Find People
                    </Link>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;