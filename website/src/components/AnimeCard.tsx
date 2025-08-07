"use client";

import { Card, Typography, Box, Skeleton } from "@mui/material";
import Image from "next/image";

interface Anime {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  categories: string[];
  langues: string[];
}

interface AnimeCardProps {
  anime?: Anime;
  loading?: boolean;
  onClick?: () => void;
  onMenuClick?: (e: React.MouseEvent<HTMLButtonElement>, anime: Anime) => void;
  refProp?: React.RefObject<HTMLDivElement | null>;
}

function sanitizeFileName(fileName?: string | null): string {
  if (!fileName) return "";
  fileName = fileName.replace(/:/g, "-");
  fileName = fileName.replace(/[\/\\?%*\|"<>]/g, "");
  fileName = fileName.replace(/-(\.webp)$/, "$1");
  return fileName;
}

export default function AnimeCard({
  anime,
  loading = false,
  onClick,
  onMenuClick,
  refProp,
}: AnimeCardProps) {
  if (loading) {
    return (
      <Box ref={refProp}>
        <Card
          sx={{
            width: "100%",
            aspectRatio: "2 / 3",
            backgroundColor: "#1a1a1a",
            borderRadius: 0,
          }}
        >
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Card>
        <Box sx={{ marginTop: "5px", width: "100%" }}>
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="90%" height={15} sx={{ mt: 0.5 }} />
        </Box>
      </Box>
    );
  }

  if (!anime) return null;

  const imageUrl = `https://cdn.watch-anime.fr/img/anime/${anime.nomAnimeURL}.webp`;

  const CardContent = (
    <>
      <Card
        sx={{
          width: "100%",
          aspectRatio: "2 / 3",
          backgroundColor: "#1a1a1a",
          borderRadius: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Image
          src={imageUrl}
          alt={anime.nomAnime}
          fill
          style={{
            objectFit: "cover",
          }}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          priority={false}
        />
      </Card>

      <Box
        sx={{
          marginTop: "5px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="body1"
            className="anime-title"
            sx={{
              color: "white",
              fontWeight: "bold",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexGrow: 1,
              transition: "color 0.3s ease",
              fontSize: {
                xs: "0.7rem",
                sm: "0.8rem",
                md: "0.9rem",
                lg: "1.0rem",
                xl: "1.1rem",
              },
            }}
          >
            {anime.nomAnime}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "gray",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
            fontSize: {
              xs: "0.5rem",
              sm: "0.6rem",
              md: "0.7rem",
              lg: "0.8rem",
              xl: "0.9rem",
            },
          }}
        >
          {anime.langues.join(", ")}, {anime.categories.join(", ")}
        </Typography>
      </Box>
    </>
  );

  return (
    <Box
      ref={refProp}
      onClick={onClick}
      sx={{
        flexGrow: 1,
        cursor: "pointer",
        "&:hover .anime-title": { color: "rgb(126 34 206 / 1)" },
      }}
    >
      {CardContent}
    </Box>
  );
}
