// "use client";

// import React from 'react';
// import { Button, Typography } from 'antd';
// import { EyeOutlined } from '@ant-design/icons';

// interface GameCardProps {
//   gameId: number;
//   title: string;
//   price?: number;
//   activationCodesCount: number;
//   onViewCodes: () => void;
//   index: number;
// }

// export const GameCard: React.FC<GameCardProps> = ({
//   gameId,
//   title,
//   price,
//   activationCodesCount,
//   onViewCodes,
//   index,
// }) => {
//   return (
//     <div
//       style={{
//         borderRadius: 20,
//         background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%)',
//         backdropFilter: 'blur(25px)',
//         border: '1px solid rgba(99, 102, 241, 0.2)',
//         boxShadow: `
//           0 10px 40px rgba(0, 0, 0, 0.4),
//           0 0 0 1px rgba(99, 102, 241, 0.1),
//           inset 0 1px 0 rgba(255, 255, 255, 0.1)
//         `,
//         transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//         cursor: 'pointer',
//         overflow: 'hidden',
//         position: 'relative',
//         animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
//         e.currentTarget.style.boxShadow = `
//           0 20px 60px rgba(99, 102, 241, 0.3),
//           0 0 0 1px rgba(99, 102, 241, 0.4),
//           inset 0 1px 0 rgba(255, 255, 255, 0.2)
//         `;
//         e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.5)';
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.transform = 'translateY(0) scale(1)';
//         e.currentTarget.style.boxShadow = `
//           0 10px 40px rgba(0, 0, 0, 0.4),
//           0 0 0 1px rgba(99, 102, 241, 0.1),
//           inset 0 1px 0 rgba(255, 255, 255, 0.1)
//         `;
//         e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.2)';
//       }}
//     >
//       {/* 游戏封面占位符 */}
//       <div
//         style={{
//           height: '180px',
//           background: `
//             linear-gradient(135deg, 
//               rgba(99, 102, 241, 0.4) 0%, 
//               rgba(168, 85, 247, 0.3) 30%, 
//               rgba(6, 182, 212, 0.4) 70%, 
//               rgba(34, 197, 94, 0.3) 100%
//             ),
//             radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
//             radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
//           `,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           position: 'relative',
//           marginBottom: '20px',
//           overflow: 'hidden',
//         }}
//       >
//         {/* 装饰性背景图案 */}
//         <div
//           style={{
//             position: 'absolute',
//             top: '-50%',
//             left: '-50%',
//             width: '200%',
//             height: '200%',
//             background: `
//               radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
//               radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
//               radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
//             `,
//             animation: 'float 8s ease-in-out infinite',
//           }}
//         />
        
//         <div
//           style={{
//             fontSize: '4rem',
//             background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 50%, #d1d5db 100%)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             backgroundClip: "text",
//             opacity: 0.8,
//             filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
//             zIndex: 1,
//           }}
//         >
//           🎮
//         </div>
        
//         {/* 查看激活码按钮 */}
//         <Button
//           type="primary"
//           size="small"
//           icon={<EyeOutlined />}
//           onClick={(e) => {
//             e.stopPropagation();
//             onViewCodes();
//           }}
//           style={{
//             position: 'absolute',
//             bottom: '16px',
//             left: '50%',
//             transform: 'translateX(-50%)',
//             background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
//             border: 'none',
//             borderRadius: '24px',
//             padding: '6px 16px',
//             fontSize: '0.85rem',
//             fontWeight: 600,
//             boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
//             backdropFilter: 'blur(15px)',
//             zIndex: 2,
//             transition: 'all 0.3s ease',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
//             e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.6)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
//             e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
//           }}
//         >
//           查看激活码
//         </Button>
//       </div>

//       <div style={{ padding: '0 28px 28px 28px' }}>
//         {/* 游戏标题 */}
//         <Typography.Title 
//           level={4} 
//           style={{ 
//             margin: '0 0 20px 0', 
//             color: '#f9fafb',
//             fontSize: '1.4rem',
//             fontWeight: 700,
//             lineHeight: 1.3,
//             background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             backgroundClip: 'text',
//             textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
//           }}
//         >
//           {title}
//         </Typography.Title>
        
//         {/* 激活码数量显示 */}
//         <div
//           style={{ 
//             color: "#d1d5db",
//             marginBottom: 0,
//             fontSize: '1rem',
//             background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
//             border: '1px solid rgba(99, 102, 241, 0.3)',
//             padding: '12px 16px',
//             borderRadius: 12,
//             display: 'flex',
//             alignItems: 'center',
//             gap: 10,
//             backdropFilter: 'blur(10px)',
//             boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)',
//           }}
//         >
//           <EyeOutlined style={{ 
//             color: '#6366f1', 
//             fontSize: '1.1rem',
//             filter: 'drop-shadow(0 1px 2px rgba(99, 102, 241, 0.3))'
//           }} />
//           <span style={{ fontWeight: 500 }}>
//             拥有 {activationCodesCount} 个激活码
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };


"use client";

import React from "react";
import { Button, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";

interface GameCardProps {
  gameId: number;
  title: string;
  price?: number;
  activationCodesCount: number;
  onViewCodes: () => void;
  index: number;
}

const CARD_RADIUS = 20;
const CARD_HOVER = {
  transform: "translateY(-6px)",
  boxShadow:
    "0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.28)",
  border: "1px solid rgba(99,102,241,0.35)",
};

export const GameCard: React.FC<GameCardProps> = ({
  gameId,
  title,
  price,
  activationCodesCount,
  onViewCodes,
  index,
}) => {
  return (
    <div
      style={{
        borderRadius: CARD_RADIUS,
        background:
          "linear-gradient(145deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.92) 100%)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(99,102,241,0.18)",
        boxShadow:
          "0 14px 40px rgba(0,0,0,0.42), 0 0 0 1px rgba(99,102,241,0.08)",
        transition: "all .3s ease",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        willChange: "transform",
        animation: `fadeInUp .5s ease-out ${index * 0.04}s both`,
      }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, CARD_HOVER);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, {
          transform: "translateY(0)",
          boxShadow:
            "0 14px 40px rgba(0,0,0,0.42), 0 0 0 1px rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.18)",
        });
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: 168,
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.28) 60%, rgba(6,182,212,0.32) 100%), radial-gradient(ellipse at top left, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,255,255,0.08) 0%, transparent 50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 18,
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            fontSize: 44,
            background:
              "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 60%, #d1d5db 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.9,
          }}
        >
          🎮
        </div>

        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onViewCodes();
          }}
          style={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(139,92,246,0.95) 100%)",
            border: "none",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: ".85rem",
            fontWeight: 600,
            boxShadow: "0 6px 18px rgba(99,102,241,0.45)",
            backdropFilter: "blur(8px)",
            transition: "transform .2s ease, box-shadow .2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(-50%) scale(1.05)";
            e.currentTarget.style.boxShadow = "0 10px 22px rgba(99,102,241,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(-50%) scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(99,102,241,0.45)";
          }}
        >
          查看激活码
        </Button>
      </div>

      {/* Body */}
      <div style={{ padding: "0 22px 22px" }}>
        <Typography.Title
          level={4}
          style={{
            margin: "0 0 8px 0",
            color: "#f9fafb",
            fontSize: "1.25rem",
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </Typography.Title>

        {/* Meta row: price + codes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              color: "#e5e7eb",
              fontWeight: 600,
              fontSize: "0.98rem",
              opacity: price ? 1 : 0.7,
            }}
          >
            {price != null ? `¥ ${price.toFixed(2)}` : "—"}
          </div>

          <div
            style={{
              color: "#d1d5db",
              fontSize: ".95rem",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.10) 100%)",
              border: "1px solid rgba(99,102,241,0.28)",
              padding: "8px 12px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              backdropFilter: "blur(8px)",
            }}
          >
            <EyeOutlined style={{ color: "#6366f1", fontSize: "1rem" }} />
            <span style={{ fontWeight: 500 }}>拥有 {activationCodesCount} 个激活码</span>
          </div>
        </div>
      </div>
    </div>
  );
};
