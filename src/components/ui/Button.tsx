import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'gold' | 'success' | 'danger' | 'warning';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  form?: string;
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  form,
  ariaLabel,
}) => {
  const baseStyles =
    'font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-6 py-3 rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-50',
    gold: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 shadow-lg hover:shadow-xl',
    success: 'bg-green-500 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 text-white shadow-lg hover:shadow-xl',
    warning: 'bg-amber-500 text-white shadow-lg hover:shadow-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      form={form}
      aria-label={ariaLabel}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;