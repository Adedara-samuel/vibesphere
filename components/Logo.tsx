import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const { config } = useTheme();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-lg`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/4 h-3/4 text-white"
        >
          <path
            d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.8" />
        </svg>
      </div>
      {showText && (
        <h1 className={`${textSizeClasses[size]} font-bold gradient-text`}>
          VibeSphere
        </h1>
      )}
    </div>
  );
}