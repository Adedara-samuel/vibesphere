'use client';

import { useState } from 'react';
import { Home, Compass, PlusSquare, MessageCircle, User, Bot, Bell, Search, PanelLeft, PanelRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from './Logo';
import PulseFeed from './PulseFeed';
import WavesFeed from './WavesFeed';
import CombinedChat from './CombinedChat';
import ChatBot from './ChatBot';
import Profile from './Profile';
import CreatePulse from './CreatePulse';
import Notifications from './Notifications';

type Tab = 'home' | 'waves' | 'create' | 'chat' | 'chatbot' | 'notifications' | 'profile';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { config } = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <PulseFeed showSearch={showSearch} setShowSearch={setShowSearch} />;
      case 'waves':
        return <WavesFeed />;
      case 'create':
        return <CreatePulse onClose={() => setActiveTab('home')} />;
      case 'chat':
        return <CombinedChat />;
      case 'chatbot':
        return <ChatBot />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      default:
        return <PulseFeed showSearch={showSearch} setShowSearch={setShowSearch} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-6 top-6 bottom-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className={`p-4 border-b border-gray-100 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`${sidebarCollapsed ? '' : 'flex-1'}`}>
            <Logo size={sidebarCollapsed ? 'sm' : 'md'} showText={!sidebarCollapsed} />
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
          >
            {sidebarCollapsed ? (
              <PanelRight className="w-5 h-5 text-gray-600" />
            ) : (
              <PanelLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3'} rounded-lg transition-colors ${
              activeTab === 'home' ? `${config.bg} dark:bg-blue-900/50 ${config.text} dark:text-blue-300 ${sidebarCollapsed ? '' : 'border-l-4 border-blue-500'}` : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={sidebarCollapsed ? 'Pulse Stream' : undefined}
          >
            <Home className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-bold text-lg">Pulse Stream</span>}
          </button>

          <button
            onClick={() => setActiveTab('waves')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3'} rounded-lg transition-colors ${
              activeTab === 'waves' ? `bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ${sidebarCollapsed ? '' : 'border-l-4 border-blue-500'}` : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={sidebarCollapsed ? 'Trending Waves' : undefined}
          >
            <Compass className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-bold text-lg">Trending Waves</span>}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3'} rounded-lg transition-colors ${
              activeTab === 'create' ? `bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ${sidebarCollapsed ? '' : 'border-l-4 border-blue-500'}` : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={sidebarCollapsed ? 'Create Pulse' : undefined}
          >
            <PlusSquare className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-bold text-lg">Create Pulse</span>}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3'} rounded-lg transition-colors ${
              activeTab === 'chat' ? `bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ${sidebarCollapsed ? '' : 'border-l-4 border-blue-500'}` : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={sidebarCollapsed ? 'Tribe Chat' : undefined}
          >
            <MessageCircle className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-bold text-lg">Tribe Chat</span>}
          </button>

          <button
            onClick={() => setActiveTab('chatbot')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3'} rounded-lg transition-colors ${
              activeTab === 'chatbot' ? `bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ${sidebarCollapsed ? '' : 'border-l-4 border-blue-500'}` : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={sidebarCollapsed ? 'AI Assistant' : undefined}
          >
            <Bot className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-bold text-lg">AI Assistant</span>}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3'} rounded-lg transition-colors ${
              activeTab === 'notifications' ? `bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ${sidebarCollapsed ? '' : 'border-l-4 border-blue-500'}` : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={sidebarCollapsed ? 'Resonance' : undefined}
          >
            <Bell className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-bold text-lg">Resonance</span>}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3'} rounded-lg transition-colors ${
              activeTab === 'profile' ? `bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ${sidebarCollapsed ? '' : 'border-l-4 border-blue-500'}` : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={sidebarCollapsed ? 'Profile' : undefined}
          >
            <User className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-bold text-lg">Profile</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`min-h-screen pb-20 lg:pb-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'
      }`}>
        {/* Top Bar - Mobile */}
        <header className="lg:hidden sticky top-0 z-10 bg-black text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="w-full max-w-4xl mx-auto lg:max-w-none lg:px-4">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-20">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              activeTab === 'home' ? config.text : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-bold">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('waves')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              activeTab === 'waves' ? config.text : 'text-gray-600'
            }`}
          >
            <Compass className="w-6 h-6" />
            <span className="text-xs font-bold">Waves</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              activeTab === 'chat' ? config.text : 'text-gray-600'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-bold">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              activeTab === 'profile' ? config.text : 'text-gray-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}