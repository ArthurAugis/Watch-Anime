"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Grid, Container, Typography, Box } from "@mui/material";
import AnimeCard from "@/components/AnimeCard";

interface AnimeRecommendation {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  categorieAnime: string | null;
  langueAnime: string | null;
}

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  admin?: boolean;
}

type BaseAnime = {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  categories: string[];
  langues: string[];
};

export default function RecommandationsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [animes, setAnimes] = useState<BaseAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    if (status === "loading") return;

    const fetchAnimes = async () => {
      try {
        setLoading(true);
        const offset = 0;
        const user = session?.user as ExtendedUser | undefined;

        let res: Response;

        if (user?.id) {
          res = await fetch("/api/user/recommandation/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ limit, offset }),
          });
        } else {
          const likedAnimesRaw = localStorage.getItem("likedAnimes");
          const likedAnimes = likedAnimesRaw ? JSON.parse(likedAnimesRaw) : [];

          res = await fetch("/api/guest/recommandation/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ likedAnimes, limit, offset }),
          });
        }

        const encoding = res.headers.get("Content-Encoding");

        let data;
        if (encoding === "gzip") {
          const compressed = await res.arrayBuffer();
          const decompressed = new TextDecoder().decode(new Uint8Array(compressed));
          data = JSON.parse(decompressed);
        } else {
          data = await res.json();
        }

        if (Array.isArray(data)) {
          const parsedData: BaseAnime[] = data.map((item: AnimeRecommendation) => ({
            nomAnime: item.nomAnime,
            nomAnimeURL: item.nomAnimeURL,
            afficheAnime: item.afficheAnime,
            categories: item.categorieAnime?.split(", ") || [],
            langues: item.langueAnime?.split(", ") || [],
          }));

          setAnimes(parsedData);
        } else {
          console.error("Format de réponse inattendu :", data);
          setAnimes([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des recommandations :", error);
        setAnimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [session, status]);

  return (
    <Container
      maxWidth="xl"
      sx={{
        pt: 4,
        pb: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: "white",
          fontWeight: "bold",
          mb: 4,
          textAlign: "center",
          fontSize: { xs: "1.6rem", sm: "1.8rem", md: "2.2rem" },
        }}
      >
        Recommandations
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {animes.map((anime, index) => (
          <Grid
            item
            key={`${anime.nomAnimeURL}-${index}`}
            xs={6}
            sm={4}
            md={3.5}
            lg={2.4}
            xl={1.6}
          >
            <AnimeCard
              anime={anime}
              onClick={() => router.push(`/player/${anime.nomAnimeURL}`)}
            />
          </Grid>
        ))}

        {loading && (
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  border: "4px solid rgba(255, 255, 255, 0)",
                  borderTop: "4px solid rgb(126 34 206)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style jsx global>{`
                @keyframes spin {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </Box>
          </Grid>
        )}

        {!loading && animes.length === 0 && (
          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{
                color: "gray",
                textAlign: "center",
                mt: 6,
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
              }}
            >
              Aucune recommandation disponible pour le moment.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
