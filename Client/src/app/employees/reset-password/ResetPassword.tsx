"use client"

import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import LockResetIcon from "@mui/icons-material/LockReset"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useRouter } from "next/navigation"
import { useState, useEffect, startTransition } from 'react';
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import Navbar from "@/Components/Navbar"
import AppLayout from "@/Components/AppLayout"

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        bgcolor: "#fff",
        "&.Mui-focused fieldset": { borderColor: "#164799" }
    },
    "& label.Mui-focused": { color: "#164799" }
}

export default function ResetPassword() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [username, setUsername] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const user = auth.getUser()
        if (!user) {
            router.replace("/login")
            return
        }
        if (user.role !== "Admin" && user.role !== "HR") {
            router.replace("/")
            return
        }
        startTransition(() => setMounted(true))
    }, [])

    const user = mounted ? auth.getUser() : null
    if (!mounted || !user) return null

    const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setError("Passwords do net match.")
            return
        }
        setLoading(true)
        setError("")
        try {
            const res = await apiFetch("/api/Auth/reset-password", {
                method: "PATCH",
                body: JSON.stringify({ username, newPassword })
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message ?? "Failed to reset password.")
                return
            }
            setSuccess(true)
        } finally {
            setLoading(false)
        }
    }

    if (success) return (
        <AppLayout user={user}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                {/* <Navbar user={user} /> */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "calc(100vh - 64px)"
                    }}
                >
                    <Box sx={{ textAlign: "center", p: 4 }}>
                        <CheckCircleIcon sx={{ fontSize: 72, color: "#164799", mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 1 }}>
                            Password Reset!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            Password for <strong>{username}</strong> has been updated successfully.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setSuccess(false)
                                    setUsername("")
                                    setNewPassword("")
                                    setConfirmPassword("")
                                }}
                                sx={{
                                    borderColor: "#164799",
                                    color: "#ffffff",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600
                                }}
                            >
                                Reset Another
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => router.push("/")}
                                sx={{
                                    bgcolor: "#164799",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    "&:hover": { bgcolor: "#0d2d66" }
                                }}
                            >
                                Back to Home
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </AppLayout>
    )

    return (
        <AppLayout user={user}>
            <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
                {/* <Navbar user={user} /> */}
                {/* <Box sx={{ display: "flex", justifyContent: "center", pt: 8, px: 2 }}> */}
                    <Box sx={{ width: "100%", maxWidth: 480 }}>
                        {/* Header */}
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => router.back()}
                            sx={{
                                color: "#164799",
                                textTransform: "none",
                                fontWeight: 600,
                                pl: 0,
                                mb: 3
                            }}
                        >
                            Back
                        </Button>

                        {/* Card */}
                        <Box
                            sx={{
                                bgcolor: "#fff",
                                borderRadius: 3,
                                border: "1px solid #e0e7f0",
                                overflow: "hidden"
                            }}
                        >
                            {/* Card Header */}
                            <Box
                                sx={{
                                    bgcolor: "#164799",
                                    px: 4,
                                    py: 3,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        bgcolor: "rgba(255,255,255,0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <LockResetIcon sx={{ color: "#fff", fontSize: 22 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                                        Reset Password
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                                        Enter the username and new password
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Form */}
                            <Box
                                component="form"
                                onSubmit={handleSubmit}
                                sx={{
                                    p: 4,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2.5
                                }}
                            >
                                <TextField
                                    label="Username"
                                    required fullWidth
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Enter employee's username"
                                    sx={inputSx}
                                />

                                <Box sx={{ height: 1, bgcolor: "#f0f4f8", mx: -4 }} />

                                <TextField
                                    label="New Password" required fullWidth
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    sx={inputSx}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowNew(v => !v)} edge="end">
                                                        {showNew ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />

                                <TextField
                                    label="Confirm New Password" required fullWidth
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    error={passwordMismatch}
                                    helperText={passwordMismatch ? "Passwords do not match" : ""}
                                    sx={inputSx}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                                                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />

                                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading || passwordMismatch || !username || !newPassword || !confirmPassword}
                                    sx={{
                                        mt: 0.5,
                                        py: 1.4,
                                        bgcolor: "#164799",
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        textTransform: "none",
                                        fontSize: "0.95rem",
                                        boxShadow: "0 4px 14px rgba(22,71,153,0.25)",
                                        "&:hover": { bgcolor: "#0d2d66" }
                                    }}
                                >
                                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Reset Password"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                {/* </Box> */}
            </Box>
        </AppLayout>
    )
}