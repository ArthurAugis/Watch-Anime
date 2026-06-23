"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthorizationGuard from "@/components/AuthorizationGuard";
import { Box } from "@mui/material";

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isTheEndPage = pathname === "/the-end";

  return (
    <AuthorizationGuard>
      {!isTheEndPage && <Navbar />}
      <Box
        component="main"
        sx={{
          padding: isTheEndPage ? "0" : { xs: "20px 0px", md: "20px" },
          marginLeft: isTheEndPage ? "0" : "60px",
          marginBottom: isTheEndPage ? "0" : "100px",
        }}
      >
        {children}
      </Box>
    </AuthorizationGuard>
  );
}
