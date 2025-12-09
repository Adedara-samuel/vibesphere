'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Wave } from '@/types';
import { TrendingUp, Heart, MessageCircle, Share2, Play } from 'lucide-react';
import Loading from './Loading';

export default function WavesFeed() {
  const [waves, setWaves] = useState<Wave[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingWaves = async (): Promise<Wave[]> => {
    // Mock API calls to TikTok and Instagram trending content
    // In production, replace with actual API calls
    const mockTrendingContent: Wave[] = [
      {
        id: 'tiktok1',
        userId: 'tiktok_user',
        username: 'DanceVibes',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: '',
        caption: '🔥 Viral dance challenge! Join the trend! #DanceChallenge #Viral',
        tags: ['dance', 'challenge', 'viral', 'tiktok'],
        resonance: 2500000,
        resonatedBy: [],
        echoes: [],
        ripples: 50000,
        views: 15000000,
        duration: 15,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        userPhoto: '',
        isWave: true,
        trendingScore: 95,
      },
      {
        id: 'instagram1',
        userId: 'instagram_user',
        username: 'FoodieHeaven',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: '',
        caption: '🍕 This pizza recipe will change your life! Recipe in bio 👩‍🍳',
        tags: ['food', 'recipe', 'pizza', 'cooking'],
        resonance: 1800000,
        resonatedBy: [],
        echoes: [],
        ripples: 35000,
        views: 12000000,
        duration: 30,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        userPhoto: '',
        isWave: true,
        trendingScore: 88,
      },
      {
        id: 'tiktok2',
        userId: 'tiktok_user2',
        username: 'ComedyCentral',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: '',
        caption: '😂 When you try to be cool but... 🤣 #Comedy #Fail #Funny',
        tags: ['comedy', 'funny', 'fail', 'tiktok'],
        resonance: 3200000,
        resonatedBy: [],
        echoes: [],
        ripples: 75000,
        views: 22000000,
        duration: 12,
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        userPhoto: '',
        isWave: true,
        trendingScore: 97,
      },
    ];

    return mockTrendingContent;
  };

  useEffect(() => {
    const loadWaves = async () => {
      // First try to get user waves
      const q = query(
        collection(db, 'pulses'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const allPulses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Wave[];

      const userWaves = allPulses.filter(pulse => pulse.isWave === true);

      if (userWaves.length > 0) {
        // Sort by algorithm: resonance + views/1000 + recent bonus
        const sortedWaves = userWaves
          .map(wave => ({
            ...wave,
            trendingScore: (wave.resonance || 0) + ((wave.views || 0) / 1000) + (Date.now() - wave.createdAt.getTime()) / 86400000 // days old bonus
          }))
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 20);
        setWaves(sortedWaves);
      } else {
        // Load trending content from APIs
        const trendingWaves = await fetchTrendingWaves();
        setWaves(trendingWaves);
      }

      setLoading(false);
    };

    loadWaves();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading Waves..." />
      </div>
    );
  }

  if (waves.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Trending Waves</h3>
          <p className="text-gray-600">Check back soon for trending content!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <TrendingUp className="w-8 h-8 text-purple-600" />
        <h2 className="text-2xl font-bold">Trending Waves</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {waves.map((wave, index) => (
          <div
            key={wave.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-[9/16] bg-gray-900">
              <video
                src={wave.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                className="w-full h-full object-cover"
                poster={wave.thumbnailUrl}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-purple-600 ml-1" />
                </div>
              </div>
              
              {/* Trending Badge */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                #{index + 1} Trending
              </div>

              {/* Views */}
              <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {wave.views?.toLocaleString() || 0} views
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {wave.userPhoto ? (
                    <img src={wave.userPhoto} alt={wave.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{wave.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">@{wave.username}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(wave.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-3 line-clamp-2">{wave.caption}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {wave.tags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-semibold">{wave.resonance?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">{wave.echoes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">{wave.ripples || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}