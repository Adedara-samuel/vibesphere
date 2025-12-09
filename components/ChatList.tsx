'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Conversation } from '@/types';
import { MessageCircle, Search } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { config } = useTheme();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Conversation[];

      // Sort client-side
      conversationsData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      setConversations(conversationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredConversations = conversations.filter(conv =>
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedChat) {
    return <ChatWindow conversationId={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h2 className="text-2xl font-bold mb-4">Tribe Chat</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${config.ring} focus:border-transparent`}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-gray-200">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className={`w-24 h-24 bg-gradient-to-br ${config.lightGradient} rounded-full flex items-center justify-center mb-4`}>
              <MessageCircle className={`w-12 h-12 ${config.text}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Conversations Yet</h3>
            <p className="text-gray-600 text-center">Start chatting with your tribe!</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(p => p !== user?.uid);
            const unread = conversation.unreadCount > 0;

            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">
                        {otherParticipant?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    {unread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{conversation.unreadCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold truncate ${unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        @{otherParticipant || 'Unknown'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.updatedAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}