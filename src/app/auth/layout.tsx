"use client";

import React from "react";
import { ConfigProvider, theme, Typography } from "antd";
import "./login/animations.css";

const { Title, Text } = Typography;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const darkTheme = {
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

  return (
    <ConfigProvider theme={darkTheme}>
      <div
        className="login-container"
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: `
            radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
          `,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left decoration and brand area (fixed, doesn't change with sub-route state) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
          }}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "15%",
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              right: "15%",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          />

          {/* Left content */}
          <div style={{ textAlign: "center", zIndex: 1, padding: "0 80px" }}>
            <div
              style={{
                fontSize: 120,
                marginBottom: 32,
                background:
                  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))",
                animation: "glow 3s ease-in-out infinite alternate",
              }}
            >
              🎮
            </div>
            <Title
              level={1}
              style={{
                margin: 0,
                fontSize: "4rem",
                background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              }}
            >
              GameVault
            </Title>
            <Text
              style={{
                fontSize: "1.5rem",
                color: "#9ca3af",
                fontWeight: 400,
                letterSpacing: "0.01em",
                display: "block",
                marginBottom: "24px",
              }}
            >
              Explore Infinite Gaming Worlds
            </Text>
            <Text
              style={{
                fontSize: "1.1rem",
                color: "#6b7280",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              Discover amazing games, enjoy ultimate experience
              <br />
              Your game library, your choice
            </Text>
          </div>
        </div>

        {/* Right sub-page container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            background: "rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(20px)",
          }}
        >
          {children}
        </div>
      </div>
    </ConfigProvider>
  );
}


