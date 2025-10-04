import { theme } from 'antd';

// 统一的深色主题配置
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#6366f1",
    colorBgContainer: "rgba(15, 23, 42, 0.8)",
    colorBgElevated: "rgba(31, 41, 55, 0.9)",
    colorBorder: "rgba(75, 85, 99, 0.3)",
    colorText: "#f9fafb",
    colorTextSecondary: "#d1d5db",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
} as const;

// 统一的输入框样式
export const inputStyle = {
  height: 35,
  borderRadius: 12,
  backgroundColor: 'rgba(31, 41, 55, 0.8)',
  border: '1px solid rgba(75, 85, 99, 0.4)',
  fontSize: '1rem',
};

// 统一的图标样式
export const iconStyle = { color: '#9ca3af' };

// 渐变背景样式
export const gradientBackground = `
  radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
  radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
  radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
  linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
`;

// 卡片样式
export const cardStyle = {
  borderRadius: 24,
  background: 'rgba(15, 23, 42, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  boxShadow: `
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
};

// 按钮样式
export const primaryButtonStyle = {
  height: 52,
  fontSize: '1.1rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
  border: 'none',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// 标题样式
export const titleStyle = {
  background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 600,
};
