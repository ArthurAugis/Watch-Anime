"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import PaletteIcon from "@mui/icons-material/Palette";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HomeIcon from "@mui/icons-material/Home";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import InfoIcon from '@mui/icons-material/Info';

export default function Navbar() {

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

  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | "submenu" | "info" | "search">(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setOpenMenu(null);
  };

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOpen) setIsOpen(true);
    setOpenMenu(openMenu === "submenu" ? null : "submenu");
  };

  const toggleInfoMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOpen) setIsOpen(true);
    setOpenMenu(openMenu === "info" ? null : "info");
  };

  const toggleSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOpen) setIsOpen(true);
    setOpenMenu("search");
  };

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      fetch(`/api/anime/list?limit=3&offset=0&search=${debouncedSearch}`)
        .then((res) => res.json())
        .then((data: Anime[]) => {
          setSearchResults(data.slice(0, 3));
        })
        .catch((error) => {
          console.error("Error fetching anime data:", error);
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
  };

  const handleBlur = () => {
    if (searchQuery.trim() === "") {
      setOpenMenu(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        event.target instanceof Node &&
        !document.getElementById("navbar")?.contains(event.target)
      ) {
        setIsOpen(false);
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <Box
      id="navbar"
      component="nav"
      sx={{
        position: "fixed",
        zIndex: 1000,
        top: 0,
        left: 0,
        height: "100vh",
        backgroundColor: "#0f0e13",
        padding: "10px",
        boxSizing: "border-box",
        overflow: "hidden",
        overflowY: "auto",
        transition: "width 0.3s",
        width: isOpen ? "250px" : "60px",
        "@media (max-width: 768px)": {
          width: isOpen ? "100vw" : "60px",
        },
      }}
    >
        {isOpen ? (
          <CloseIcon sx={{ color: "white", cursor: "pointer" }} style={{
            display: "flex",
            alignItems: "center",
            margin: "10px",
          }}
          onClick={toggleSidebar} />
        ) : (
          <MenuIcon sx={{ color: "white", cursor: "pointer" }}  style={{
            display: "flex",
            alignItems: "center",
            margin: "10px",
          }}
          onClick={toggleSidebar} />
        )}

      <Link href="/" style={{ textDecoration: "none" }}>
        {isOpen ? (
          <h2
            style={{
              fontWeight: "900",
              fontSize: "24px",
              textAlign: "center",
              margin: "10px 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              opacity: 1,
              transition: "opacity 0.3s",
              background: "linear-gradient(to right, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Watch-Anime
          </h2>
        ) : (
          <div
            style={{
              textAlign: "center",
              margin: "10px 0",
              marginLeft: "4px",
            }}
          >
            <HomeIcon sx={{ color: "white" }} />
          </div>
        )}
      </Link>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li>
          <Link
            href="/catalogue"
            style={{
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              padding: "10px",
              borderRadius: "5px",
              transition: "background-color 0.3s",
            }}
          >
            <LocalMoviesIcon sx={{ marginRight: "10px", minWidth: "20px" }} />
            <span
              style={{ opacity: isOpen ? 1 : 0, transition: "opacity 0.3s" }}
            >
              Catalogue
            </span>
          </Link>
        </li>

        <li>
          <a
            href="#"
            onClick={toggleSubmenu}
            style={{
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <PaletteIcon sx={{ marginRight: "10px", minWidth: "20px" }} />
              <span
                style={{ opacity: isOpen ? 1 : 0, transition: "opacity 0.3s" }}
              >
                Personnalisation
              </span>
            </div>
            {isOpen && (
              <KeyboardArrowDownIcon
                sx={{
                  transform: openMenu === "submenu" ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  opacity: isOpen ? 1 : 0,
                }}
              />
            )}
          </a>
          <ul
            style={{
              listStyle: "none",
              paddingLeft: "20px",
              overflow: "hidden",
              maxHeight: openMenu === "submenu" ? "500px" : "0",
              opacity: openMenu === "submenu" ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
            }}
          >
            {[
              { text: "Liste des likes", path: "/likes" },
              { text: "Liste des à regarder", path: "/watchlater" },
              { text: session ? "Profile" : "Se connecter", path: session ? "/settings" : "/login" },
            ].map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  style={{
                    color: "white",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    borderRadius: "5px",
                  }}
                >
                  {
                    [
                      <FavoriteIcon
                        key="favorite"
                        sx={{ marginRight: "10px", minWidth: "20px" }}
                      />,
                      <VisibilityIcon
                        key="visibility"
                        sx={{ marginRight: "10px", minWidth: "20px" }}
                      />,
                      <PersonIcon
                        key="person"
                        sx={{ marginRight: "10px", minWidth: "20px" }}
                      />,
                    ][index]
                  }
                  <span style={{ opacity: isOpen ? 1 : 0 }}>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </li>

        <li>
          <a
            href="#"
            onClick={toggleInfoMenu}
            style={{
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <InfoIcon sx={{ marginRight: "10px", minWidth: "20px" }} />
              <span
                style={{ opacity: isOpen ? 1 : 0, transition: "opacity 0.3s" }}
              >
                Informations
              </span>
            </div>
            {isOpen && (
              <KeyboardArrowDownIcon
                sx={{
                  transform: openMenu === "info" ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  opacity: isOpen ? 1 : 0,
                }}
              />
            )}
          </a>
          <ul
            style={{
              listStyle: "none",
              paddingLeft: "20px",
              overflow: "hidden",
              maxHeight: openMenu === "info" ? "200px" : "0",
              opacity: openMenu === "info" ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
            }}
          >
            <li>
              <Link
                href="/changelogs"
                style={{
                  color: "white",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <ChangeCircleIcon sx={{ marginRight: "10px", minWidth: "20px" }} />
                <span style={{ opacity: isOpen ? 1 : 0 }}>Change Logs</span>
              </Link>
            </li>
          </ul>
        </li>

        <li>
          {openMenu !== "search" ? (
            <a
              href="#"
              onClick={toggleSearch}
              style={{
                color: "white",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <SearchIcon sx={{ marginRight: "10px", minWidth: "20px" }} />
              <span style={{ opacity: isOpen ? 1 : 0 }}>Rechercher</span>
            </a>
          ) : (
            <div style={{ padding: "10px" }}>
              <input
                type="text"
                placeholder="Rechercher des animés..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onBlur={handleBlur}
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "none",
                  borderRadius: "5px",
                  backgroundColor: "#1f1e23",
                  color: "white",
                }}
              />
              {searchResults.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "10px 0",
                  }}
                >
                  {searchResults.map((anime, index) => (
                    <li
                      key={index}
                      style={{
                        padding: "10px",
                        backgroundColor: "#2c2c2c",
                        marginBottom: "5px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        color: "white",
                      }}
                    >
                      {anime.nomAnime}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </li>
      </ul>
    </Box>
  );
}
