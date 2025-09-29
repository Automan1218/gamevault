import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { primaryButtonStyle } from '../common/theme';

interface CustomButtonProps extends AntButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  style,
  onMouseEnter,
  onMouseLeave,
  children,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 16,
      fontWeight: 600,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...style,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          ...primaryButtonStyle,
          height: size === 'small' ? 40 : size === 'large' ? 56 : 52,
          fontSize: size === 'small' ? '0.9rem' : size === 'large' ? '1.2rem' : '1.1rem',
        };
      case 'secondary':
        return {
          ...baseStyle,
          background: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid rgba(75, 85, 99, 0.4)',
          color: '#d1d5db',
          height: size === 'small' ? 40 : size === 'large' ? 56 : 52,
          fontSize: size === 'small' ? '0.9rem' : size === 'large' ? '1.2rem' : '1.1rem',
        };
      case 'ghost':
        return {
          ...baseStyle,
          background: 'transparent',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#6366f1',
          height: size === 'small' ? 40 : size === 'large' ? 56 : 52,
          fontSize: size === 'small' ? '0.9rem' : size === 'large' ? '1.2rem' : '1.1rem',
        };
      default:
        return baseStyle;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.4)';
    } else if (variant === 'secondary') {
      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)';
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.3)';
    } else if (variant === 'secondary') {
      e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
      e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.4)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
    }
    onMouseLeave?.(e);
  };

  return (
    <AntButton
      {...props}
      style={getButtonStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </AntButton>
  );
};

