# VibeSphere - Next-Gen Social Media Platform

VibeSphere is a modern, fully-featured social media application built with Next.js 15, Firebase, and TypeScript. It features unique terminology and real-time interactions for an engaging user experience.

## 🌟 Unique Features & Terminology

VibeSphere uses innovative terminology to create a unique brand identity:

- **Pulses** - Short-form videos (like TikTok videos)
- **Waves** - Trending content that's gaining momentum
- **Vibes** - General posts and content
- **Resonance** - Likes/reactions to content
- **Echoes** - Comments on posts
- **Ripples** - Shares of content
- **Tribe** - Your followers/community
- **Vibing With** - People you follow

## 🚀 Features

### Core Functionality
- ✅ **Authentication** - Email/Password and Google Sign-In with Firebase Auth
- ✅ **Pulse Stream** - TikTok-style vertical video feed with auto-play
- ✅ **Trending Waves** - Discover trending content
- ✅ **Real-Time Chat** - Message friends instantly with Firebase Realtime Database
- ✅ **AI Chatbot** - Interactive AI assistant to help navigate the platform
- ✅ **Create Pulses** - Upload and share videos with captions and tags
- ✅ **Notifications** - Stay updated with Resonance, Echoes, and Tribe activity
- ✅ **User Profiles** - Customizable profiles with stats and content grid

### Technical Features
- 📱 **Fully Responsive** - Optimized for mobile and desktop
- 🎨 **Modern UI** - Beautiful gradients and smooth animations
- ⚡ **Real-Time Updates** - Firebase Firestore for instant data sync
- 🔐 **Secure** - Firebase Authentication and Security Rules
- 📹 **Video Storage** - Firebase Storage for video hosting
- 🎯 **Type-Safe** - Full TypeScript implementation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vibesphere
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase config to `lib/firebase.ts`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
vibesphere/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── AuthPage.tsx         # Authentication UI
│   ├── MainApp.tsx          # Main app layout
│   ├── PulseFeed.tsx        # Video feed
│   ├── WavesFeed.tsx        # Trending content
│   ├── ChatList.tsx         # Chat conversations
│   ├── ChatWindow.tsx       # Individual chat
│   ├── ChatBot.tsx          # AI assistant
│   ├── CreatePulse.tsx      # Video upload
│   ├── Notifications.tsx    # Activity feed
│   └── Profile.tsx          # User profile
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   └── firebase.ts          # Firebase configuration
├── types/
│   └── index.ts             # TypeScript types
└── package.json
```

## 🎨 Key Components

### PulseFeed
- Vertical scrolling video feed
- Auto-play with sound control
- Like, comment, and share interactions
- Smooth transitions between videos

### WavesFeed
- Grid layout of trending content
- Trending badges and view counts
- Quick access to popular Pulses

### Real-Time Chat
- Instant messaging with Firebase
- Message status indicators
- Media sharing support
- Online status tracking

### AI Chatbot
- Context-aware responses
- Platform guidance
- Quick question suggestions
- Natural conversation flow

### Profile
- User statistics (Pulses, Tribe, Resonance)
- Content grid view
- Edit profile functionality
- Sign out option

## 🔥 Firebase Collections

### users
```typescript
{
  uid: string
  username: string
  displayName: string
  email: string
  photoURL?: string
  bio?: string
  tribe: string[]
  vibingWith: string[]
  resonanceCount: number
  createdAt: Date
}
```

### pulses
```typescript
{
  id: string
  userId: string
  username: string
  videoUrl: string
  caption: string
  tags: string[]
  resonance: number
  echoes: Echo[]
  ripples: number
  views: number
  createdAt: Date
  isWave?: boolean
}
```

### messages
```typescript
{
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'video'
  isRead: boolean
  createdAt: Date
}
```

## 📱 Responsive Design

VibeSphere is fully responsive with:
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-optimized interactions
- Bottom navigation for mobile
- Sidebar navigation for desktop

## 🔐 Security

- Firebase Authentication for secure user management
- Firestore Security Rules for data protection
- Storage Rules for media access control
- Client-side validation
- Server-side timestamp generation

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Other Platforms
```bash
npm run build
npm start
```

## 📝 Environment Variables

Create a `.env.local` file (optional, config is in code):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Tailwind CSS for styling utilities
- Lucide for beautiful icons

---

Built with ❤️ using Next.js and Firebase