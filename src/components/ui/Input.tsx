import React from 'react';
import { Input as AntInput, InputProps as AntInputProps } from 'antd';
import { inputStyle, iconStyle } from '../common/theme';

interface CustomInputProps extends Omit<AntInputProps, 'variant'> {
  variant?: 'default' | 'search' | 'password';
  icon?: React.ReactNode;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  variant = 'default',
  icon,
  style,
  prefix,
  ...props
}) => {
  const getInputStyle = () => {
    const baseStyle = {
      ...inputStyle,
      ...style,
    };

    if (variant === 'search') {
      return {
        ...baseStyle,
        background: 'rgba(31, 41, 55, 0.9)',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)',
      };
    }

    return baseStyle;
  };

  return (
    <AntInput
      {...props}
      style={getInputStyle()}
      prefix={prefix || icon}
    />
  );
};

export const CustomSearchInput: React.FC<Omit<CustomInputProps, 'variant'> & { onSearch?: (value: string) => void }> = ({ onSearch, style, ...props }) => {
  const searchStyle = {
    ...inputStyle,
    background: 'rgba(31, 41, 55, 0.9)',
    border: '2px solid rgba(99, 102, 241, 0.3)',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)',
    ...style,
  };
  
  return <AntInput.Search {...props} onSearch={onSearch} style={searchStyle} />;
};

export const CustomPasswordInput: React.FC<Omit<CustomInputProps, 'variant'>> = (props) => {
  return <AntInput.Password {...props} style={{ ...inputStyle, ...props.style }} />;
};
