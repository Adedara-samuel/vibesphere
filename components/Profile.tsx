'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Pulse, User } from '@/types';
import { Settings, LogOut, Users, Heart, Video, Edit, Palette, Bookmark, X, Eye, MessageCircle } from 'lucide-react';

export default function Profile({ userId }: { userId?: string }) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pulses' | 'saved' | 'resonated' | 'friends'>('pulses');
  const [savedPulses, setSavedPulses] = useState<Pulse[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    privateAccount: false,
    showOnlineStatus: true,
  });
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const { user, signOut, unfollowUser, followUser } = useAuth();
  const { theme, setTheme, font, setFont } = useTheme();

  useEffect(() => {
    if (userId) {
      // Viewing another user's profile
      setIsOwnProfile(false);
      const fetchViewedUser = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setViewedUser({ uid: userDoc.id, ...userDoc.data() } as User);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchViewedUser();
    } else {
      // Viewing own profile
      setIsOwnProfile(true);
      setViewedUser(null);
    }
  }, [userId]);

  useEffect(() => {
    const targetUserId = userId || user?.uid;
    if (!targetUserId) return;

    const q = query(
      collection(db, 'pulses'),
      where('userId', '==', targetUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pulsesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Pulse[];

      // Sort client-side
      pulsesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setPulses(pulsesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, user?.uid]);

  useEffect(() => {
    if (!user?.favorites?.length) {
      setSavedPulses([]);
      return;
    }

    const fetchSavedPulses = async () => {
      const savedIds = user.favorites;
      const savedPulsesData: Pulse[] = [];

      for (const pulseId of savedIds) {
        try {
          const pulseDoc = await getDoc(doc(db, 'pulses', pulseId));
          if (pulseDoc.exists()) {
            savedPulsesData.push({
              id: pulseDoc.id,
              ...pulseDoc.data(),
              createdAt: pulseDoc.data().createdAt?.toDate() || new Date(),
            } as Pulse);
          }
        } catch (error) {
          console.error('Error fetching saved pulse:', error);
        }
      }

      setSavedPulses(savedPulsesData);
    };

    fetchSavedPulses();
  }, [user?.favorites]);

  useEffect(() => {
    const targetUser = viewedUser || user;
    if (!targetUser?.vibingWith?.length) {
      setFriends([]);
      return;
    }

    const fetchFriends = async () => {
      const friendsData: User[] = [];
      for (const friendId of targetUser.vibingWith) {
        try {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            friendsData.push({ uid: friendDoc.id, ...friendDoc.data() } as User);
          }
        } catch (error) {
          console.error('Error fetching friend:', error);
        }
      }
      setFriends(friendsData);
    };

    fetchFriends();
  }, [viewedUser, user]);

  useEffect(() => {
    // Calculate total views and comments
    const views = pulses.reduce((sum, pulse) => sum + (pulse.views || 0), 0);
    const comments = pulses.reduce((sum, pulse) => sum + (pulse.echoes?.length || 0), 0);
    setTotalViews(views);
    setTotalComments(comments);
  }, [pulses]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayUser = viewedUser || user;

  if (!displayUser) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500"></div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {displayUser.photoURL ? (
                <img
                  src={displayUser.photoURL}
                  alt={displayUser.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {displayUser.displayName[0].toUpperCase()}
                </span>
              )}
            </div>
            {isOwnProfile ? (
              <button className="mb-2 px-4 py-2 border-2 border-gray-400 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  if (user?.vibingWith?.includes(displayUser.uid)) {
                    unfollowUser(displayUser.uid);
                  } else {
                    followUser(displayUser.uid);
                  }
                }}
                className={`mb-2 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  user?.vibingWith?.includes(displayUser.uid)
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {user?.vibingWith?.includes(displayUser.uid) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{displayUser.displayName}</h1>
            <p className="text-gray-600">@{displayUser.username}</p>
            {displayUser.bio && <p className="text-gray-700 mt-2">{displayUser.bio}</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pulses.length}</p>
                  <p className="text-sm text-gray-600">Pulses</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{displayUser.tribe?.length || 0}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{displayUser.vibingWith?.length || 0}</p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{displayUser.resonanceCount || 0}</p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
                  <p className="text-sm text-gray-600">Comments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pulses')}
              className={`flex-1 py-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'pulses'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              <Video className="w-4 h-4 inline-block mr-1" />
              Pulses
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'friends'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-1" />
              Friends
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              <Bookmark className="w-4 h-4 inline-block mr-1" />
              Saved
            </button>
            <button
              onClick={() => setActiveTab('resonated')}
              className={`flex-1 py-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'resonated'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              <Heart className="w-4 h-4 inline-block mr-1" />
              Liked
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pulses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Video className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No pulses yet</h3>
            <p className="text-gray-600 text-center">Start creating and sharing your pulses!</p>
          </div>
        ) : activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No friends yet</h3>
              <p className="text-gray-600 text-center">Start following people to build your network!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friends.map((friend) => (
                <div key={friend.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      {friend.photoURL ? (
                        <img src={friend.photoURL} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {friend.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">@{friend.username}</p>
                      <p className="text-sm text-gray-600">{friend.displayName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => unfollowUser(friend.uid)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'saved' ? (
          savedPulses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Saved Videos</h3>
              <p className="text-gray-600 text-center">Save videos you love to watch them later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {savedPulses.map((pulse) => (
                <div
                  key={pulse.id}
                  className="aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <video
                    src={pulse.videoUrl}
                    className="w-full h-full object-cover"
                    poster={pulse.thumbnailUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <Heart className="w-4 h-4" />
                      <span>{pulse.resonance || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {pulses.map((pulse) => (
              <div
                key={pulse.id}
                className="aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                <video
                  src={pulse.videoUrl}
                  className="w-full h-full object-cover"
                  poster={pulse.thumbnailUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <div className="flex items-center gap-2 text-white text-xs">
                    <Heart className="w-4 h-4" />
                    <span>{pulse.resonance || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Settings Button - Only show for own profile */}
      {isOwnProfile && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-30">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <Settings className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Settings Drawer */}
      {showSettingsModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setShowSettingsModal(false)}
          />
          <div
            className="hidden lg:block fixed inset-0 bg-black/40 backdrop-blur-lg z-40"
            onClick={() => setShowSettingsModal(false)}
          />

          {/* Mobile Bottom Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
            <div className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden transform transition-transform duration-300 ease-out">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Theme Section */}
                <div>
                  <h4 className="font-semibold text-base text-gray-900 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    Theme
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['light', 'dark'] as const).map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => setTheme(themeOption)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          theme === themeOption
                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-full h-2 rounded-full mb-1 ${
                          themeOption === 'light' ? 'bg-gradient-to-r from-yellow-300 to-orange-400' :
                          'bg-gradient-to-r from-gray-800 to-gray-900'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-900 capitalize">{themeOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Section */}
                <div>
                  <h4 className="font-semibold text-base text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-purple-600 text-sm">Aa</span>
                    Font Style
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sans', 'serif', 'mono'] as const).map((fontOption) => (
                      <button
                        key={fontOption}
                        onClick={() => setFont(fontOption)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 font-${fontOption} ${
                          font === fontOption
                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-900 capitalize">{fontOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Settings */}
                <div>
                  <h4 className="font-semibold text-base text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-600" />
                    Account
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Notifications</p>
                        <p className="text-xs text-gray-600">Receive notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-3">
                        <input
                          type="checkbox"
                          checked={userSettings.notifications}
                          onChange={(e) => setUserSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Private Account</p>
                        <p className="text-xs text-gray-600">Only approved followers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-3">
                        <input
                          type="checkbox"
                          checked={userSettings.privateAccount}
                          onChange={(e) => setUserSettings(prev => ({ ...prev, privateAccount: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Online Status</p>
                        <p className="text-xs text-gray-600">Show when you're online</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-3">
                        <input
                          type="checkbox"
                          checked={userSettings.showOnlineStatus}
                          onChange={(e) => setUserSettings(prev => ({ ...prev, showOnlineStatus: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Side Drawer */}
          <div className="hidden lg:block fixed inset-y-0 right-6 top-6 bottom-6 z-50">
            <div className={`bg-white h-full shadow-2xl overflow-hidden rounded-2xl transform transition-all duration-300 ease-out ${
              settingsCollapsed ? 'w-16' : 'w-96'
            }`}>
              <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${settingsCollapsed ? 'justify-center' : ''}`}>
                {!settingsCollapsed && <h3 className="font-bold text-lg text-gray-900">Settings</h3>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSettingsCollapsed(!settingsCollapsed)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    {settingsCollapsed ? (
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    )}
                  </button>
                  {!settingsCollapsed && (
                    <button
                      onClick={() => setShowSettingsModal(false)}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {!settingsCollapsed && (
                <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {/* Theme Section */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-600" />
                      Theme
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(['light', 'dark'] as const).map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            theme === themeOption
                              ? 'border-purple-500 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-full h-3 rounded-full mb-2 ${
                            themeOption === 'light' ? 'bg-gradient-to-r from-yellow-300 to-orange-400' :
                            'bg-gradient-to-r from-gray-800 to-gray-900'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{themeOption}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Section */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-purple-600">Aa</span>
                      Font Style
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {(['sans', 'serif', 'mono'] as const).map((fontOption) => (
                        <button
                          key={fontOption}
                          onClick={() => setFont(fontOption)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 font-${fontOption} ${
                            font === fontOption
                              ? 'border-purple-500 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-900 capitalize">{fontOption}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account Settings */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      Account
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Notifications</p>
                          <p className="text-sm text-gray-600">Receive notifications for interactions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userSettings.notifications}
                            onChange={(e) => setUserSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Private Account</p>
                          <p className="text-sm text-gray-600">Only approved followers can see your content</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userSettings.privateAccount}
                            onChange={(e) => setUserSettings(prev => ({ ...prev, privateAccount: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Show Online Status</p>
                          <p className="text-sm text-gray-600">Let others see when you're online</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userSettings.showOnlineStatus}
                            onChange={(e) => setUserSettings(prev => ({ ...prev, showOnlineStatus: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsCollapsed && (
                <div className="p-4 space-y-4">
                  <button
                    onClick={() => setTheme(theme === 'blue' ? 'purple' : 'blue')}
                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-md transition-shadow"
                    title="Toggle theme"
                  >
                    <Palette className="w-4 h-4 text-white" />
                  </button>

                  <button
                    onClick={() => setFont(font === 'sans' ? 'serif' : 'sans')}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    title="Toggle font"
                  >
                    <span className="text-xs font-bold text-gray-700">Aa</span>
                  </button>

                  <button
                    onClick={() => setUserSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      userSettings.notifications ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                    title="Toggle notifications"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}