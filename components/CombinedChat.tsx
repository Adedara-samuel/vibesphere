'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Conversation, User } from '@/types';
import { MessageCircle, Search, Bot, Users, Compass } from 'lucide-react';
import ChatWindow from './ChatWindow';
import ChatBot from './ChatBot';

type Tab = 'ai' | 'chats' | 'friends' | 'discover';

const defaultTab: Tab = 'ai';

export default function CombinedChat() {
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<User[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<User[]>([]);
  const { user, followUser } = useAuth();
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

      conversationsData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setConversations(conversationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadFriends = async () => {
      const friendsData: User[] = [];
      for (const friendId of user.vibingWith || []) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          friendsData.push({ uid: friendDoc.id, ...friendDoc.data() } as User);
        }
      }
      setFriends(friendsData);
    };

    loadFriends();
  }, [user]);

  useEffect(() => {
    const loadDiscoverUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const allUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];

      // Filter out current user and already following
      const discover = allUsers.filter(u =>
        u.uid !== user?.uid && !user?.vibingWith?.includes(u.uid)
      ).slice(0, 20); // Limit to 20

      setDiscoverUsers(discover);
    };

    if (user) loadDiscoverUsers();
  }, [user]);

  const filteredConversations = conversations.filter(conv =>
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedChat) {
    return <ChatWindow conversationId={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
              activeTab === 'ai' ? `${config.text} border-b-2 border-purple-500` : 'text-gray-600'
            }`}
          >
            <Bot className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">AI Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
              activeTab === 'chats' ? `${config.text} border-b-2 border-purple-500` : 'text-gray-600'
            }`}
          >
            <MessageCircle className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Chats</span>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
              activeTab === 'friends' ? `${config.text} border-b-2 border-purple-500` : 'text-gray-600'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Friends</span>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
              activeTab === 'discover' ? `${config.text} border-b-2 border-purple-500` : 'text-gray-600'
            }`}
          >
            <Compass className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Discover</span>
          </button>
        </div>

        {/* Search - Only show for non-AI tabs */}
        {activeTab !== 'ai' && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${config.ring} focus:border-transparent`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'ai' && <ChatBot />}

      {activeTab === 'chats' && loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {activeTab === 'chats' && !loading && (
        <div className="divide-y divide-gray-200">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className={`w-24 h-24 bg-gradient-to-br ${config.lightGradient} rounded-full flex items-center justify-center mb-4`}>
                <MessageCircle className={`w-12 h-12 ${config.text}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Conversations Yet</h3>
              <p className="text-gray-600 text-center">Start chatting with your friends!</p>
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
      )}

      {activeTab === 'friends' && (
        <div className="divide-y divide-gray-200">
          {filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className={`w-24 h-24 bg-gradient-to-br ${config.lightGradient} rounded-full flex items-center justify-center mb-4`}>
                <Users className={`w-12 h-12 ${config.text}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Friends Yet</h3>
              <p className="text-gray-600 text-center">Start following people to build your tribe!</p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div key={friend.uid} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    {friend.photoURL ? (
                      <img src={friend.photoURL} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {friend.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">@{friend.username}</p>
                    <p className="text-sm text-gray-500 truncate">{friend.displayName}</p>
                  </div>

                  <button
                    onClick={() => setSelectedChat(friend.uid)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${config.bg} ${config.text}`}
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="divide-y divide-gray-200">
          {discoverUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className={`w-24 h-24 bg-gradient-to-br ${config.lightGradient} rounded-full flex items-center justify-center mb-4`}>
                <Compass className={`w-12 h-12 ${config.text}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Discover People</h3>
              <p className="text-gray-600 text-center">Find new friends to follow!</p>
            </div>
          ) : (
            discoverUsers.map((discoverUser) => (
              <div key={discoverUser.uid} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    {discoverUser.photoURL ? (
                      <img src={discoverUser.photoURL} alt={discoverUser.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {discoverUser.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">@{discoverUser.username}</p>
                    <p className="text-sm text-gray-500 truncate">{discoverUser.displayName}</p>
                    <p className="text-xs text-gray-400">{discoverUser.tribe?.length || 0} followers</p>
                  </div>

                  <button
                    onClick={() => followUser(discoverUser.uid)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${config.bg} ${config.text}`}
                  >
                    Follow
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}