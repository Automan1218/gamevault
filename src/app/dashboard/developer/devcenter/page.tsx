"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';
export default function DevCenterPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/developer/devcenter/dashboard");
    }, [router]);

    return null;
}
