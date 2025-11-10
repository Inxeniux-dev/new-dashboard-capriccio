"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function LogisticsConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirigir a la página de conversaciones en tiempo real
    const platform = searchParams.get("platform");
    const id = searchParams.get("id");
    const phone = searchParams.get("phone");

    let redirectUrl = "/dashboard/logistics/conversations/realtime";
    const params = new URLSearchParams();

    if (platform) params.append("platform", platform);
    if (id) params.append("id", id);
    if (phone) params.append("phone", phone);

    if (params.toString()) {
      redirectUrl += `?${params.toString()}`;
    }

    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Redirigiendo a conversaciones en tiempo real...</p>
      </div>
    </div>
  );
}