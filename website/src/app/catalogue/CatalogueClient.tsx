"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Grid,
  Container,
  Box,
  TextField,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import AnimeCard from "@/components/AnimeCard";

interface Anime {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  saisonsAnime: number;
  episodesAnime: number;
  categories: string[];
  langues: string[];
  subnames: string[];
}

const filtersList = [
  { label: "VOSTFR", value: "vostfr" },
  { label: "VF", value: "vf" },
  { label: "Action", value: "action" },
  { label: "Aventure", value: "aventure" },
  { label: "Combats", value: "combats" },
  { label: "Comédie", value: "comédie" },
  { label: "Drame", value: "drame" },
  { label: "Ecchi", value: "ecchi" },
  { label: "School-Life", value: "school-life" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Horreur", value: "horreur" },
  { label: "Isekai", value: "isekai" },
  { label: "Josei", value: "josei" },
  { label: "Mystère", value: "mystère" },
  { label: "Psychologique", value: "psychologique" },
  { label: "Quotidien", value: "quotidien" },
  { label: "Romance", value: "romance" },
  { label: "Seinen", value: "seinen" },
  { label: "Shônen", value: "shônen" },
  { label: "Shôjo", value: "shôjo" },
  { label: "Sports", value: "sports" },
  { label: "Surnaturel", value: "surnaturel" },
  { label: "Tournois", value: "tournois" },
];

export default function CatalogueClient() {
  const router = useRouter();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const isFetching = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const limit = 52;

  const fetchAnimes = useCallback(() => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    const filterParams = selectedFilters.join(",");

    fetch(
      `/api/anime/list?limit=${limit}&offset=${offset}&search=${debouncedSearch}&filters=${filterParams}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setAnimes((prev) => (offset === 0 ? data : [...prev, ...data]));
          setOffset((prev) => prev + limit);
        }
        setLoading(false);
        isFetching.current = false;
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des animes :", err);
        setLoading(false);
        isFetching.current = false;
      });
  }, [hasMore, offset, debouncedSearch, selectedFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== debouncedSearch) {
        setDebouncedSearch(searchQuery);
        setOffset(0);
        setAnimes([]);
        setHasMore(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchAnimes();
  }, [debouncedSearch, selectedFilters]);

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
        { threshold: 0.2, rootMargin: "1000px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [fetchAnimes, hasMore]
  );

  const handleFilterChange = (value: string) => {
    setSelectedFilters((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    setOffset(0);
    setAnimes([]);
    setHasMore(true);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        width: { xs: "100%", md: "90%" },
        margin: "auto",
        padding: "20px",
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher un anime..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 2,
          mt: 2,
          backgroundColor: "white",
          borderRadius: "5px",
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: "1.5rem" }} />
            </InputAdornment>
          ),
        }}
      />

      <Button
        fullWidth
        onClick={() => setShowAllFilters((prev) => !prev)}
        sx={{
          mb: 2,
          backgroundColor: "rgb(126 34 206 / 1)",
          color: "white",
          fontWeight: "bold",
          textTransform: "none",
          borderRadius: "5px",
        }}
      >
        Recherche Avancée
        <ExpandMoreIcon
          sx={{
            marginLeft: 1,
            transition: "transform 0.3s",
            transform: showAllFilters ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </Button>

      <Collapse in={showAllFilters}>
        <FormGroup row sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
          {filtersList.map((filter) => (
            <FormControlLabel
              key={filter.value}
              control={
                <Checkbox
                  checked={selectedFilters.includes(filter.value)}
                  onChange={() => handleFilterChange(filter.value)}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "rgb(126 34 206 / 1)",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "white" }}>
                  {filter.label}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Collapse>

      <Grid container spacing={2} justifyContent="center">
        {animes.map((anime, index) => {
          const triggerIndex =
            animes.length > 5 ? animes.length - 5 : animes.length - 1;
          const isTriggerElement = index === triggerIndex;

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
                anime={anime}
                onClick={() => router.push(`/player/${anime.nomAnimeURL}`)}
                refProp={isTriggerElement ? { current: null } : undefined}
              />
              {isTriggerElement && (
                <div ref={triggerElementRef} style={{ height: 1 }} />
              )}
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
      </Grid>
    </Container>
  );
}
