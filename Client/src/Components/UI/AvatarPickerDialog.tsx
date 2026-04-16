"use client"

import { auth } from "@/lib/auth"
import CloseIcon from "@mui/icons-material/Close"
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material"
import Image from "next/image"

const SEEDS = [
    "Felix",
    "Mia",
    "Leo",
    "Luna",
    "Max",
    "Zoe",
    "Sam",
    "Ivy",
    "Kai",
    "Ava",
    "Ray",
    "Noa",
    "Sky",
    "Eli",
    "Joy",
    "Rex"
]

const avatarUrl = (seed: string) =>
    `https://api.dicebear.com/9.x/open-peeps/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

interface Props {
    open: boolean
    currentSeed: string | null
    onClose: () => void
    onSelect: (seed: string) => void
}

export default function AvatarPickerDialog({ open, currentSeed, onClose, onSelect }: Props) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: { borderRadius: 3, maxWidth: 400, width: "100%" }
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pb: 1
                }}
            >
                <Box>
                    <Typography sx={{ fontWeight: 700, color: "#0d1b2e" }}>
                        Choose Avatar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Pick a character that represents you
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" aria-label="Close avatar picker">
                    <CloseIcon fontSize="small" /> 
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 1.5,
                        pt: 1
                    }}
                >
                    {SEEDS.map(seed => (
                        <Tooltip key={seed} title={seed} arrow>
                            <Box
                                onClick={() => {
                                    auth.saveAvatar(seed)
                                    onSelect(seed)
                                    onClose()
                                }}
                                sx={{
                                    cursor: "pointer",
                                    borderRadius: 2.5,
                                    border: "2px solid",
                                    borderColor: currentSeed === seed ? "#164799" : "transparent",
                                    bgcolor: currentSeed === seed ? "#e8edf7" : "#f5f7fa",
                                    p: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.15s",
                                    "&:hover": { 
                                        borderColor: "#164799",
                                        bgcolor: "#e8edf7",
                                        transform: "scale(1.05)"
                                    }
                                }}
                            >
                                <Image
                                    src={avatarUrl(seed)}
                                    alt={seed}
                                    width={52}
                                    height={52}
                                />
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </DialogContent>
        </Dialog>
    )
}