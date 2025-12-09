'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, increment, arrayUnion, arrayRemove, getDocs, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Pulse, User } from '@/types';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Search, Bookmark } from 'lucide-react';
import Loading from './Loading';
import Toast from './Toast';

export default function PulseFeed({ showSearch, setShowSearch }: { showSearch: boolean; setShowSearch: (value: boolean) => void }) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [animatingLike, setAnimatingLike] = useState<Record<string, boolean>>({});
  const [animatingComment, setAnimatingComment] = useState<Record<string, boolean>>({});
  const [animatingShare, setAnimatingShare] = useState<Record<string, boolean>>({});
  const [animatingFavorite, setAnimatingFavorite] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning'} | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const router = useRouter();
  const { user, followUser, unfollowUser } = useAuth();

  const playSound = (frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Ignore if audio not supported
    }
  };

  const fetchTrendingContent = async (): Promise<Pulse[]> => {
    // For demo, return sample videos. In production, integrate with APIs like YouTube, TikTok, etc.
    return [
      {
        id: 'trending1',
        userId: 'trending',
        username: 'TrendingNow',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: '',
        caption: 'Amazing viral content! 🔥 #trending #viral',
        tags: ['trending', 'viral', 'amazing'],
        resonance: 1250,
        resonatedBy: [],
        echoes: [],
        ripples: 89,
        views: 15420,
        duration: 60,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        userPhoto: '',
      },
      {
        id: 'trending2',
        userId: 'trending',
        username: 'ViralHits',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: '',
        caption: 'This will blow your mind! 🤯 #mindblown #wow',
        tags: ['mindblown', 'wow', 'viral'],
        resonance: 890,
        resonatedBy: [],
        echoes: [],
        ripples: 67,
        views: 12300,
        duration: 45,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        userPhoto: '',
      },
      {
        id: 'trending3',
        userId: 'trending',
        username: 'HotTrends',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: '',
        caption: 'Everyone is talking about this! 💬 #hot #trending',
        tags: ['hot', 'trending', 'talking'],
        resonance: 2100,
        resonatedBy: [],
        echoes: [],
        ripples: 145,
        views: 25600,
        duration: 30,
        createdAt: new Date(Date.now() - 10800000), // 3 hours ago
        userPhoto: '',
      },
    ];
  };

  const searchForUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    const snapshot = await getDocs(collection(db, 'users'));
    const allUsers = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    })) as User[];

    const filteredUsers = allUsers.filter(u =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    ).filter(u => u.uid !== user?.uid); // Exclude self

    setSearchUsers(filteredUsers);
  };

  const loadPulses = async (loadMore = false) => {
    if (searchQuery.trim()) {
      // Search mode - get all and filter client-side
      const q = query(collection(db, 'pulses'));
      const snapshot = await getDocs(q);
      const allPulses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Pulse[];

      const filteredPulses = allPulses.filter(pulse =>
        pulse.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pulse.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pulse.username.toLowerCase().includes(searchQuery.toLowerCase())
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setPulses(filteredPulses);
      setHasMore(false);
      // Add to history
      setSearchHistory(prev => {
        const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
      return;
    }

    const q = query(
      collection(db, 'pulses'),
      orderBy('createdAt', 'desc'),
      ...(loadMore && lastDoc ? [startAfter(lastDoc)] : []),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const newPulses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Pulse[];

    if (newPulses.length < 20) {
      setHasMore(false);
    }

    if (loadMore) {
      setPulses(prev => [...prev, ...newPulses]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    } else {
      // If no user content, load trending
      if (newPulses.length === 0) {
        const trendingContent = await fetchTrendingContent();
        setPulses(trendingContent);
      } else {
        setPulses(newPulses);
      }
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    }
  };

  useEffect(() => {
    loadPulses();
    setLoading(false);
  }, []);

  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    if (showSearch) {
      searchForUsers(searchQuery);
    }
  }, [searchQuery, showSearch]);

  // Set up video event listeners
  useEffect(() => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      const handleCanPlay = () => {
        // Video is ready, can attempt to play if supposed to be playing
        if (isPlaying && !isPlayingRef.current) {
          isPlayingRef.current = true;
          currentVideo.play().catch(() => {
            isPlayingRef.current = false;
            setIsPlaying(false);
          });
        }
      };

      const handlePause = () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      };

      const handlePlay = () => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      };

      currentVideo.addEventListener('canplay', handleCanPlay);
      currentVideo.addEventListener('pause', handlePause);
      currentVideo.addEventListener('play', handlePlay);

      return () => {
        currentVideo.removeEventListener('canplay', handleCanPlay);
        currentVideo.removeEventListener('pause', handlePause);
        currentVideo.removeEventListener('play', handlePlay);
      };
    }
  }, [currentVideoIndex, isPlaying]);

  useEffect(() => {
    // Clear any existing timeout
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }

    // Debounce video changes to prevent rapid play/pause calls
    playTimeoutRef.current = setTimeout(() => {
      const currentVideo = videoRefs.current[currentVideoIndex];

      // Only play if video is ready and not already playing
      if (currentVideo && currentVideo.readyState >= 2 && !isPlayingRef.current) {
        isPlayingRef.current = true;
        currentVideo.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            // Only log if it's not the expected interruption error
            if (!error.message.includes('interrupted')) {
              console.warn('Video play failed:', error);
            }
            isPlayingRef.current = false;
            setIsPlaying(false);
          });
      }

      // Pause other videos
      videoRefs.current.forEach((video, index) => {
        if (video && index !== currentVideoIndex) {
          video.pause();
          video.currentTime = 0; // Reset to beginning
        }
      });
    }, 150); // 150ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, [currentVideoIndex]);

  const handleResonance = async (pulseId: string) => {
    if (!user) return;

    const pulseRef = doc(db, 'pulses', pulseId);
    const pulse = pulses.find(p => p.id === pulseId);
    if (!pulse) return;

    const isLiked = pulse.resonatedBy?.includes(user.uid);

    if (isLiked) {
      // Unlike
      await updateDoc(pulseRef, {
        resonance: increment(-1),
        resonatedBy: arrayRemove(user.uid)
      });
    } else {
      // Like
      await updateDoc(pulseRef, {
        resonance: increment(1),
        resonatedBy: arrayUnion(user.uid)
      });
      playSound(800, 0.2);
    }
  };


  const handleShare = async (pulseId: string) => {
    const pulse = pulses.find(p => p.id === pulseId);
    if (!pulse) return;

    const shareData = {
      title: `Check out this Pulse by @${pulse.username}`,
      text: pulse.caption,
      url: `${window.location.origin}/pulse/${pulseId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setToast({message: 'Shared successfully!', type: 'success'});
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url);
        setToast({message: 'Link copied to clipboard!', type: 'success'});
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      setToast({message: 'Link copied to clipboard!', type: 'success'});
    }
  };

  const handleComment = async (pulseId: string) => {
    if (!user || !commentText.trim()) return;

    const pulseRef = doc(db, 'pulses', pulseId);
    const newComment = {
      id: Date.now().toString(),
      userId: user.uid,
      username: user.username,
      content: commentText.trim(),
      createdAt: new Date(),
      resonance: 0,
    };

    await updateDoc(pulseRef, {
      echoes: arrayUnion(newComment)
    });

    setCommentText('');
  };

  const handleFavorite = async (pulseId: string) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const pulse = pulses.find(p => p.id === pulseId);
    if (!pulse) return;

    const isFavorited = user.favorites?.includes(pulseId);

    if (isFavorited) {
      await updateDoc(userRef, {
        favorites: arrayRemove(pulseId)
      });
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(pulseId)
      });
      playSound(600, 0.3);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / itemHeight);

    if (newIndex !== currentVideoIndex && newIndex < pulses.length) {
      setCurrentVideoIndex(newIndex);
    }

    // Infinite scroll: load more when near bottom
    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 1000 && hasMore && !loadingMore) {
      setLoadingMore(true);
      loadPulses(true).finally(() => setLoadingMore(false));
    }
  };

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
        isPlayingRef.current = false;
        setIsPlaying(false);
      } else {
        // Check if video is ready before playing
        if (currentVideo.readyState >= 2) {
          isPlayingRef.current = true;
          currentVideo.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.warn('Video play failed:', error);
              isPlayingRef.current = false;
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const toggleMute = () => {
    videoRefs.current.forEach(video => {
      if (video) {
        video.muted = !isMuted;
      }
    });
    setIsMuted(!isMuted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" text="Loading Pulses..." />
      </div>
    );
  }

  if (pulses.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Pulses Yet</h3>
          <p className="text-gray-600">Be the first to create a Pulse!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-20 animate-in fade-in duration-300">
          <div className="w-full max-w-md mx-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search pulses, tags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadPulses()}
                className="w-full px-4 py-3 pl-12 pr-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                  loadPulses();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="text-white text-sm font-semibold mb-2">Recent Searches</h4>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((query, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(query);
                        loadPulses();
                        setShowSearch(false);
                      }}
                      className="block w-full text-left text-white/80 hover:text-white text-sm p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {searchUsers.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="text-white text-sm font-semibold mb-2">Users</h4>
                <div className="space-y-2">
                  {searchUsers.slice(0, 5).map((u) => (
                    <div key={u.uid} className="flex items-center gap-3 p-2 rounded hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {u.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">@{u.username}</p>
                        <p className="text-white/70 text-sm truncate">{u.displayName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (user?.vibingWith?.includes(u.uid)) {
                              unfollowUser(u.uid);
                              setToast({message: `Unfollowed @${u.username}`, type: 'success'});
                            } else {
                              followUser(u.uid);
                              setToast({message: `Following @${u.username}`, type: 'success'});
                            }
                          }}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            user?.vibingWith?.includes(u.uid)
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {user?.vibingWith?.includes(u.uid) ? 'Following' : 'Follow'}
                        </button>
                        <button
                          onClick={() => {
                            // For now, just show toast, since chat is in different component
                            setToast({message: `Chat with @${u.username} coming soon!`, type: 'warning'});
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
      {pulses.map((pulse, index) => (
        <div
          key={pulse.id}
          className="h-screen snap-start relative bg-black flex items-center justify-center"
        >
          {/* Video */}
          <video
            ref={(el) => { videoRefs.current[index] = el; }}
            src={pulse.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            className="aspect-[3/4] w-full object-contain"
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlayPause}
          />

          {/* Overlay Controls */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
            
            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/70 to-transparent" />
          </div>

          {/* User Info & Caption */}
          <div className="absolute bottom-20 left-4 right-20 text-white pointer-events-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {pulse.userPhoto ? (
                  <img src={pulse.userPhoto} alt={pulse.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{pulse.username[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">@{pulse.username}</p>
              </div>
              {/* Profile Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/profile/${pulse.userId}`);
                }}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
            <p className="text-sm mb-2">{pulse.caption}</p>
            <div className="flex flex-wrap gap-2">
              {pulse.tags?.map((tag, i) => (
                <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons - TikTok Style */}
          <div className="absolute bottom-20 right-2 md:right-4 flex flex-col gap-4 md:gap-6 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResonance(pulse.id);
                setAnimatingLike(prev => ({ ...prev, [pulse.id]: true }));
                setTimeout(() => setAnimatingLike(prev => ({ ...prev, [pulse.id]: false })), 600);
              }}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${pulse.resonance > 0 ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'} ${animatingLike[pulse.id] ? 'animate-bounce scale-110' : ''}`}>
                <Heart className="w-4 h-4 md:w-6 md:h-6" fill={pulse.resonance > 0 ? 'white' : 'none'} />
              </div>
              <span className="text-xs font-semibold">{pulse.resonance || 0}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(pulse.id);
                setAnimatingComment(prev => ({ ...prev, [pulse.id]: true }));
                setTimeout(() => setAnimatingComment(prev => ({ ...prev, [pulse.id]: false })), 600);
              }}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors ${animatingComment[pulse.id] ? 'animate-pulse' : ''}`}>
                <MessageCircle className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <span className="text-xs font-semibold">{pulse.echoes?.length || 0}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare(pulse.id);
                setAnimatingShare(prev => ({ ...prev, [pulse.id]: true }));
                setTimeout(() => setAnimatingShare(prev => ({ ...prev, [pulse.id]: false })), 600);
              }}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors ${animatingShare[pulse.id] ? 'animate-spin' : ''}`}>
                <Share2 className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <span className="text-xs font-semibold">{pulse.ripples || 0}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite(pulse.id);
                setAnimatingFavorite(prev => ({ ...prev, [pulse.id]: true }));
                setTimeout(() => setAnimatingFavorite(prev => ({ ...prev, [pulse.id]: false })), 600);
              }}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors ${animatingFavorite[pulse.id] ? 'animate-bounce' : ''}`}>
                <Bookmark className={`w-4 h-4 md:w-6 md:h-6 ${user?.favorites?.includes(pulse.id) ? 'fill-current text-yellow-400' : ''}`} />
              </div>
              <span className="text-xs font-semibold">{user?.favorites?.includes(pulse.id) ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="flex flex-col items-center gap-1 text-white md:flex"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                {isMuted ? <VolumeX className="w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="w-4 h-4 md:w-6 md:h-6" />}
              </div>
            </button>
          </div>

          {/* Play/Pause Indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-white" />
              </div>
            </div>
          )}
        </div>
      ))}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="h-screen flex items-center justify-center">
            <Loading size="md" text="Loading more pulses..." />
          </div>
        )}
      </div>


      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-slide-in-bottom">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Comments</h3>
              <button
                onClick={() => setShowComments(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {pulses.find(p => p.id === showComments)?.echoes?.map((echo, i) => (
                <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">@{echo.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(echo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{echo.content}</p>
                </div>
              )) || <p className="text-gray-500 text-center">No comments yet</p>}
            </div>

            {user && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(showComments)}
                  />
                  <button
                    onClick={() => handleComment(showComments)}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}