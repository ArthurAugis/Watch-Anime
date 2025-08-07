"use client";
import React, { useState } from "react";
import {
    Typography,
    Paper,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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

function EditChangelogDialog({ open, onClose, entry, onSave }: any) {
    const [ajouts, setAjouts] = React.useState(entry?.codeChangeLog || "");

    React.useEffect(() => {
        setAjouts(entry?.codeChangeLog || "");
    }, [entry]);

    const handleSave = async () => {
        await fetch("/api/utils/changelogs", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: entry.id, ajouts }),
        });
        onSave();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: "#191825",
                    color: "#fff",
                },
            }}
        >
            <DialogTitle sx={{ color: "#fff" }}>Modifier le changelog</DialogTitle>
            <DialogContent>
                <TextField
                    value={ajouts}
                    onChange={e => setAjouts(e.target.value)}
                    multiline
                    minRows={4}
                    fullWidth
                    sx={{
                        mt: 2,
                        backgroundColor: "#232136",
                        input: { color: "#fff" },
                        textarea: { color: "#fff" },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "#fff",
                            },
                            "&:hover fieldset": {
                                borderColor: "#fff",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#fff",
                            },
                        },
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ background: "#232136" }}>
                <Button onClick={onClose} sx={{ color: "#fff" }}>
                    Annuler
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{
                        backgroundColor: "#fff",
                        color: "#0f0e13",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                    }}
                >
                    Enregistrer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function ConfirmDeleteDialog({
    open,
    onClose,
    onConfirm,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: "#191825",
                    color: "#fff",
                },
            }}
        >
            <DialogTitle sx={{ color: "#fff" }}>Confirmer la suppression</DialogTitle>
            <DialogContent>
                <Typography>
                    Es-tu sûr de vouloir supprimer ce changelog ? Cette action est irréversible.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ background: "#232136" }}>
                <Button onClick={onClose} sx={{ color: "#fff" }}>
                    Annuler
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{
                        backgroundColor: "#ff1744",
                        color: "#fff",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#d50000" },
                    }}
                >
                    Supprimer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function ChangelogAdmin({ changelog }: { changelog: ChangelogEntry[] }) {
    const [entries, setEntries] = useState(changelog);
    const [editOpen, setEditOpen] = useState(false);
    const [editEntry, setEditEntry] = useState<ChangelogEntry | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = (id?: number) => {
        setDeleteId(id ?? null);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await fetch("/api/utils/changelogs", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deleteId }),
        });
        setEntries(entries.filter(e => e.id !== deleteId));
        setDeleteOpen(false);
        setDeleteId(null);
    };

    const handleEdit = (entry: ChangelogEntry) => {
        setEditEntry(entry);
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        const res = await fetch("/api/utils/changelogs");
        const data = await res.json();
        setEntries(data);
        setEditOpen(false);
        setEditEntry(null);
    };

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
            <Paper
                elevation={3}
                sx={{
                    mb: 6,
                    p: 3,
                    backgroundColor: "#191825",
                    color: "#fff",
                    maxWidth: 700,
                    mx: "auto",
                }}
            >
                <Typography variant="h6" mb={2} sx={{ color: "#fff" }}>
                    Ajouter des ajouts (séparés par un point-virgule) :
                </Typography>
                <form
                    action="/api/utils/changelogs"
                    method="POST"
                    onSubmit={async e => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const ajouts = (form.ajouts as HTMLInputElement).value;
                        await fetch("/api/utils/changelogs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ajouts }),
                        });
                        form.reset();
                        const res = await fetch("/api/utils/changelogs");
                        const data = await res.json();
                        setEntries(data);
                    }}
                >
                    <TextField
                        name="ajouts"
                        multiline
                        minRows={4}
                        fullWidth
                        placeholder="changement 1 ; changement 2 ; ..."
                        variant="outlined"
                        sx={{
                            mb: 2,
                            backgroundColor: "#232136",
                            input: { color: "#fff" },
                            textarea: { color: "#fff" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: "#fff",
                                },
                                "&:hover fieldset": {
                                    borderColor: "#fff",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#fff",
                                },
                            },
                        }}
                        InputLabelProps={{
                            style: { color: "#fff" },
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{
                            backgroundColor: "#fff",
                            color: "#0f0e13",
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: "#e0e0e0",
                            },
                        }}
                    >
                        Ajouter au changelog
                    </Button>
                </form>
            </Paper>
            <List sx={{ maxWidth: 700, mx: "auto" }}>
                {entries.map((entry, idx) => (
                    <Paper
                        key={entry.id || entry.date}
                        elevation={2}
                        sx={{
                            mb: 4,
                            p: 3,
                            backgroundColor: "#0f0e13",
                            color: "#fff",
                            position: "relative",
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
                        <div style={{ position: "absolute", top: 8, right: 8 }}>
                            <IconButton
                                aria-label="modifier"
                                onClick={() => handleEdit(entry)}
                                size="small"
                                sx={{ color: "#fff" }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                aria-label="supprimer"
                                onClick={() => handleDelete(entry.id)}
                                size="small"
                                sx={{ color: "#fff" }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </div>
                        {idx < entries.length - 1 && (
                            <Divider sx={{ mt: 2, background: "#232136" }} />
                        )}
                    </Paper>
                ))}
            </List>
            <EditChangelogDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                entry={editEntry}
                onSave={handleEditSave}
            />
            <ConfirmDeleteDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}