"use client";

import { signIn } from "next-auth/react";
import { Button, Container, Box, Typography, Divider } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { FaDiscord } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: string) => {
    setIsLoading(true);

    try {
      const result = await signIn(provider, {
        callbackUrl: "/settings",
        redirect: false
      });

      if (result?.error) {
        router.push("/the-end");
      } else if (result?.ok && result?.url) {
        router.push(result.url);
      } else {
        router.push("/the-end");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      router.push("/the-end");
    } finally {
      setIsLoading(false);
    }
  };

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

      <Typography
        variant="body2"
        sx={{
          marginBottom: 3,
          color: "#cccccc",
          textAlign: "center",
          fontSize: "0.9rem"
        }}
      >
        Only authorized accounts can access the site.
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={() => handleSignIn("google")}
        startIcon={<GoogleIcon />}
        disabled={isLoading}
        sx={{
          backgroundColor: "#ffffff",
          color: "#000",
          "&:hover": { backgroundColor: "#f1f1f1" },
        }}
      >
        {isLoading ? "Connexion..." : "Connexion avec Google"}
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", width: "100%", my: 2 }}>
        <Divider sx={{ flex: 1, borderColor: "white" }} />
        <Typography sx={{ mx: 1, color: "white" }}>OU</Typography>
        <Divider sx={{ flex: 1, borderColor: "white" }} />
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={() => handleSignIn("discord")}
        startIcon={<FaDiscord size={24} />}
        disabled={isLoading}
        sx={{
          backgroundColor: "#5865F2",
          color: "#ffffff",
          "&:hover": { backgroundColor: "#4752C4" },
        }}
      >
        {isLoading ? "Connexion..." : "Connexion avec Discord"}
      </Button>
    </Container>
  );
}
