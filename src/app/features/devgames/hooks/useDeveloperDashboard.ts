"use client";

import { useEffect, useState } from "react";
import { devgamesApi } from "@/app/features/devgames/services/devgamesApi";
import { DevDashboardDetailedResponse } from "@/app/features/devgames/types/devGameTypes";

/**
 * ✅ 只负责发请求（自动附带 JWT）
 * 不判断登录状态，不做前端鉴权逻辑
 */

export function useDeveloperDashboard() {
    const [data, setData] = useState<DevDashboardDetailedResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            // ✅ 从 localStorage 获取 JWT
            const token = localStorage.getItem("token");

            // ✅ 发起请求（devgamesApi 内部会自动加 Authorization 头）
            const res = await devgamesApi.getDeveloperDashboard();
            setData(res);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            const msg =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch developer dashboard";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return { data, loading, error, refetch: fetchDashboard };
}
