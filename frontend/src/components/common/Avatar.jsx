import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({
  src,
  alt,
  size = 'md',
  className = '',
  ...props
}) => {
  // Avatar'ın boyut stilleri
  const sizeStyles = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  // Kullanıcı adından baş harfleri al
  const getInitials = (name) => {
    if (!name) return '?';
    
    // Adı boşluklardan ayır
    const parts = name.split(' ');
    
    if (parts.length === 1) {
      // Tek kelime ise ilk iki harf
      return name.substring(0, 2).toUpperCase();
    } else {
      // Çoklu kelime ise ilk iki kelimenin baş harfleri
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
  };

  // Rastgele renk üret (kullanıcı adına göre)
  const getRandomColor = (name) => {
    if (!name) return 'bg-gray-400';
    
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    // İsmin ilk harfinden bir indeks elde et
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div 
      className={`
        ${sizeStyles[size]}
        rounded-full overflow-hidden flex items-center justify-center
        ${className}
      `}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt || 'Avatar'} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`
          w-full h-full flex items-center justify-center text-white
          ${getRandomColor(alt)}
        `}>
          <span className={`
            font-medium
            ${size === 'xs' || size === 'sm' ? 'text-xs' : ''}
            ${size === 'md' ? 'text-sm' : ''}
            ${size === 'lg' ? 'text-base' : ''}
            ${size === 'xl' || size === '2xl' ? 'text-lg' : ''}
          `}>
            {getInitials(alt)}
          </span>
        </div>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
};

export default Avatar;