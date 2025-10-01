import React from 'react';
import { Typography } from 'antd';
import { titleStyle } from '../common/theme';

const { Title: AntTitle } = Typography;

interface CustomTitleProps {
  level?: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  centered?: boolean;
  gradient?: boolean;
}

export const CustomTitle: React.FC<CustomTitleProps> = ({
  level = 1,
  children,
  style,
  className,
  centered = false,
  gradient = true,
  ...props
}) => {
  const getTitleStyle = () => {
    const baseStyle = {
      margin: 0,
      fontWeight: 600,
      ...style,
    };

    if (gradient) {
      return {
        ...baseStyle,
        ...titleStyle,
      };
    }

    return {
      ...baseStyle,
      color: '#f9fafb',
    };
  };

  const containerStyle = centered ? { textAlign: 'center' as const } : {};

  return (
    <div style={containerStyle}>
      <AntTitle
        level={level}
        style={getTitleStyle()}
        className={className}
        {...props}
      >
        {children}
      </AntTitle>
    </div>
  );
};

