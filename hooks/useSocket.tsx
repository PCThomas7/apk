import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const SOCKET_SERVER_URL = 'https://backend.professorpcthomas.com';

const socketOptions = {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  secure: true,
};

interface UserDetails {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface ChatUser {
  userId: string;
  username: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  isAdmin: boolean;
  message: string;
  timestamp: Date;
}

interface Handout {
  id: string;
  title: string;
  link: string;
  sharedBy: {
    id: string;
    name: string;
  };
  sharedAt: string | Date;
}


export const useSocket = (lessonId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ChatUser[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [handouts, setHandouts] = useState<Handout[]>([]);

  const isMounted = useRef(true);

  // Load user details from SecureStore
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const userDetails = await SecureStore.getItemAsync('userDetails');
        if (userDetails && isMounted.current) {
          setUser(JSON.parse(userDetails));
        }
      } catch (error) {
        console.error('Failed to load user details:', error);
        if (isMounted.current) setError('Failed to load user information');
      }
    };

    loadUserDetails();
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isMounted.current) return;

    console.log(`Connecting to socket server at: ${SOCKET_SERVER_URL}`);
    const socketInstance = io(SOCKET_SERVER_URL, socketOptions);
    setSocket(socketInstance);

    const handleConnect = () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setError(null);
    };

    const handleConnectError = (err: Error) => {
      console.error('Socket connection error:', err);
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const handleUserJoined = (data: { userId: string; username: string; timestamp: Date }) => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'System',
        isAdmin: false,
        message: `${data.username} has joined the chat`,
        timestamp: data.timestamp,
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    };

    const handleUserLeft = (data: { userId: string; username: string; timestamp: Date }) => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'System',
        isAdmin: false,
        message: `${data.username} has left the chat`,
        timestamp: data.timestamp,
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    };

    const handleChatStarted = () => {
      console.log('Real-time update: chat started');
      setIsChatActive(true);
    };

    const handleChatEnded = () => {
      console.log('Real-time update: chat ended');
      setIsChatActive(false);
    };

    const handleMessages = (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleChatHistory = (data: { messages: ChatMessage[] }) => {
      console.log('Received chat history:', data.messages.length, 'messages');
      if (data.messages.length > 0) {
        const systemMessage: ChatMessage = {
          id: `system-history-${Date.now()}`,
          userId: 'system',
          username: 'System',
          isAdmin: false,
          message: `Showing ${data.messages.length} previous message${data.messages.length === 1 ? '' : 's'}`,
          timestamp: new Date(),
        };
        setMessages([...data.messages, systemMessage]);
      } else {
        setMessages(data.messages);
      }
    };

    socketInstance.on('chat-history', handleChatHistory);
    socketInstance.on('new-message', handleMessages);
    socketInstance.on('connect', handleConnect);
    socketInstance.on('connect_error', handleConnectError);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('user-joined', handleUserJoined);
    socketInstance.on('user-left', handleUserLeft);
    socketInstance.on('lesson-chat-started', handleChatStarted);
    socketInstance.on('lesson-chat-ended', handleChatEnded);
    socketInstance.on('handout-shared', (handout: Handout) => {
      setHandouts((prev) => [handout, ...prev]);
    });

    socketInstance.on('handout-deleted', (data: { handoutId: string, deletedBy: { id: string, name: string } }) => {
      setHandouts(prev => prev.filter(h => h.id !== data.handoutId));
    });


    return () => {
      socketInstance.off('chat-history', handleChatHistory);
      socketInstance.off('new-message', handleMessages);
      socketInstance.off('connect', handleConnect);
      socketInstance.off('connect_error', handleConnectError);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('user-joined', handleUserJoined);
      socketInstance.off('user-left', handleUserLeft);
      socketInstance.off('lesson-chat-started', handleChatStarted);
      socketInstance.off('lesson-chat-ended', handleChatEnded);
      socketInstance.disconnect();
    };
  }, []);

  // Join lesson chat room and check chat status initially
  useEffect(() => {
    if (!socket || !isConnected || !lessonId || !user?.id) return;

    const joinData = {
      lessonId,
      userId: user.id,
      username: user.name || user.email || 'Anonymous',
    };

    const handleChatStatusUpdate = (response: { isActive: boolean }) => {
      if (response?.isActive) {
        console.log('Chat is already active for this lesson');
        setIsChatActive(true);
      } else {
        setIsChatActive(false);
      }
    };

    socket.emit('join-lesson-chat', joinData);
    socket.emit('check-chat-status', { lessonId }, handleChatStatusUpdate);
  }, [socket, isConnected, lessonId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const sendMessage = useCallback((message: string) => {
    if (socket && lessonId && message.trim()) {
      socket.emit('send-message', {
        lessonId,
        message: message.trim()
      });
      return true;
    }
    return false;
  }, [socket, lessonId]);

  return {
    isConnected,
    isChatActive,
    activeUsers,
    error,
    messages,
    sendMessage,
    socket,
    handouts,
  };
};
