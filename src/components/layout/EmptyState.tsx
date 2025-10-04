// "use client";

// import React from 'react';
// import { Typography } from 'antd';

// interface EmptyStateProps {
//   title: string;
//   description: string;
//   subDescription?: string;
// }

// export const EmptyState: React.FC<EmptyStateProps> = ({
//   title,
//   description,
//   subDescription,
// }) => {
//   return (
//     <div style={{ 
//       textAlign: 'center', 
//       padding: '100px 0',
//       background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
//       borderRadius: 20,
//       border: '1px solid rgba(99, 102, 241, 0.1)',
//       margin: '20px 0',
//     }}>
//       <div style={{ 
//         fontSize: 80, 
//         marginBottom: 24,
//         background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
//         WebkitBackgroundClip: "text",
//         WebkitTextFillColor: "transparent",
//         backgroundClip: "text",
//         filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))',
//         animation: 'glow 3s ease-in-out infinite alternate',
//       }}>
//         🎮
//       </div>
//       <Typography.Title 
//         level={3} 
//         style={{ 
//           color: '#f9fafb', 
//           fontSize: '1.8rem', 
//           fontWeight: 600,
//           marginBottom: 12,
//           background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
//           WebkitBackgroundClip: 'text',
//           WebkitTextFillColor: 'transparent',
//           backgroundClip: 'text',
//         }}
//       >
//         {title}
//       </Typography.Title>
//       <Typography.Text style={{ 
//         color: '#9ca3af', 
//         fontSize: '1.1rem',
//         display: 'block',
//         marginBottom: 16,
//       }}>
//         {description}
//       </Typography.Text>
//       {subDescription && (
//         <Typography.Text style={{ 
//           color: '#6b7280', 
//           fontSize: '0.95rem',
//           display: 'block',
//         }}>
//           {subDescription}
//         </Typography.Text>
//       )}
//     </div>
//   );
// };


// =============================
// File: EmptyState.tsx
// =============================
"use client";

import React from "react";
import { Typography } from "antd";

interface EmptyStateProps {
  title: string;
  description: string;
  subDescription?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  subDescription,
}) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "72px 0",
        background: "rgba(31,41,55,0.55)",
        borderRadius: 20,
        border: "1px solid rgba(99,102,241,0.14)",
        margin: "20px 0",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        aria-hidden
        style={{
          fontSize: 56,
          marginBottom: 14,
          background:
            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 2px 6px rgba(99,102,241,0.25))",
        }}
      >
        🎮
      </div>
      <Typography.Title
        level={3}
        style={{
          margin: 0,
          color: "#f9fafb",
          fontSize: "1.6rem",
          fontWeight: 700,
          background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {title}
      </Typography.Title>
      <Typography.Text
        style={{
          color: "#a1a1aa",
          fontSize: "1.02rem",
          display: "block",
          marginTop: 8,
          marginBottom: 10,
        }}
      >
        {description}
      </Typography.Text>
      {subDescription && (
        <Typography.Text
          style={{
            color: "#71717a",
            fontSize: "0.95rem",
            display: "block",
          }}
        >
          {subDescription}
        </Typography.Text>
      )}
    </div>
  );
};
