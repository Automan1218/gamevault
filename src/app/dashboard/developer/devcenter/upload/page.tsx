"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { navigationRoutes } from "@/lib/navigation";

export default function DevCenterUploadRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace(navigationRoutes.devcenterUploadForm);
    }, [router]);
    return null;
}