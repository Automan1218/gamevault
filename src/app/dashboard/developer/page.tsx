"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { navigationRoutes } from "@/lib/navigation";

export default function DeveloperRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace(navigationRoutes.developer + "/devgames");
    }, [router]);

    return null;
}
