"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { navigationRoutes } from "@/lib/navigation";
export const dynamic = 'force-dynamic';
export default function DeveloperRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace(navigationRoutes.developer + "/profile");
    }, [router]);

    return null;
}