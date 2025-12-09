'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types';
import { Heart, MessageCircle, Share2, Users, Bell } from 'lucide-react';
import Loading from './Loading';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];

      // Sort client-side
      notificationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(notificationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'resonance':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'echo':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'ripple':
        return <Share2 className="w-5 h-5 text-green-500" />;
      case 'tribe':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'resonance':
        return 'resonated with your Pulse';
      case 'echo':
        return 'echoed on your Pulse';
      case 'ripple':
        return 'rippled your Pulse';
      case 'tribe':
        return 'joined your Tribe';
      case 'message':
        return 'sent you a message';
      default:
        return notification.content;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading Notifications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h2 className="text-2xl font-bold">Resonance</h2>
        <p className="text-sm text-gray-600 mt-1">Stay updated with your Tribe</p>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Notifications Yet</h3>
            <p className="text-gray-600 text-center">
              When someone resonates with your Pulses or joins your Tribe, you'll see it here!
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  {notification.fromUserPhoto ? (
                    <img
                      src={notification.fromUserPhoto}
                      alt={notification.fromUsername}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {notification.fromUsername[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">
                        @{notification.fromUsername}
                      </span>{' '}
                      <span className="text-gray-600">
                        {getNotificationText(notification)}
                      </span>
                    </p>
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}