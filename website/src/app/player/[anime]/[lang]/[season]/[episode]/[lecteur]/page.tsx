"use client";

import { FC, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WatchLaterIcon from "@mui/icons-material/WatchLater";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  admin?: boolean;
}

interface Anime {
  url_video: string;
  nom_anime: string;
  description_anime: string;
  nom_langue: string;
  nom_saison: string;
  nom_episode: string;
}

interface AnimeHistoryEntry {
  nom_anime: string;
  nom_langue: string;
  nom_saison: string;
  nom_episode: string;
}

interface Saison {
  nom_saison: string;
  nom_saison_url: string;
}

interface Episode {
  nom_episode: string;
  nom_episode_url: string;
}

const updateLocalStorageArray = (
  key: string,
  value: string,
  action: "add" | "remove"
) => {
  const raw = localStorage.getItem(key);
  let arr = raw ? JSON.parse(raw) : [];

  if (action === "add" && !arr.includes(value)) arr.push(value);
  if (action === "remove") arr = arr.filter((item: string) => item !== value);

  localStorage.setItem(key, JSON.stringify(arr));
  return arr;
};

const getLocalStorageArray = (key: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const PlayerClient: FC = () => {
  const params = useParams();
  const pathname = usePathname();

  const { anime, lang, season, episode, lecteur } = params as {
    anime: string;
    lang: string;
    season: string;
    episode: string;
    lecteur: string;
  };

  const lecteurId = lecteur.startsWith("Lecteur-") ? lecteur.replace("Lecteur-", "") : lecteur;

  const { data: session } = useSession();

  const [animeData, setAnimeData] = useState<Anime | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatchLatered, setIsWatchLatered] = useState(false);

  const [selectedTab, setSelectedTab] = useState<
    "langues" | "saisons" | "episodes" | "lecteurs"
  >("langues");
  const [langues, setLangues] = useState<string[]>([]);
  const [saisons, setSaisons] = useState<Saison[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [lecteurs, setLecteurs] = useState<{ nom_lecteur: string }[]>([]);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(
          `/api/anime/info?anime=${anime}&lang=${lang}&season=${season}&episode=${episode}&lecteur=${lecteurId}`,
          { headers: { "Accept-Encoding": "gzip" } }
        );

        const data = await res.json();

        document.title = `${data.nom_anime} | Watch-Anime`;

        let descriptionTag = document.querySelector("meta[name='description']");
        if (descriptionTag) {
          descriptionTag.setAttribute("content", data.description_anime);
        } else {
          const meta = document.createElement("meta");
          meta.name = "description";
          meta.content = data.description_anime;
          document.head.appendChild(meta);
        }

        let robotsTag = document.querySelector("meta[name='robots']");
        if (robotsTag) {
          robotsTag.setAttribute("content", "noindex, nofollow");
        } else {
          const robotsMeta = document.createElement("meta");
          robotsMeta.name = "robots";
          robotsMeta.content = "noindex, nofollow";
          document.head.appendChild(robotsMeta);
        }

        if (data.error) {
          const newUrl = `/player/${anime}/${lang}/${season}`;
          window.location.href = newUrl;
        }

        setAnimeData(data);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        setError("Erreur lors du chargement.");
      }
    };

    const fetchExtras = async () => {
      try {
        const [langRes, saisonsRes, episodesRes] = await Promise.all([
          fetch(
            `/api/anime/episodes/langues?anime=${anime}&season=${season}&episode=${episode}`
          ),
          fetch(`/api/anime/saisons?anime=${anime}&langue=${lang}`),
          fetch(
            `/api/anime/episodes?anime=${anime}&langue=${lang}&season=${season}`
          ),
        ]);

        const [langData, saisonData, episodeData] = await Promise.all([
          langRes.json(),
          saisonsRes.json(),
          episodesRes.json(),
        ]);

        setLangues(langData.map((l: any) => l.nom_langue));
        setSaisons(
          saisonData.map((s: any) => ({
            nom_saison: s.nom_saison,
            nom_saison_url: s.nom_saison_url,
          }))
        );
        setEpisodes(
          episodeData.map((e: any) => ({
            nom_episode: e.nom_episode,
            nom_episode_url: e.nom_episode_url,
          }))
        );
      } catch (err) {
        console.error(
          "Erreur de chargement des données supplémentaires :",
          err
        );
      }
    };

    fetchAnime();
    fetchExtras();
  }, [anime, lang, season, episode]);

  useEffect(() => {
    const fetchLikeState = async () => {
      if (!animeData) return;

      if (session?.user) {
        const user = session.user as ExtendedUser;
        try {
          const res = await fetch("/api/user/like/has", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ animeId: anime }),
          });
          const data = await res.json();
          if (res.ok) setIsLiked(data.liked);
        } catch (err) {
          console.error("Erreur lors de la récupération du like :", err);
        }
      } else {
        const likes = getLocalStorageArray("likedAnimes");
        const isInLocal = likes.includes(anime);
        setIsLiked(isInLocal);
      }
    };

    fetchLikeState();
  }, [session, animeData]);

  useEffect(() => {
    const fetchWatchLaterState = async () => {
      if (!animeData) return;

      if (session?.user) {
        const user = session.user as ExtendedUser;
        try {
          const res = await fetch("/api/user/watchlater/has", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              animeId: anime,
            }),
          });

          const data = await res.json();

          if (res.ok) {
            setIsWatchLatered(data.watchlatered);
          } else {
            console.error("Erreur API haswatchlater :", data.error);
          }
        } catch (err) {
          console.error("Erreur API haswatchlater :", err);
        }
      } else {
        const stored = getLocalStorageArray("watchLater");
        const isIn = stored.includes(anime);
        setIsWatchLatered(isIn);
      }
    };

    fetchWatchLaterState();
  }, [session, animeData]);

  const toggleWatchLater = async () => {
    if (!animeData) return;

    if (session?.user) {
      const user = session.user as ExtendedUser;
      try {
        const res = await fetch("/api/user/watchlater/change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anime }),
        });
        const data = await res.json();
        if (res.ok) {
          setIsWatchLatered(data.waterlatered);
        }
      } catch (err) {
        console.error("Erreur API changewatchlaterstate :", err);
      }
    } else {
      const stored = getLocalStorageArray("watchLater");
      const alreadyIn = stored.includes(anime);

      if (alreadyIn) {
        updateLocalStorageArray("watchLater", anime, "remove");
        setIsWatchLatered(false);
      } else {
        updateLocalStorageArray("watchLater", anime, "add");
        setIsWatchLatered(true);
      }
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = animeData?.nom_anime || "Regarde cet anime";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Regarde "${title}" sur notre site !`,
          url,
        });
      } catch (error) {
        console.error("Erreur lors du partage :", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Lien copié dans le presse-papier !");
      } catch (error) {
        console.error("Erreur lors de la copie du lien :", error);
      }
    }
  };

  const saveHistoryForGuest = () => {
    if (!animeData) return;

    const newEntry: AnimeHistoryEntry = {
      nom_anime: anime,
      nom_langue: lang,
      nom_saison: season,
      nom_episode: episode,
    };

    try {
      const storedHistory = localStorage.getItem("animeHistory");
      let history: AnimeHistoryEntry[] = storedHistory
        ? JSON.parse(storedHistory)
        : [];

      history = history.filter(
        (entry) =>
          !(
            entry.nom_anime === newEntry.nom_anime &&
            entry.nom_langue === newEntry.nom_langue &&
            entry.nom_saison === newEntry.nom_saison &&
            entry.nom_episode === newEntry.nom_episode
          )
      );

      history.push(newEntry);
      localStorage.setItem("animeHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'historique :", error);
    }
  };

  const saveHistoryForUser = async () => {
    try {
      const user = session?.user as ExtendedUser;
      if (!user) return;

      await fetch("/api/user/history/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anime,
          lang,
          season,
          episode,
        }),
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout à l'historique :", err);
    }
  };

  useEffect(() => {
    if (hasInteracted) return;

    const handleBlur = () => {
      if (hasInteracted) return;

      if (session?.user) {
        saveHistoryForUser();
      } else {
        saveHistoryForGuest();
      }

      setHasInteracted(true);
      window.removeEventListener("blur", handleBlur);
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [hasInteracted, animeData, session]);

  useEffect(() => {
    const fetchLecteurs = async () => {
      try {
        const res = await fetch(`/api/anime/lecteurs?anime=${anime}&lang=${lang}&season=${season}&episode=${episode}`);
        const data = await res.json();
        setLecteurs(data || []);
      } catch (e) {
        setLecteurs([]);
      }
    };
    fetchLecteurs();
  }, [anime, lang, season, episode]);

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "5rem" }}>
        <h2>{error}</h2>
      </div>
    );
  }

  if (!animeData) return null;

  const currentIndex = episodes.findIndex((e) => e.nom_episode_url === episode);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  const tabStyle = (tab: string) => ({
    color: selectedTab === tab ? "rgb(126 34 206)" : "#fff",
    padding: "6px 2px",
    borderBottom: selectedTab === tab ? "3px solid rgb(126 34 206)" : "none",
    fontSize: "1.1rem",
    fontWeight: 600,
    margin: "0 8px",
    transition: "all 0.2s ease",
  });

  const linkStyle = (href: string, value: string, type: "langues" | "saisons" | "episodes") => {
    let isActive = false;
    if (type === "langues") {
      isActive = normalize(lang) === normalize(value);
    } else if (type === "saisons") {
      isActive = normalize(season) === normalize(value);
    } else if (type === "episodes") {
      isActive = normalize(episode) === normalize(value);
    }
    return {
      color: isActive ? "rgb(126 34 206)" : "#fff",
      fontWeight: "bold",
      textDecoration: "none",
    };
  };

  const renderTabContent = () => {
    const listStyle = {
      fontSize: "1.1rem",
      lineHeight: "2.2rem",
      listStyle: "none",
    };

    switch (selectedTab) {
      case "langues":
        return (
          <ul style={listStyle}>
            {langues.map((l, i) => {
              const href = `/player/${anime}/${l}/${season}/${episode}`;
              return (
                <li key={i}>
                  <Link href={href} style={linkStyle(href, l, "langues")}>
                    {l}
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      case "saisons":
        return (
          <ul style={listStyle}>
            {saisons.map((s, i) => {
              const href = `/player/${anime}/${lang}/${s.nom_saison_url}`;
              return (
                <li key={i}>
                  <Link href={href} style={linkStyle(href, s.nom_saison_url, "saisons")}>
                    {s.nom_saison}
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      case "episodes":
        return (
          <ul style={listStyle}>
            {episodes.map((e, i) => {
              const href = `/player/${anime}/${lang}/${season}/${e.nom_episode_url}`;
              return (
                <li key={i}>
                  <Link href={href} style={linkStyle(href, e.nom_episode_url, "episodes")}>
                    {e.nom_episode}
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      case "lecteurs":
        return (
          <ul style={{ fontSize: "1.1rem", lineHeight: "2.2rem", listStyle: "none" }}>
            {lecteurs.map((lecteur, i) => {
              const href = `/player/${anime}/${lang}/${season}/${episode}/Lecteur-${lecteur.nom_lecteur}`;
              const isActive = normalize(lecteur.nom_lecteur) === normalize(lecteurId);
              return (
                <li key={i}>
                  <Link
                    href={href}
                    style={{
                      color: isActive ? "rgb(126 34 206)" : "#fff",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    Lecteur {lecteur.nom_lecteur}
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        padding: "10px",
        width: { xs: "100%", md: "60vw" },
        margin: "0 auto",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ fontSize: "2em", fontWeight: "800" }}>
          {animeData.nom_anime}
        </h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Tooltip title="Partager">
            <IconButton onClick={handleShare} sx={{ color: "#fff" }}>
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="À regarder plus tard">
            <IconButton onClick={toggleWatchLater} sx={{ color: "#fff" }}>
              <WatchLaterIcon
                sx={{ color: isWatchLatered ? "rgb(255, 215, 0)" : "#fff" }}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="J'aime">
            <IconButton
              onClick={async () => {
                if (session?.user) {
                  const user = session.user as ExtendedUser;
                  try {
                    const res = await fetch("/api/user/like/change", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ anime }),
                    });
                    const data = await res.json();
                    if (res.ok) setIsLiked(data.liked);
                  } catch (err) {
                    console.error("Erreur API changelikestate :", err);
                  }
                } else {
                  const stored = getLocalStorageArray("likedAnimes");
                  const already = stored.includes(anime);

                  if (already) {
                    updateLocalStorageArray("likedAnimes", anime, "remove");
                    setIsLiked(false);
                  } else {
                    updateLocalStorageArray("likedAnimes", anime, "add");
                    setIsLiked(true);
                  }
                }
              }}
              sx={{ color: "#fff" }}
            >
              {isLiked ? (
                <FavoriteIcon sx={{ color: "rgb(255, 64, 129)" }} />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <p style={{ fontSize: "1rem", lineHeight: "1.6", marginTop: "0.5rem" }}>
        {animeData.description_anime}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "1.5rem 0",
        }}
      >
        {prevEpisode ? (
          <Link
            href={`/player/${anime}/${lang}/${season}/${prevEpisode.nom_episode_url}`}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "rgb(126 34 206)",
                color: "#fff",
                "&:hover": { backgroundColor: "rgb(106, 24, 186)" },
              }}
            >
              ← Épisode précédent
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextEpisode ? (
          <Link
            href={`/player/${anime}/${lang}/${season}/${nextEpisode.nom_episode_url}`}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "rgb(126 34 206)",
                color: "#fff",
                "&:hover": { backgroundColor: "rgb(106, 24, 186)" },
              }}
            >
              Épisode suivant →
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div
        style={{
          marginTop: "2rem",
          position: "relative",
          paddingTop: "56.25%",
          width: "100%",
          height: 0,
        }}
      >
        <iframe
          src={animeData.url_video}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allowFullScreen
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          marginTop: "2rem",
          marginBottom: "1rem",
          cursor: "pointer",
        }}
      >
        <h2
          style={tabStyle("langues")}
          onClick={() => setSelectedTab("langues")}
        >
          Langues
        </h2>
        <h2
          style={tabStyle("saisons")}
          onClick={() => setSelectedTab("saisons")}
        >
          Saisons
        </h2>
        <h2
          style={tabStyle("episodes")}
          onClick={() => setSelectedTab("episodes")}
        >
          Episodes
        </h2>
        <h2
          style={tabStyle("lecteurs")}
          onClick={() => setSelectedTab("lecteurs")}
        >
          Lecteurs
        </h2>
      </div>

      <div>{renderTabContent()}</div>
    </Box>
  );
};

const DynamicPlayerClient = dynamic(() => Promise.resolve(PlayerClient), {
  ssr: false,
});

export default DynamicPlayerClient;

function normalize(str: string) {
  try {
    return decodeURIComponent(str).toLowerCase().replace(/\s+/g, " ").trim();
  } catch {
    return str.toLowerCase().replace(/\s+/g, " ").trim();
  }
}
