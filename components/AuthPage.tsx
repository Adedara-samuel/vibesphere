'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sparkles, Video, MessageCircle, Users, Eye, EyeOff } from 'lucide-react';
import Toast from './Toast';
import Input from './Input';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { config } = useTheme();

  const verifyEmail = async (email: string): Promise<boolean> => {
    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    // For demo purposes, we'll just return true. In production, use an API like:
    // const response = await fetch(`https://api.email-validator.net/api/verify?EmailAddress=${email}&APIKey=YOUR_API_KEY`);
    // const data = await response.json();
    // return data.is_valid;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!username || !displayName || !confirmPassword) {
          setToast({ message: 'Please fill in all fields', type: 'error' });
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setToast({ message: 'Passwords do not match', type: 'error' });
          setLoading(false);
          return;
        }
        // Email verification check
        const isValidEmail = await verifyEmail(email);
        if (!isValidEmail) {
          setToast({ message: 'Please enter a valid email address', type: 'error' });
          setLoading(false);
          return;
        }
        await signUp(email, password, username, displayName);
        setToast({ message: 'Account created successfully!', type: 'success' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Authentication failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setToast({ message: 'Signed in with Google successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Google sign-in failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-white space-y-6 hidden md:block">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-12 h-12" />
            <h1 className="text-5xl font-bold">VibeSphere</h1>
          </div>
          <p className="text-2xl font-semibold">Connect Through Pulses</p>
          <p className="text-lg opacity-90">
            Experience the next generation of social connection
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-4">
              <Video className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Share Pulses & Waves</h3>
                <p className="opacity-80">Create and discover trending content</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MessageCircle className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Real-Time Chat</h3>
                <p className="opacity-80">Connect instantly with your tribe</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Build Your Tribe</h3>
                <p className="opacity-80">Grow your community and resonate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
          <div className="md:hidden flex items-center justify-center gap-3 mb-6">
            <Sparkles className={`w-10 h-10 ${config.text}`} />
            <h1 className="text-3xl font-bold gradient-text">VibeSphere</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Join VibeSphere'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                hasToggle
                toggleIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!isLogin}
                  hasToggle
                  toggleIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${config.gradient} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-700">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`${config.text} font-semibold hover:underline`}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}