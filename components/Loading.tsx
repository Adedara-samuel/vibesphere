import { useTheme } from '@/contexts/ThemeContext';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loading({ size = 'md', text }: LoadingProps) {
  const { config } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Creative TikTok-like loading animation */}
      <div className="relative">
        <div className={`rounded-full ${sizeClasses[size]} border-4 border-gray-200`}></div>
        <div className={`absolute top-0 left-0 rounded-full ${sizeClasses[size]} border-4 border-transparent ${config.gradient} animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 bg-white rounded-full animate-pulse`}></div>
        </div>
      </div>

      {/* VibeSphere logo in loading */}
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center`}>
          <span className="text-white font-bold text-xs">V</span>
        </div>
        <span className="text-sm font-semibold text-gray-600">VibeSphere</span>
      </div>

      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}