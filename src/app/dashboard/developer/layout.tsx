"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Menubar from "@/components/layout/Menubar";
import { darkTheme, gradientBackground } from "@/components/common/theme";
import "@/components/common/animations.css";
export const dynamic = 'force-dynamic';
export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div 
            style={{ 
                minHeight: "100vh",
                background: gradientBackground,
                position: "relative",
            }}
        >
            {/* ===== Menubar ===== */}
            <Menubar currentPath={pathname} />

            {/* ===== Content Area ===== */}
            <div style={{ paddingTop: "80px" }}>
                <div style={{ padding: "40px" }}>{children}</div>
            </div>
        </div>
    );
}