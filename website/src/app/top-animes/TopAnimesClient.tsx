"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Grid, Container, Typography, Box } from "@mui/material";
import AnimeCard from "@/components/AnimeCard";

interface Anime {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  categories: string[];
  langues: string[];
}

export default function TopAnimesClient() {
  const router = useRouter();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const limit = 30;

  const fetchAnimes = useCallback(() => {
    if (!hasMore || isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    fetch(`/api/anime/mostlike?limit=${limit}&offset=${offset}`)
      .then(async (res) => {
        if (res.status === 204) return [];
        return await res.json();
      })
      .then((data: Anime[]) => {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setAnimes((prev) => [...prev, ...data]);
          setOffset((prev) => prev + limit);
        }
        isFetching.current = false;
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des animes :", error);
        setLoading(false);
        isFetching.current = false;
      });
  }, [offset, hasMore]);

  useEffect(() => {
    fetchAnimes();
  }, []);

  const triggerElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetching.current) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchAnimes();
          }
        },
        { threshold: 0.5, rootMargin: "600px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [fetchAnimes, hasMore]
  );

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
        Top Animes
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {animes.map((anime, index) => {
          const isTriggerElement =
            index === animes.length - 5 || index === animes.length - 1;

          return (
            <Grid
              item
              key={`${anime.nomAnimeURL}-${index}`}
              xs={6}
              sm={4}
              md={3.5}
              lg={2.4}
              xl={1.6}
              ref={isTriggerElement ? triggerElementRef : null}
            >
              <AnimeCard
                anime={anime}
                onClick={() => router.push(`/player/${anime.nomAnimeURL}`)}
              />
            </Grid>
          );
        })}

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
              Aucun anime trouvé dans le top actuellement.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
