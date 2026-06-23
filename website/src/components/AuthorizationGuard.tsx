"use client";

import { usePathname } from "next/navigation";
import { useAuthorizationCheck } from "@/hooks/useAuthorizationCheck";
import { SITE_CONFIG } from "@/lib/config";
import { Box, CircularProgress } from "@mui/material";

interface AuthorizationGuardProps {
  children: React.ReactNode;
}

export default function AuthorizationGuard({ children }: AuthorizationGuardProps) {
  const pathname = usePathname();
  const { isAuthorized, isLoading } = useAuthorizationCheck();

  if (SITE_CONFIG.ALLOWED_PUBLIC_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  if (!SITE_CONFIG.PRIVATE_MODE) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
