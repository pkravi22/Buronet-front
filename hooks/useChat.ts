// hooks/useChat.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr'; // npm install @microsoft/signalr
import { get, postApi } from '@/lib/messageApi'; // Your API utility (using postApi)
import { useAuth } from '../context/AuthContext'; // To get current user and token
import { ConversationDto, MessageDto, CreateMessageDto, CreateConversationDto } from '@/lib/types/message'; // New DTOs
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

interface UseChatResult {
  conversations: ConversationDto[];
  selectedConversation: ConversationDto | null;
  messages: MessageDto[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
  selectConversation: (conversationId: number) => void;
  sendMessage: (content: string) => Promise<void>;
  createConversation: (participantUserIds: string[], title?: string) => Promise<ConversationDto | null>;
  refetchConversations: () => void;
}

const MESSAGE_SERVICE_BASE_URL = 'https://localhost:44345';

export const useChat = (): UseChatResult => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  
  // 💡 NEW: Ref to hold the current selected conversation ID for the SignalR listener
  const selectedConversationIdRef = useRef<number | null>(null);

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchConversationsTrigger, setRefetchConversationsTrigger] = useState(0);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // 💡 NEW EFFECT: Keeps the ref value updated with the latest selectedConversation ID
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversation?.id || null;
    console.log('useChat: selectedConversationIdRef updated to:', selectedConversationIdRef.current);
  }, [selectedConversation]);
  
// --- Fetch Conversations (No Change) ---
  const fetchConversations = useCallback(async () => {
    console.log('useChat: fetchConversations triggered. User:', user?.id, 'AuthLoading:', isAuthLoading);
    if (isAuthLoading || !user) {
      if (!isAuthLoading && !user) {
          setIsLoadingConversations(false);
      }
      return;
    }

    setIsLoadingConversations(true);
    setError(null);
    try {
      const fetchedConversations = await get<ConversationDto[]>('/conversations');
      console.log('useChat: Fetched conversations via API:', fetchedConversations);
      setConversations(fetchedConversations);
         if (selectedConversation) {
        const currentConvExists = fetchedConversations.some(conv => conv.id === selectedConversation.id);
        if (!currentConvExists) {
            setSelectedConversation(fetchedConversations.length > 0 ? fetchedConversations[0] : null);
        }
      }
    } catch (err: any) {
      console.error('useChat: Error fetching conversations via API:', err);
      setError(err.message || 'Failed to load conversations.');
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
      console.log('useChat: Conversation fetching complete.');
    }
  }, [user, isAuthLoading, selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refetchConversationsTrigger]);

  const refetchConversations = () => {
    setRefetchConversationsTrigger(prev => prev + 1);
  };

  // --- Fetch Messages for Selected Conversation (No Change) ---
  const fetchMessages = useCallback(async (conversationId: number) => {
    console.log('useChat: fetchMessages triggered for conversation:', conversationId);
    setIsLoadingMessages(true);
    setError(null);
    try {
      const fetchedMessages = await get<MessageDto[]>(`/conversations/${conversationId}/messages`);
      console.log('useChat: Fetched messages via API:', fetchedMessages);
      setMessages(fetchedMessages);
    } catch (err: any) {
      console.error('useChat: Error fetching messages via API:', err);
      setError(err.message || 'Failed to load messages.');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
      console.log('useChat: Message fetching complete.');
    }
  }, []);

  // --- SignalR Connection Management (FIXED) ---
  useEffect(() => {
    if (isAuthLoading || !user) {
      if (!isAuthLoading && !user && connectionRef.current) {
        console.log('SignalR: User logged out, stopping connection.');
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      return;
    }

    const connect = async () => {
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
        console.log('SignalR: Already connected. State:', connectionRef.current.state);
        return;
      }
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connecting) {
        console.log('SignalR: Already connecting...');
        return;
      }

      console.log('SignalR: Attempting to connect to chat hub at', `${MESSAGE_SERVICE_BASE_URL}/chatHub`);
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${MESSAGE_SERVICE_BASE_URL}/chatHub`, {
          accessTokenFactory: getAuthToken,
        })
        .withAutomaticReconnect()
        .build();

      // 🚨 FIX APPLIED HERE: Use selectedConversationIdRef.current
      connection.on("ReceiveMessage", (message: MessageDto & { clientId?: string }) => {
        console.log("SignalR: >>> Received Message Event <<<", message);
        
        // Use the current value from the ref, which is always up-to-date
        const currentSelectedId = selectedConversationIdRef.current; 

        if (currentSelectedId && message.conversationId === currentSelectedId) {
          setMessages(prevMessages => {
            // FIX: Prioritize replacement using clientId if available
            if (message.clientId) {
                const optimisticMessageIndex = prevMessages.findIndex(
                    msg => (msg as MessageDto & { clientId?: string }).clientId === message.clientId
                );
                if (optimisticMessageIndex > -1) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[optimisticMessageIndex] = message; // Replace with server's message
                    console.log("SignalR: Replaced optimistic message with server message (via clientId):", message);
                    return updatedMessages;
                }
            }

            // Fallback: If no clientId or no match, check for duplicate by server ID or add as new
            if (!prevMessages.some(msg => msg.id === message.id)) {
              const updatedMessages = [...prevMessages, message];
              console.log("SignalR: Added new server message (not a replacement):", message);
              return updatedMessages;
            }
            console.log("SignalR: Message already in state. No update needed.");
            return prevMessages;
          });
        } else {
            // Log using the ref's value for clarity
            console.log(`SignalR: Message received for non-selected conversation (Current Ref ID: ${currentSelectedId}). Not updating current view.`);
        }
        // Update last message/unread count in conversations list for all relevant conversations
        setConversations(prevConversations => prevConversations.map(conv =>
          conv.id === message.conversationId
            ? { 
                ...conv, 
                lastMessage: message, 
                // Only increment unread count if it's NOT the currently selected chat
                unreadCount: conv.id !== currentSelectedId ? (conv.unreadCount || 0) + 1 : conv.unreadCount 
            } 
            : conv
        ));
      });

      connection.on("ConversationCreated", (conversation: ConversationDto) => {
        console.log("SignalR: >>> Conversation Created Event <<<", conversation);
        setConversations(prevConversations => {
            if (!prevConversations.some(conv => conv.id === conversation.id)) {
                return [conversation, ...prevConversations];
            }
            return prevConversations;
        });
      });

      connection.onreconnecting(error => {
          console.warn('SignalR: Reconnecting...', error);
          setError('Lost connection. Reconnecting...');
      });
      connection.onreconnected(() => {
        console.log('SignalR: Reconnected to hub.');
        setError(null);
        fetchConversations();
        if (selectedConversationIdRef.current) { // Use ref here too for safety
          fetchMessages(selectedConversationIdRef.current);
        }
      });
      connection.onclose(error => {
          console.error('SignalR: Connection closed.', error);
          setError('Connection to chat service lost.');
          connectionRef.current = null;
      });

      try {
        await connection.start();
        console.log('SignalR: Connection established. State:', connection.state);
        connectionRef.current = connection;
      } catch (err: any) {
        console.error('SignalR: Connection failed at start:', err);
        setError('Failed to connect to chat service.');
        connectionRef.current = null;
      }
    };

    connect();

    return () => {
      if (connectionRef.current) { 
        console.log('SignalR: Disconnecting from hub on unmount.');
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
    // 🚨 FIX APPLIED HERE: selectedConversation REMOVED from dependency array.
  }, [user, isAuthLoading, getAuthToken]); 

  

  // --- Select Conversation Handler (No Change) ---
  const selectConversation = useCallback((conversationId: number) => {
    console.log('useChat: selectConversation called for ID:', conversationId);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
      fetchMessages(conversationId);
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
    }
  }, [conversations, fetchMessages]);

  // --- Send Message (No Change) ---
  const sendMessage = useCallback(async (content: string) => {
    console.log('useChat: sendMessage called. Content:', content);
    if (!selectedConversation || isSendingMessage || !content.trim()) return;

    setIsSendingMessage(true);
    setError(null);
    try {
      const messageData: CreateMessageDto = { content };
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
          console.log('useChat: Sending message via SignalR hub.');
          // FIX: Generate a unique client-side ID for optimistic message
          const tempClientId = uuidv4();
          const tempMessage: MessageDto & { clientId?: string } = {
              id: 0, // Temporary ID, will be replaced by server's real ID
              clientId: tempClientId, // Unique client-side ID for replacement
              conversationId: selectedConversation.id,
              senderId: user?.id || 'unknown',
              content: content.trim(),
              sentAt: new Date().toISOString(),
              sender: {
                id: user?.id || 'unknown',
                username: user?.username || 'You',
                avatar: user?.avatar || 'https://placehold.co/32x32/CCCCCC/FFFFFF?text=U',
              },
          };
          setMessages(prevMessages => [...prevMessages, tempMessage]);

          // Call the hub method (server-side method), passing the clientId
          await connectionRef.current.invoke("SendMessageToConversation", selectedConversation.id, content, tempClientId);
          console.log('useChat: Message sent via SignalR invoke with clientId:', tempClientId);

      } else {
          console.warn('useChat: SignalR not connected. Falling back to API POST for sending message.');
          const newMessage = await postApi<MessageDto>(`/conversations/${selectedConversation.id}/messages`, messageData);
          setMessages(prevMessages => [...prevMessages, newMessage]);
          setConversations(prevConversations => prevConversations.map(conv =>
            conv.id === selectedConversation.id
              ? { ...conv, lastMessage: newMessage }
              : conv
          ));
      }

    } catch (err: any) {
      console.error('useChat: Error sending message:', err);
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  }, [selectedConversation, isSendingMessage, user, connectionRef]);

  // --- Create Conversation (No Change) ---
  const createConversation = useCallback(async (participantUserIds: string[], title?: string) => {
    console.log('useChat: createConversation called. Participants:', participantUserIds);
    if (!user || participantUserIds.length === 0) {
      setError("Cannot create conversation without participants.");
      return null;
    }
    setIsLoadingConversations(true);
    setError(null);
    try {
      const newConversationData: CreateConversationDto = {
        participantUserIds: [...participantUserIds, user.id], // Ensure current user is included
        title: title || 'New Chat',
      };

      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
          console.log('useChat: Creating conversation via SignalR hub.');
          await connectionRef.current.invoke("CreateNewConversation", newConversationData);
          console.log('useChat: Conversation creation request sent via hub.');
          return null;
      } else {
          console.warn('useChat: SignalR not connected. Falling back to API POST for creating conversation.');
          const newConv = await postApi<ConversationDto>('/conversations', newConversationData);
          setConversations(prev => [newConv, ...prev]);
          setSelectedConversation(newConv);
          fetchMessages(newConv.id);
          return newConv;
      }
    } catch (err: any) {
      console.error('useChat: Error creating conversation:', err);
      setError(err.message || 'Failed to create conversation.');
      return null;
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user, postApi, fetchMessages, connectionRef]);


  return {
    conversations,
    selectedConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    error,
    selectConversation,
    sendMessage,
    createConversation,
    refetchConversations,
  };
};