import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'gold' | 'info' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    gold: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
    info: 'bg-navy-800 text-white',
    error: 'bg-red-600 text-white',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;