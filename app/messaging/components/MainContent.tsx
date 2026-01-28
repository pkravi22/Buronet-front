// app/messaging/page.tsx
'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
// Import ChevronLeft for the back button
import {
  Search,
  CheckCircle,
  ChevronDown,
  Paperclip,
  Send,
  MessageSquarePlus,
  ChevronLeft,
} from 'lucide-react';
// Restore original imports
import AppLayout from '@/components/AppLayout';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { ConversationDto } from '@/lib/types/message';
import { useChat } from '@/hooks/useChat';
import { useConnections } from '@/hooks/useConnections';
import { useAuth, withAuthRequired } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { formatTimeAgo } from '@/lib/dates';

// --- Mock Interfaces (Removed) ---
// --- MOCK IMPLEMENTATIONS (Removed) ---
// --- End of Helper Interfaces ---

const MessagingPage: React.FC = () => {
  const messagingMainClassName =
    'flex-1 max-h-[calc(100vh-3rem)] overflow-y-auto lg:pl-8 lg:pr-2 lg:mt-16 md:px-8 sm:px-0';

  const {
    conversations,
    selectedConversation, // This is now managed by useChat
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    error,
    selectConversation, // This is now managed by useChat
    sendMessage,
    createConversation, // This is now managed by useChat
    refetchConversations,
  } = useChat();

  const { user: currentUser } = useAuth(); // Get the current authenticated user from AuthContext

  const { connections, isLoading: isLoadingConnections } = useConnections();

  const [messageInput, setMessageInput] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [newChatError, setNewChatError] = useState<string | null>(null);
  const [newChatQuery, setNewChatQuery] = useState('');

  // const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialErrorRef = useRef(false);
  const [showChatView, setShowChatView] = useState(false);
  const isInitialLoadRef = useRef(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [selectedConversation?.id, messages.length]);

  // NEW: Automatic Retry Logic
    useEffect(() => {
        // Only run if there is an error AND we haven't successfully refetched yet
        if (error && !initialErrorRef.current) {
            console.log('Detected initial connection error. Attempting automatic retry...');
            initialErrorRef.current = true; // Mark that we've encountered the first error
            
            // Wait a moment (e.g., 500ms) to allow any underlying service initialization to complete
            const timer = setTimeout(() => {
                refetchConversations();
            }, 500); 

            return () => clearTimeout(timer); // Cleanup timer if component unmounts
        }
    }, [error, refetchConversations]);

  useEffect(() => {
  isInitialLoadRef.current = true;
}, [selectedConversation?.id]);


  /**
   * Wrapper function to handle selecting a conversation or deselecting (going back).
   */
  const handleSelectConversation = (conversationId: number) => {
    selectConversation(conversationId);
    setShowChatView(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedConversation) {
      await sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const normalizeForSearch = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, ' ')
      .trim();

  const getDisplayName = (user: any) => {
    const firstName = (user?.firstName || '').trim();
    const lastName = (user?.lastName || '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user?.username || 'Unknown User';
  };

  const connectionUsers = (connections || [])
    .map((c) => c.connectedUser)
    .filter(Boolean)
    .filter((u: any) => u.id !== currentUser?.id);

  const filteredConnectionUsers = (() => {
    const q = normalizeForSearch(newChatQuery);
    if (!q) return connectionUsers;
    const tokens = q.split(' ').filter(Boolean);
    return connectionUsers.filter((u: any) => {
      const haystack = normalizeForSearch(
        `${u.username || ''} ${u.firstName || ''} ${u.lastName || ''}`,
      );
      return tokens.every((t) => haystack.includes(t));
    });
  })();

  const handleStartChatWithUser = async (targetUserId: string) => {
    if (!targetUserId || !currentUser?.id) return;

    // If a 1:1 conversation already exists, open it instead of creating a duplicate
    const existing = conversations.find((c) => {
      const ids = (c.participants || [])
        .map((p) => p.user?.id || p.userId)
        .filter(Boolean) as string[];
      return (
        ids.length === 2 && ids.includes(currentUser.id) && ids.includes(targetUserId)
      );
    });

    if (existing) {
      setShowNewChatInput(false);
      setNewChatQuery('');
      setNewChatError(null);
      handleSelectConversation(existing.id);
      return;
    }

    setIsCreatingConversation(true);
    setNewChatError(null);
    try {
      const newConv = await createConversation([targetUserId]);
      if (newConv) {
        setShowNewChatInput(false);
        setNewChatQuery('');
        handleSelectConversation(newConv.id);
      } else {
        setNewChatError('Failed to create new conversation.');
      }
    } catch (err: any) {
      setNewChatError(err.message || 'Failed to create new conversation.');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Helper to get the other participant's info in a 1:1 chat
  const getOtherParticipant = (chat: ConversationDto) => {
    if (!chat || !chat.participants) return null; // Guard against undefined
    return chat.participants.find((p) => p.user.id !== currentUser?.id)?.user;
  };

  // --- Conditional Rendering for Loading/Error States ---
  if (isLoadingConversations) {
    return (
      <AppLayout mainClassName={messagingMainClassName}>
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner />{' '}
          <span className="ml-2 text-gray-700">Loading chats...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout mainClassName={messagingMainClassName}>
        <div className="text-red-600 text-center py-8">
          <p>Error loading messaging service: {error as string}</p>
          <button
            onClick={refetchConversations}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout mainClassName={messagingMainClassName}>
      {/* Main container:
        - Added responsive margins: `mx-2` (mobile) and `md:mx-8` (medium+).
        - Added `overflow-hidden` to prevent layout issues during screen transitions.
      */}
      <div className="flex bg-white rounded-lg lg:shadow-sm border border-[#E5E7EB] mt-16 lg:mt-8 mx-2 md:mr-6 md:ml-2 py-2 px-2 h-[calc(100vh-80px-3.5rem)] lg:h-[calc(100vh-61px-3rem)] laptop:ml-[6.5rem]">
        {/* Recent Chats Sidebar:
          - Default (mobile): `w-full`, `flex` (visible)
          - Mobile (chat selected): `hidden`
          - Medium+ screens (`md`): `w-80`, `flex` (always visible)
        */}
        
        <div
          className={`
            ${showChatView ? 'hidden' : 'flex'}
            md:flex flex-col h-full w-full md:w-80 md:border-r border-gray-200 overflow-y-auto
          `}
        >
          {/* <Navbar /> */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-lg">Chats</span>
            <button
              onClick={() => {
                setShowNewChatInput((prev) => !prev);
                setNewChatError(null);
                setNewChatQuery('');
              }}
              className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100 transition"
              title="Start new conversation"
            >
              <MessageSquarePlus size={20} />
            </button>
          </div>
          {/* New Chat Input */}
          {showNewChatInput && (
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search your connections by name"
                value={newChatQuery}
                onChange={(e) => setNewChatQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                disabled={isCreatingConversation}
              />
              {newChatError && (
                <p className="text-red-500 text-xs mt-1">{newChatError}</p>
              )}

              <div className="mt-2 max-h-56 overflow-y-auto">
                {isLoadingConnections ? (
                  <div className="text-xs text-gray-500 py-2">Loading connections…</div>
                ) : filteredConnectionUsers.length === 0 ? (
                  <div className="text-xs text-gray-500 py-2">No matching connections.</div>
                ) : (
                  filteredConnectionUsers.slice(0, 25).map((u: any) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleStartChatWithUser(u.id)}
                      disabled={isCreatingConversation}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-blue-50 transition text-left disabled:opacity-60"
                    >
                      <img
                        src={getProfileImageUrl(u.profilePictureUrl)}
                        alt={u.username || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{getDisplayName(u)}</div>
                        <div className="text-xs text-gray-500 truncate">@{u.username}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          <div className="p-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {conversations.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                No conversations yet. Start a new one!
              </div>
            ) : (
              conversations.map((chat) => {
                const otherParticipant = getOtherParticipant(chat); // Cast here
                return (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition ${
                      selectedConversation?.id === chat.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectConversation(chat.id)}
                  >
                    <img
                      src={
                        getProfileImageUrl(otherParticipant?.avatar)
                      }
                      alt={otherParticipant?.username || 'Unknown User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">
                          {otherParticipant?.username || 'Unknown Chat'}
                        </span>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          {chat.lastMessage
                            ? formatTimeAgo(chat.lastMessage.sentAt)
                            : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500 truncate">
                          {chat.lastMessage?.content || 'No messages yet.'}
                        </span>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chatbox:
          - Default (mobile): `w-full`, `hidden`
          - Mobile (chat selected): `flex` (visible)
          - Medium+ screens (`md`): `flex-1`, `flex` (always visible)
        */}
        <div
          className={`
            ${showChatView ? 'flex' : 'hidden'}
            md:flex flex-col h-full w-full md:flex-1
          `}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-4 border-b border-gray-100 px-4 md:px-6 py-4">
                {/* NEW: Back button, only visible on mobile (md:hidden) */}
                <button
                  onClick={() => setShowChatView(false)}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full md:hidden sticky top-0"
                  title="Back to chats"
                >
                  <ChevronLeft size={22} />
                </button>

                <img
                  src={
                    getProfileImageUrl(
                      getOtherParticipant(selectedConversation as ConversationDto)?.avatar,
                    )
                  }
                  alt={
                    getOtherParticipant(selectedConversation as ConversationDto)?.username || // Cast here
                    'Unknown User'
                  }
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">
                    {getOtherParticipant(selectedConversation as ConversationDto)?.username || // Cast here
                      'Unknown Chat'}
                  </div>
                  <div className="text-xs text-gray-400">Online</div>{' '}
                  {/* Placeholder for online status */}
                </div>
              </div>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 px-4 md:px-6 py-4 overflow-y-auto bg-[#F7F9FB] scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex flex-col gap-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <LoadingSpinner />{' '}
                      <span className="ml-2 text-gray-700">
                        Loading messages...
                      </span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-gray-500 text-center">
                      No messages in this conversation. Say hello!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === currentUser?.id
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2 max-w-xs break-words text-sm shadow-sm ${
                            msg.senderId === currentUser?.id
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                          }`}
                        >
                          {msg.content}
                          <span className="block text-[10px] text-right mt-1 opacity-60">
                            {formatTimeAgo(msg.sentAt)}
                            {msg.senderId === currentUser?.id && (
                              <CheckCircle
                                size={12}
                                className="inline ml-1 text-white"
                              />
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {/* <div ref={messagesEndRef} /> */}
                </div>
              </div>
              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 px-4 md:px-6 py-4 border-t border-gray-100"
              >
                {/* Button for attachments. Not yet workable */}
                {/* <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                >
                  <Paperclip size={20} />
                </button> */}
                <input
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 rounded-full bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={isSendingMessage}
                />
                <button
                  type="submit"
                  className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition"
                  disabled={isSendingMessage || !messageInput.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            // This placeholder is now only shown on medium+ screens when no chat is selected
            <div className="flex-1 md:flex items-center justify-center text-gray-500 hidden">
              Select a chat to start messaging, or click the + button to create a new one.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default withAuthRequired(MessagingPage);

