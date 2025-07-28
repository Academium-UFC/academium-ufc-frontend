interface UserAvatarProps {
  user: {
    name: string;
    foto_url?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  if (user.foto_url) {
    return (
      <img 
        src={user.foto_url} 
        alt={`Foto de ${user.name}`}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-blue-600 rounded-full flex items-center justify-center text-white font-bold ${className}`}>
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}
