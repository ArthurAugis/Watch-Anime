"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/config";

export function useAuthorizationCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!SITE_CONFIG.PRIVATE_MODE) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated" || !session) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/check-authorization");
        const data = await response.json();
        setIsAuthorized(data.authorized);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'autorisation:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [session, status]);

  useEffect(() => {
    if (!isLoading && isAuthorized === false && !SITE_CONFIG.ALLOWED_PUBLIC_PAGES.includes(pathname)) {
      router.push("/the-end");
    }
  }, [isAuthorized, isLoading, pathname, router]);

  return { isAuthorized, isLoading };
}
