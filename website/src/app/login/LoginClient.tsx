"use client";

import { signIn } from "next-auth/react";
import { Button, Container, Box, Typography, Divider } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { FaDiscord } from "react-icons/fa";

export default function LoginClient() {
  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Se connecter
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={() => signIn("google", { callbackUrl: "/settings" })}
        startIcon={<GoogleIcon />}
        sx={{
          backgroundColor: "#ffffff",
          color: "#000",
          "&:hover": { backgroundColor: "#f1f1f1" },
        }}
      >
        Connexion avec Google
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", width: "100%", my: 2 }}>
        <Divider sx={{ flex: 1, borderColor: "white" }} />
        <Typography sx={{ mx: 1, color: "white" }}>OU</Typography>
        <Divider sx={{ flex: 1, borderColor: "white" }} />
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={() => signIn("discord", { callbackUrl: "/settings" })}
        startIcon={<FaDiscord size={24} />}
        sx={{
          backgroundColor: "#5865F2",
          color: "#ffffff",
          "&:hover": { backgroundColor: "#4752C4" },
        }}
      >
        Connexion avec Discord
      </Button>
    </Container>
  );
}
