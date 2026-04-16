"use client"

import AccountTreeIcon from "@mui/icons-material/AccountTree"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import LockResetIcon from "@mui/icons-material/LockReset"
import DashboardIcon from "@mui/icons-material/Dashboard"
import { AuthUser } from "@/lib/auth"
import { usePathname, useRouter } from "next/navigation"
import { Box, Tooltip, Typography } from "@mui/material"

const navItems = (isPrivileged: boolean) => [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
    ...(isPrivileged ? [
        { label: "Add Employee", icon: <PersonAddIcon />, path: "/employees/new" },
        { label: "Reset Password", icon: <LockResetIcon />, path: "/employees/reset-password" },
    ] : [])
]

export default function Sidebar({ user }: { user: AuthUser }) {
    const router = useRouter()
    const pathname = usePathname()
    const isPrivileged = user.role === "Admin" || user.role === "HR"

    return (
        <Box
            sx={{
                width: 200,
                flexShrink: 0,
                bgcolor: "#fff",
                borderRight: "1px solid #e9edf5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 2,
                gap: 1
            }}
        >
            {/* Logo */}
            {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, px: 1 }}>
                <AccountTreeIcon sx={{ color: "#164799", fontSize: 24, flexShrink: 0 }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#164799" }}>
                    Smart Org Map
                </Typography>
            </Box> */}

            {/* Nav Items */}
            {navItems(isPrivileged).map(({ label, icon, path }) => {
                const active = pathname === path
                return (
                    <Box
                        key={path}
                        onClick={() => router.push(path)}
                        sx={{
                            width: "calc(100% - 16px)",
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            cursor: "pointer",
                            bgcolor: active ? "#164799" : "transparent",
                            color: active ? "#fff" : "#64748b",
                            transition: "all 0.15s",
                            "&:hover": {
                                bgcolor: active ? "#164799" : "#f0f4ff",
                                color: active ? "#fff" : "#164799"
                            }
                        }}
                    >
                        <Box sx={{ display: "flex", flexShrink: 0, "& svg": { fontSize: 20 } }}>
                            {icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: active ? 700 : 500, fontSize: "0.82rem" }}>
                            {label}
                        </Typography>
                    </Box>
                )
            })}
        </Box>
    )
}