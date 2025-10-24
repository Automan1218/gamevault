"use client";

import React from "react";
import { Typography, ConfigProvider, theme } from "antd";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  showBackground?: boolean;
  showDecorations?: boolean;
  children: React.ReactNode;
}

// —— Design tokens (keep overall dark + neon vibe, but subtler)
const RADIUS = 20;
const CARD_BG = "rgba(17, 24, 39, 0.86)"; // slate-900 ~ with alpha
const CARD_BORDER = "1px solid rgba(99, 102, 241, 0.18)"; // indigo accent
const CARD_SHADOW = "0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.08)";
export const dynamic = 'force-dynamic';
export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  showBackground = true,
  showDecorations = true,
  children,
}) => {
  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: "#6366f1",
      colorBgContainer: "#0b1220",
      colorBgElevated: CARD_BG,
      colorBorder: "rgba(148, 163, 184, 0.18)",
      colorText: "#e5e7eb",
      colorTextSecondary: "#9ca3af",
      borderRadius: RADIUS,
      boxShadow: CARD_SHADOW,
    },
  } as const;

  return (
    <ConfigProvider theme={darkTheme}>
      <div
        style={{
          minHeight: "100vh",
          background: showBackground
            ? `
              radial-gradient(60rem 40rem at -10% -20%, rgba(99,102,241,0.18), transparent 60%),
              radial-gradient(60rem 40rem at 110% 120%, rgba(139,92,246,0.16), transparent 60%),
              linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1220 100%)
            `
            : "transparent",
          padding: "96px 32px 32px 32px", // Add 64px top padding for Menubar space
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft decorative orbs (reduced, disabled on low motion) */}
        {showDecorations && (
          <>
            <div
              style={{
                position: "absolute",
                top: "8%",
                left: "10%",
                width: 220,
                height: 220,
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(0.5px)",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "12%",
                right: "12%",
                width: 180,
                height: 180,
                background:
                  "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(0.5px)",
                zIndex: 0,
              }}
            />
          </>
        )}

        {/* Header */}
        <div
          style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}
        >
          <div
            aria-hidden
            style={{
              fontSize: 56,
              marginBottom: 12,
              lineHeight: 1,
              background:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 8px rgba(99,102,241,0.25))",
            }}
          >
            🎮
          </div>
          <Typography.Title
            level={1}
            style={{
              margin: 0,
              fontSize: "2.25rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #f9fafb 0%, #d1d5db 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title}
          </Typography.Title>
          {subtitle && (
            <Typography.Text
              style={{
                display: "block",
                marginTop: 6,
                fontSize: "1.05rem",
                color: "#a1a1aa",
              }}
            >
              {subtitle}
            </Typography.Text>
          )}
        </div>

        {/* Main card */}
        <div
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            padding: 32,
            borderRadius: RADIUS,
            background: CARD_BG,
            backdropFilter: "blur(16px)",
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </ConfigProvider>
  );
};