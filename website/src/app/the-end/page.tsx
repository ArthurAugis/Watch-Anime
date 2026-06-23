"use client";

import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function TheEndPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#0d1117",
        position: "relative",
      }}
    >
      <Box
        sx={{
          maxWidth: "700px",
          padding: "60px 40px",
          borderRadius: "12px",
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            marginBottom: "1.5rem",
            color: "#f0f6fc",
            fontWeight: "600",
            letterSpacing: "-0.02em",
          }}
        >
          Site closed
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1rem", md: "1.1rem" },
            marginBottom: "3rem",
            color: "#c9d1d9",
            lineHeight: 1.7,
            maxWidth: "500px",
            margin: "0 auto 3rem auto",
          }}
        >
          To avoid issues related to{" "}
          <Box component="span" sx={{ color: "#f85149", fontWeight: "500" }}>
            copyrights
          </Box>
          , this site is no longer accessible.
          <br />
          <br />
          The{" "}
          <Box component="span" sx={{ color: "#79c0ff", fontWeight: "500" }}>
            full source code
          </Box>{" "}
          is available on GitHub for personal use.
        </Typography>

        <Button
          variant="outlined"
          size="large"
          startIcon={<GitHubIcon />}
          onClick={() => window.open("https://github.com/ArthurAugis/Watch-Anime/", "_blank")}
          sx={{
            color: "#c9d1d9",
            borderColor: "#30363d",
            padding: "12px 32px",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "6px",
            textTransform: "none",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#21262d",
              borderColor: "#8b949e",
              color: "#f0f6fc",
            },
          }}
        >
          View source code
        </Button>

        <Typography
          variant="body2"
          sx={{
            marginTop: "3rem",
            color: "#6e7681",
            fontSize: "0.9rem",
          }}
        >
          Thanks for understanding
        </Typography>
      </Box>
    </Box>
  );
}
