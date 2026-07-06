// // app/messaging/page.tsx
// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Search, CheckCircle, ChevronDown, Paperclip, Send, MessageSquarePlus } from 'lucide-react'; // Import MessageSquarePlus icon
// import AppLayout from '@/components/AppLayout';
// import LoadingSpinner from '@/components/UI/LoadingSpinner';
// import { useChat } from '@/hooks/useChat';
// import { useAuth, withAuthRequired } from '@/context/AuthContext';
// import { formatDistanceToNow } from 'date-fns'; // For formatting time

// const MessagingPage: React.FC = () => {
//   const {
//     conversations,
//     selectedConversation, // This is now managed by useChat
//     messages,
//     isLoadingConversations,
//     isLoadingMessages,
//     isSendingMessage,
//     error,
//     selectConversation, // This is now managed by useChat
//     sendMessage,
//     createConversation, // This is now managed by useChat
//     refetchConversations,
//   } = useChat();

//   const { user: currentUser } = useAuth(); // Get the current authenticated user from AuthContext

//   const [messageInput, setMessageInput] = useState('');
//   const [showNewChatInput, setShowNewChatInput] = useState(false);
//   const [newChatParticipantIds, setNewChatParticipantIds] = useState('');
//   const [isCreatingConversation, setIsCreatingConversation] = useState(false);
//   const [newChatError, setNewChatError] = useState<string | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll to bottom of messages whenever messages change
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (messageInput.trim() && selectedConversation) {
//       await sendMessage(messageInput);
//       setMessageInput('');
//     }
//   };

//   const handleCreateNewConversation = async () => {
//     if (!newChatParticipantIds.trim()) {
//       setNewChatError("Participant IDs cannot be empty.");
//       return;
//     }

//     setIsCreatingConversation(true);
//     setNewChatError(null);

//     try {
//       const participantIdsArray = newChatParticipantIds.split(',')
//                                                       .map(id => id.trim())
//                                                       .filter(id => id !== '');

//       const isValidGuids = participantIdsArray.every(id => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));
//       if (!isValidGuids) {
//         setNewChatError("Please enter valid GUIDs for participant IDs.");
//         setIsCreatingConversation(false);
//         return;
//       }

//       // FIX: Call createConversation without title
//       const newConv = await createConversation(participantIdsArray);
//       if (newConv) {
//         setShowNewChatInput(false);
//         setNewChatParticipantIds('');
//       }
//     } catch (err: any) {
//       setNewChatError(err.message || "Failed to create new conversation.");
//     } finally {
//       setIsCreatingConversation(false);
//     }
//   };

//   // Helper to get the other participant's info in a 1:1 chat
//   const getOtherParticipant = (chat: ConversationDto) => {
//     return chat.participants.find(p => p.user.id !== currentUser?.id)?.user;
//   };

//   // --- Conditional Rendering for Loading/Error States ---
//   if (isLoadingConversations) {
//     return (
//       <AppLayout>
//         <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
//           <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading chats...</span>
//         </div>
//       </AppLayout>
//     );
//   }

//   if (error) {
//     return (
//       <AppLayout>
//         <div className="text-red-600 text-center py-8">
//           <p>Error loading messaging service: {error}</p>
//           <button onClick={refetchConversations} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded">
//             Retry
//           </button>
//         </div>
//       </AppLayout>
//     );
//   }

//   return (
//     <AppLayout>
//       <div className="flex bg-white rounded-lg shadow-sm border border-[#E5E7EB] mt-16 mr-8 ml-8 py-2 px-2 h-[calc(100vh-61px-3rem)]">
//         {/* Recent Chats Sidebar */}
//         <div className="w-80 border-r border-gray-200 flex flex-col h-full">
//           <div className="p-4 border-b border-gray-100 flex items-center justify-between">
//             <span className="font-semibold text-lg">Chats</span>
//             <button
//               onClick={() => setShowNewChatInput(prev => !prev)}
//               className="text-gray-400 hover:text-[#0096c7] p-1 rounded-full hover:bg-gray-100 transition"
//               title="Start new conversation"
//             >
//               <MessageSquarePlus size={20} />
//             </button>
//           </div>
//           {/* New Chat Input */}
//           {showNewChatInput && (
//             <div className="p-3 border-b border-gray-100">
//               <input
//                 type="text"
//                 placeholder="Enter participant IDs (comma-separated GUIDs)"
//                 value={newChatParticipantIds}
//                 onChange={(e) => setNewChatParticipantIds(e.target.value)}
//                 className="w-full px-3 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm"
//                 disabled={isCreatingConversation}
//               />
//               {newChatError && <p className="text-red-500 text-xs mt-1">{newChatError}</p>}
//               <button
//                 onClick={handleCreateNewConversation}
//                 className="mt-2 w-full bg-[#0096c7] hover:bg-cyan-700 text-white py-1.5 rounded-lg text-sm font-medium transition"
//                 disabled={isCreatingConversation || !newChatParticipantIds.trim()}
//               >
//                 {isCreatingConversation ? 'Creating...' : 'Create Chat'}
//               </button>
//             </div>
//           )}
//           <div className="p-3">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search chats"
//                 className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
//               />
//               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//             </div>
//           </div>
//           <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//             {conversations.length === 0 ? (
//               <div className="p-4 text-gray-500 text-center">No conversations yet. Start a new one!</div>
//             ) : (
//               conversations.map((chat) => {
//                 const otherParticipant = getOtherParticipant(chat);
//                 return (
//                   <div
//                     key={chat.id}
//                     className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-cyan-50 transition ${selectedConversation?.id === chat.id ? 'bg-cyan-50' : ''}`}
//                     onClick={() => selectConversation(chat.id)}
//                   >
//                     <img
//                       src={otherParticipant?.avatar || "https://placehold.co/48x48/CCCCCC/FFFFFF?text=U"}
//                       alt={otherParticipant?.username || 'Unknown User'}
//                       className="w-12 h-12 rounded-full object-cover"
//                     />
//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-center">
//                         {/* Display other participant's username for 1:1 chat */}
//                         <span className="font-medium truncate">{otherParticipant?.username || 'Unknown Chat'}</span>
//                         <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
//                           {chat.lastMessage ? formatDistanceToNow(new Date(chat.lastMessage.sentAt), { addSuffix: true }) : ''}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center mt-1">
//                         <span className="text-sm text-gray-500 truncate">{chat.lastMessage?.content || 'No messages yet.'}</span>
//                         {chat.unreadCount && chat.unreadCount > 0 && (
//                           <span className="ml-2 bg-[#0096c7] text-white text-xs rounded-full px-2 py-0.5 font-semibold">
//                             {chat.unreadCount}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//         {/* Chatbox */}
//         <div className="flex-1 flex flex-col h-full">
//           {/* FIX: Only render chatbox content if a conversation is selected */}
//           {selectedConversation ? (
//             <>
//               {/* Chat Header */}
//               <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
//                 <img
//                   src={getOtherParticipant(selectedConversation)?.avatar || "https://placehold.co/40x40/CCCCCC/FFFFFF?text=U"}
//                   alt={getOtherParticipant(selectedConversation)?.username || 'Unknown User'}
//                   className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div>
//                   <div className="font-semibold">
//                     {getOtherParticipant(selectedConversation)?.username || 'Unknown Chat'}
//                   </div>
//                   <div className="text-xs text-gray-400">Online</div> {/* Placeholder for online status */}
//                 </div>
//               </div>
//               {/* Messages */}
//               <div className="flex-1 px-6 py-4 overflow-y-auto bg-[#F7F9FB] scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                 <div className="flex flex-col gap-4">
//                   {isLoadingMessages ? (
//                     <div className="flex justify-center items-center h-full">
//                       <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading messages...</span>
//                     </div>
//                   ) : messages.length === 0 ? (
//                     <div className="text-gray-500 text-center">No messages in this conversation. Say hello!</div>
//                   ) : (
//                     messages.map((msg) => (
//                       <div
//                         key={msg.id}
//                         className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
//                       >
//                         <div
//                           className={`rounded-2xl px-4 py-2 max-w-xs break-words text-sm shadow-sm ${
//                             msg.senderId === currentUser?.id
//                               ? 'bg-[#0096c7] text-white rounded-br-md'
//                               : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
//                           }`}
//                         >
//                           {msg.content}
//                           <span className="block text-[10px] text-right mt-1 opacity-60">
//                             {formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true })}
//                             {msg.senderId === currentUser?.id && <CheckCircle size={12} className="inline ml-1 text-white" />}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                   <div ref={messagesEndRef} />
//                 </div>
//               </div>
//               {/* Message Input */}
//               <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-6 py-4 border-t border-gray-100">
//                 <button type="button" className="p-2 text-gray-400 hover:text-[#0096c7] rounded-full hover:bg-gray-100">
//                   <Paperclip size={20} />
//                 </button>
//                 <input
//                   type="text"
//                   placeholder="Type a message"
//                   className="flex-1 rounded-full bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-200"
//                   value={messageInput}
//                   onChange={(e) => setMessageInput(e.target.value)}
//                   disabled={isSendingMessage}
//                 />
//                 <button
//                   type="submit"
//                   className="p-2 text-white bg-[#0096c7] hover:bg-cyan-700 rounded-full transition"
//                   disabled={isSendingMessage || !messageInput.trim()}
//                 >
//                   <Send size={20} />
//                 </button>
//               </form>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-gray-500">
//               Select a chat to start messaging, or click the '+' to create a new one.
//             </div>
//           )}
//         </div>
//       </div>
//     </AppLayout>
//   );
// };

// export default withAuthRequired(MessagingPage);
