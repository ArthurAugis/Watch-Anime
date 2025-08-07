"use client";

import { useState, useEffect } from "react";
import MostLikeAccueil from "@/components/MostLikeAccueil";
import RecentUpdateAccueil from "@/components/RecentUpdateAccueil";
import HistoryAccueil from "@/components/HistoryAccueil";
import RecommandationsAccueil from "@/components/RecommandationAccueil";
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const slides = [
  {
    title: "Ublock Origin",
    description:
      "Pour une meilleure expérience, installe Ublock Origin pour bloquer les pubs et popups pendant le visionnage des animés.",
    image: "/ublock.webp",
    buttonText: "Tutoriel pour installer Ublock Origin",
    buttonLink: "/ublock",
  },
  {
    title: "Serveur Discord",
    description:
      "Rejoins notre serveur Discord pour les dernières infos sur Watch-Anime et discuter avec la communauté.",
    image: "/discord.webp",
    buttonText: "Rejoindre le serveur Discord",
    buttonLink: "https://discord.com/invite/zX5ucDU5zn",
  },
  {
    title: "PreMid",
    description:
      "Télécharge l'extension PreMid pour afficher sur Discord l'anime que tu regardes, avec le nom, la saison, l'épisode et la langue.",
    image: "/premid.webp",
    buttonText: "Installer l'extension PreMid",
    buttonLink: "https://premid.app/store/presences/Watch-Anime",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [historyHasContent, setHistoryHasContent] = useState(false);
  const [mostLikeHasContent, setMostLikeHasContent] = useState(false);
  const [recentUpdateHasContent, setRecentUpdateHasContent] = useState(false);
  const [recommandationHasContent, setRecommandationHasContent] = useState(false);

  const [historyAnimes, setHistoryAnimes] = useState<any[]>([]);
  const [recommandationAnimes, setRecommandationAnimes] = useState<any[]>([]);
  const [mostLikeAnimes, setMostLikeAnimes] = useState<any[]>([]);
  const [recentUpdateAnimes, setRecentUpdateAnimes] = useState<any[]>([]);

  const { data: session } = useSession();

  useEffect(() => {
    let isMounted = true;
    const preload = async () => {
      try {
        const user = session?.user as { id?: string } | undefined;

        const historyFetch = async () => {
          if (user?.id) {
            return fetch("/api/user/history/list", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ limit: 10, offset: 0 }),
            });
          } else {
            const animeHistoryRaw = localStorage.getItem("animeHistory");
            const animeHistory = animeHistoryRaw
              ? JSON.parse(animeHistoryRaw)
              : [];

            return fetch("/api/guest/history/list", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ animeHistory, limit: 10, offset: 0 }),
            });
          }
        };

        const recommandationFetch = async () => {
          if (user?.id) {
            return fetch("/api/user/recommandation/list", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ limit: 10, offset: 0 }),
            });
          } else {
            const animeLikesRaw = localStorage.getItem("likedAnimes");
            const animeLikes = animeLikesRaw
              ? JSON.parse(animeLikesRaw)
              : [];

            return fetch("/api/guest/recommandation/list", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                likedAnimes: animeLikes,
                limit: 10,
                offset: 0,
              }),
            });
          }
        };

        const [historyRes, recommandationRes, mostLikeRes, recentUpdateRes] =
          await Promise.all([
            historyFetch(),
            recommandationFetch(),
            fetch("/api/anime/mostlike?limit=10&offset=0"),
            fetch("/api/anime/recentupdate?limit=10&offset=0"),
          ]);

        const parseJSON = async (res: Response) => {
          if (!res.ok) return null;
          if (res.status === 204 || res.headers.get("Content-Length") === "0") {
            return null;
          }
          return res.json();
        };

        const [
          historyData,
          recommandationData,
          mostLikeData,
          recentUpdateData,
        ] = await Promise.all([
          parseJSON(historyRes),
          parseJSON(recommandationRes),
          parseJSON(mostLikeRes),
          parseJSON(recentUpdateRes),
        ]);

        if (!isMounted) return;

        setHistoryHasContent(Array.isArray(historyData) && historyData.length > 0);
        setRecommandationHasContent(Array.isArray(recommandationData) && recommandationData.length > 0);
        setMostLikeHasContent(Array.isArray(mostLikeData) && mostLikeData.length > 0);
        setRecentUpdateHasContent(Array.isArray(recentUpdateData) && recentUpdateData.length > 0);

        setHistoryAnimes(Array.isArray(historyData) ? historyData : []);
        setRecommandationAnimes(Array.isArray(recommandationData) ? recommandationData : []);
        setMostLikeAnimes(Array.isArray(mostLikeData) ? mostLikeData : []);
        setRecentUpdateAnimes(Array.isArray(recentUpdateData) ? recentUpdateData : []);
      } catch (error) {
        console.error("Erreur de préchargement :", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    preload();
    return () => { isMounted = false; };
  }, [session]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "rgb(126 34 206)" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: "100%",
      }}
    >
      {/* CAROUSEL */}
      <Box
        sx={{
          width: { xs: "95%", md: "80%" },
          mx: "auto",
          overflow: "hidden",
          backgroundColor: "#0f0e13",
          borderRadius: 3,
          position: "relative",
        }}
      >
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={5000}
          emulateTouch
          showArrows={false}
          renderIndicator={(onClickHandler, isSelected, index, label) => (
            <span
              key={index}
              onClick={onClickHandler}
              onKeyDown={onClickHandler}
              role="button"
              tabIndex={0}
              aria-label={label}
              style={{
                width: "12px",
                height: "12px",
                margin: "0 6px",
                backgroundColor: isSelected ? "white" : "#555",
                borderRadius: "50%",
                display: "inline-block",
                cursor: "pointer",
              }}
            />
          )}
        >
          {slides.map((slide) => (
            <Box
              key={slide.title}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 2, md: 4 },
                width: "100%",
                minHeight: "250px",
                px: { xs: 3, md: 6 },
                py: { xs: 3, md: 3 },
                backgroundColor: "#0f0e13",
                color: "white",
                borderRadius: 3,
                pb: { xs: 6, md: 3 },
              }}
            >
              <Box
                sx={{
                  width: { xs: "80px", md: "120px" },
                  height: { xs: "80px", md: "120px" },
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  style={{ objectFit: "contain", borderRadius: "8px" }}
                  sizes="(max-width: 768px) 80px, 120px"
                  priority={false}
                />
              </Box>

              <Container
                sx={{
                  flexGrow: 1,
                  textAlign: { xs: "center", md: "left" },
                  maxWidth: "800px",
                  p: 0,
                  width: "100%",
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {slide.title}
                </Typography>
                <Typography>{slide.description}</Typography>
                {slide.buttonLink.startsWith("/") ? (
                  <Link href={slide.buttonLink} passHref legacyBehavior>
                    <Button
                      variant="contained"
                      sx={{
                        mt: 2,
                        backgroundColor: "rgb(126 34 206)",
                        color: "white",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "rgb(109, 29, 178)",
                        },
                      }}
                    >
                      {slide.buttonText}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "rgb(126 34 206)",
                      color: "white",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgb(109, 29, 178)",
                      },
                    }}
                    href={slide.buttonLink}
                    target="_blank"
                  >
                    {slide.buttonText}
                  </Button>
                )}
              </Container>
            </Box>
          ))}
        </Carousel>
      </Box>

      {/* Sections conditionnelles */}
      {historyHasContent && (
        <SectionContainer title="Historique" link="/history">
          <HistoryAccueil animes={historyAnimes} />
        </SectionContainer>
      )}
      {recommandationHasContent && (
        <SectionContainer title="Recommandations" link="/recommandations">
          <RecommandationsAccueil animes={recommandationAnimes} />
        </SectionContainer>
      )}
      {mostLikeHasContent && (
        <SectionContainer
          title="Top animés selon nos utilisateurs"
          link="/top-animes"
        >
          <MostLikeAccueil animes={mostLikeAnimes} />
        </SectionContainer>
      )}
      {recentUpdateHasContent && (
        <SectionContainer title="Récemment mis à jour" link="/recent-update">
          <RecentUpdateAccueil animes={recentUpdateAnimes} />
        </SectionContainer>
      )}
    </Box>
  );
}

function SectionContainer({
  title,
  link,
  children,
}: {
  title: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        width: { xs: "95%", md: "80%" },
        color: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            color: "white",
            position: "relative",
            display: "inline-block",
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "2rem" },
          }}
        >
          {title}
        </Typography>
        <Link href={link} passHref legacyBehavior>
          <Typography
            variant="body2"
            component="a"
            sx={{
              color: "rgb(126 34 206)",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Voir plus
          </Typography>
        </Link>
      </Box>
      {children}
    </Box>
  );
}
