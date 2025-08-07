import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
} from "@mui/material";
import dynamic from "next/dynamic";
import ChangelogAdmin from "./ChangelogAdmin";

export const metadata = {
  title: "ChangeLogs | Watch-Anime",
  description:
    "Consulte les changements récents de Watch-Anime. Découvre les nouvelles fonctionnalités, corrections de bugs et améliorations apportées à la plateforme.",
  keywords: [
    "Watch-Anime",
    "changelog",
    "changements récents",
    "nouvelles fonctionnalités",
    "corrections de bugs",
    "améliorations",
    "mise à jour",
    "historique des changements",
    "nouveautés Watch-Anime",
    "suivi des modifications",
    "journal des modifications",
    "updates",
    "nouvelle version"
  ],
};

interface ChangelogEntry {
    date: string;
    codeChangeLog?: string;
    auteur?: string;
    id?: number;
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

async function getChangelogs(): Promise<ChangelogEntry[]> {
    const host = (await headers()).get("host");
    const protocol = process.env.VERCEL_URL ? "https" : "http";
    const res = await fetch(`${protocol}://${host}/api/utils/changelogs`, {
        cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
}

async function isAdmin(): Promise<boolean> {
    const session = await getServerSession(authOptions);
    return !!session?.user && (session.user as any).admin === 1;
}

export default async function ChangelogPage() {
    const changelog = await getChangelogs();
    const admin = await isAdmin();

    if (admin) {
        return <ChangelogAdmin changelog={changelog} />;
    }

    return (
        <div>
            <Typography
                variant="h3"
                fontWeight="bold"
                mb={4}
                align="center"
                sx={{ color: "#fff" }}
            >
                Changelog
            </Typography>
            <List sx={{ maxWidth: 700, mx: "auto" }}>
                {changelog.map((entry, idx) => (
                    <Paper
                        key={entry.date}
                        elevation={2}
                        sx={{
                            mb: 4,
                            p: 3,
                            backgroundColor: "#0f0e13",
                            color: "#fff",
                        }}
                    >
                        <Typography variant="h6" mb={1} sx={{ color: "#fff" }}>
                            {formatDate(entry.date)}
                        </Typography>
                        {entry.codeChangeLog && (
                            <List dense>
                                {entry.codeChangeLog
                                    .split(";")
                                    .map((change, i) =>
                                        change.trim() ? (
                                            <ListItem key={i} sx={{ pl: 0, color: "#fff" }}>
                                                <ListItemText
                                                    primary={change.trim()}
                                                    primaryTypographyProps={{
                                                        style: { color: "#fff" },
                                                    }}
                                                />
                                            </ListItem>
                                        ) : null
                                    )}
                            </List>
                        )}
                        {entry.auteur && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    mt: 1,
                                    display: "block",
                                    color: "#bdbdbd",
                                }}
                            >
                                Auteur : {entry.auteur}
                            </Typography>
                        )}
                        {idx < changelog.length - 1 && (
                            <Divider sx={{ mt: 2, background: "#232136" }} />
                        )}
                    </Paper>
                ))}
            </List>
        </div>
    );
}