"use client"

import { useRouter } from "next/navigation"
import { useState } from 'react';
import { auth, AuthUser } from "@/lib/auth"
import LockResetIcon from "@mui/icons-material/LockReset"
import Button from "@mui/material/Button"
import { AppBar, Avatar, Box, Divider, ListItemIcon, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import Image from "next/image";
import AvatarPickerDialog from "./UI/AvatarPickerDialog";
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import LogoutIcon from "@mui/icons-material/Logout"
import PersonIcon from "@mui/icons-material/Person"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import EditIcon from "@mui/icons-material/Edit"

export default function Navbar({ user }: { user: AuthUser }) {
    const router = useRouter()
    const [anchor, setAnchor] = useState<null | HTMLElement>(null)
    const isPrivileged = user.role === "Admin" || user.role === "HR"
    const [avatarSeed, setAvatarSeed] = useState<string | null>(() => auth.getAvatar())
    const [pickerOpen, setPickerOpen] = useState(false)

    const handleSignOut = () => {
        auth.clear()
        router.replace("/login")
    }

    const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    return (
        <>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#fff", borderBottom: "1px solid #e9edf5" }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    {/* Logo */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccountTreeIcon sx={{ color: "#164799" }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#164799" }}>
                            Smart Org Map
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {/* User */}
                        <Box
                            onClick={(e) => setAnchor(e.currentTarget)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                cursor: "pointer",
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: anchor ? "#164799" : "#e0e7f0",
                                transition: "all 0.15s",
                                "&:hover": { bgcolor: "#f0f4ff", borderColor: "#164799" }
                            }}
                            >
                            <Avatar
                                sx={{
                                    width: 30,
                                    height: 30,
                                    bgcolor: "#164799",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    overflow: "hidden"
                                }}
                            >
                                {avatarSeed
                                    ? <Image
                                        alt="Avatar"
                                        src={`https://api.dicebear.com/9.x/open-peeps/png?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                        width={30}
                                        height={30}
                                    />
                                    : initials
                                }
                            </Avatar>
                            <Box sx={{ display: { xs: "none", sm: "block" } }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0d1b2e", lineHeight: 1.2, fontSize: "0.8rem" }}>
                                    {user.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                                    {user.position}
                                </Typography>
                            </Box>
                            <KeyboardArrowDownIcon
                                sx={{
                                    fontSize: 16,
                                    color: "#164799",
                                    transition: "transform 0.2s",
                                    transform: anchor ? "rotate(180deg)" : "rotate(0deg)"
                                }}
                            />
                        </Box>
                    </Box>

                    <Menu
                        anchorEl={anchor}
                        open={!!anchor}
                        onClose={() => setAnchor(null)}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } } }}
                    >
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5
                            }}
                        >
                            <Box
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPickerOpen(true)
                                }}
                                sx={{
                                    position: "relative",
                                    cursor: "pointer",
                                    flexShrink: 0,
                                    "&:hover .edit-overlay": { opacity: 1 }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: "#164799",
                                        overflow: "hidden",
                                    }}
                                >
                                    {avatarSeed
                                        ? <Image
                                            alt="Avatar"
                                            src={`https://api.dicebear.com/9.x/open-peeps/png?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                            width={36}
                                            height={36}
                                        />
                                        : initials
                                    }
                                </Avatar>
                                {/* Edit overlay */}
                                <Box
                                    className="edit-overlay"
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        bgcolor: "rgba(0,0,0,0.45)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: 0,
                                        transition: "opacity 0.15s"
                                    }}
                                >
                                    <EditIcon sx={{ fontSize: 14, color: "#fff" }} />
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0d1b2e", fontSize: "0.78rem" }}>
                                    {user.name}
                                </Typography>
                                <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "0.72rem" }}>
                                    {user.department.name}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider />

                        <MenuItem
                            onClick={() => {
                                router.push("/")
                                setAnchor(null)
                            }}
                            sx={{ gap: 1.5, py: 1 }}
                        >
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem
                            onClick={handleSignOut}
                            sx={{ gap: 1.5, py: 1, color: "#d32f2f" }}
                        >
                            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "#d32f2f" }} /></ListItemIcon>
                            <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#d32f2f" }}>
                                Sign Out
                            </Typography>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <AvatarPickerDialog 
                open={pickerOpen}
                currentSeed={avatarSeed}
                onClose={() => setPickerOpen(false)}
                onSelect={setAvatarSeed}
            />
        </>
    )
}