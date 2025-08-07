"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Grid, Menu, MenuItem } from "@mui/material";
import AnimeCard from "@/components/AnimeCard";

interface Anime {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  categorieAnime: string;
  langueAnime: string;
  subnames: string[];
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

export default function RecommandationsAccueil({ animes: initialAnimes }: { animes?: Anime[] }) {
  const { data: session } = useSession();
  const [animes, setAnimes] = useState<Anime[]>(initialAnimes || []);
  const [loading, setLoading] = useState(!initialAnimes);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAnime, setSelectedAnime] = useState<BaseAnime | null>(null);
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  const router = useRouter();
  const firstRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialAnimes) return;

    const fetchAnimes = async () => {
      try {
        setLoading(true);
        const limit = 10;
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
          const animeLikesRaw = localStorage.getItem("likedAnimes");
          const animeLikes = animeLikesRaw ? JSON.parse(animeLikesRaw) : [];

          res = await fetch("/api/guest/recommandation/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              likedAnimes: animeLikes,
              limit,
              offset,
            }),
          });
        }

        const encoding = res.headers.get("Content-Encoding");
        let data;

        if (encoding === "gzip") {
          const compressed = await res.arrayBuffer();
          const decompressed = new TextDecoder().decode(
            new Uint8Array(compressed)
          );
          data = JSON.parse(decompressed);
        } else {
          data = await res.json();
        }

        if (Array.isArray(data)) {
          setAnimes(data);
        } else {
          console.error("Format de réponse inattendu :", data);
          setAnimes([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l’historique :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [session, initialAnimes]);

  useEffect(() => {
    if (!firstRowRef.current) return;

    const observer = new ResizeObserver(() => {
      if (firstRowRef.current) {
        setRowHeight(firstRowRef.current.clientHeight);
      }
    });

    observer.observe(firstRowRef.current);

    return () => observer.disconnect();
  }, [animes, loading]);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    anime: BaseAnime
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAnime(anime);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedAnime(null);
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden", mt: 3 }}>
      <Box
        sx={{
          overflow: "hidden",
          maxHeight: rowHeight ? `${rowHeight - 2}px` : "auto",
          transition: "max-height 0.3s ease",
        }}
      >
        <Grid container spacing={2} justifyContent="flex-start">
          {loading
            ? Array.from({ length: 2 }).map((_, index) => (
                <Grid
                  item
                  key={index}
                  xs={6}
                  sm={4}
                  md={3.5}
                  lg={2.4}
                  xl={1.6}
                  ref={index === 0 ? firstRowRef : undefined}
                >
                  <AnimeCard
                    loading
                    refProp={index === 0 ? firstRowRef : undefined}
                  />
                </Grid>
              ))
            : animes.map((anime, index) => {
                const triggerIndex =
                  animes.length > 5 ? animes.length - 5 : animes.length - 1;
                const isTriggerElement = index === triggerIndex;

                const baseAnime: BaseAnime = {
                  nomAnime: anime.nomAnime,
                  nomAnimeURL: anime.nomAnimeURL,
                  afficheAnime: anime.afficheAnime,
                  categories: [anime.categorieAnime],
                  langues: [anime.langueAnime],
                };

                return (
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
                      anime={baseAnime}
                      refProp={isTriggerElement ? firstRowRef : undefined}
                      onClick={() =>
                        router.push(`/player/${anime.nomAnimeURL}`)
                      }
                      onMenuClick={(event) => handleOpenMenu(event, baseAnime)}
                    />
                  </Grid>
                );
              })}
        </Grid>
      </Box>
    </Box>
  );
}
