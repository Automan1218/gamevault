import React from 'react';
import { Card as AntCard, CardProps as AntCardProps } from 'antd';
import { cardStyle } from '../common/theme';

interface CustomCardProps extends AntCardProps {
  variant?: 'default' | 'elevated' | 'glass';
  hoverable?: boolean;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  variant = 'default',
  hoverable = false,
  style,
  onMouseEnter,
  onMouseLeave,
  children,
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = {
      ...cardStyle,
      ...style,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          boxShadow: `
            0 20px 60px rgba(99, 102, 241, 0.3),
            0 0 0 1px rgba(99, 102, 241, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
        };
      case 'glass':
        return {
          ...baseStyle,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        };
      default:
        return baseStyle;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
      e.currentTarget.style.boxShadow = `
        0 20px 60px rgba(99, 102, 241, 0.3),
        0 0 0 1px rgba(99, 102, 241, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `;
      e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.5)';
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = `
        0 10px 40px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(99, 102, 241, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `;
      e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.2)';
    }
    onMouseLeave?.(e);
  };

  return (
    <AntCard
      {...props}
      style={getCardStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </AntCard>
  );
};

