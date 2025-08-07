"use client";

import { signOut, useSession } from "next-auth/react";
import { Box, Typography, Button, Avatar, CircularProgress } from "@mui/material";

export default function SettingsClient() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 40px)",
          color: "white",
        }}
      >
        <Typography variant="h5">Utilisateur non connecté.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90vh",
        color: "white",
        padding: 4,
      }}
    >
      <Avatar
        src={session.user.image ?? "/default-avatar.png"}
        alt="Photo de profil"
        sx={{ width: 100, height: 100, mb: 2, border: "3px solid rgb(126 34 206)" }}
      />
      <Typography variant="h4" fontWeight="bold">
        {session.user.name}
      </Typography>

      <Button
        onClick={() => signOut({ callbackUrl: "/login" })}
        sx={{
          mt: 4,
          backgroundColor: "rgb(126 34 206)",
          color: "white",
          textTransform: "none",
          "&:hover": { backgroundColor: "rgb(109, 29, 178)" },
        }}
      >
        Déconnexion
      </Button>
    </Box>
  );
}
