"use client"

import { useState } from "react"
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { getConfig } from "@/lib/config";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import Image from "next/image";

export default function Login() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ username: "", password: "" })
    const [error, setError] = useState("")
    const [openForgot, setOpenForgot] = useState(false)
 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { API_BASE_URL } = await getConfig()
            const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })

            if (!res.ok) {
                const err = await res.json()
                setError(err.message)
                // console.error(err.message)
                return
            }

            setError("")
            const data = await res.json()
            auth.save(data.token, data.employee)
            router.push("/")
            // console.log(data)
        } finally {
            setLoading(false)
        }
    }

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&.Mui-focused fieldset": { borderColor: "#164799" }
        },
        "& label.Mui-focused": { color: "#164799" }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                bgcolor: "#f5f7fa"
            }}
        >
            <Box
                sx={{
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "45%",
                    bgcolor: "#164799",
                    p: 6,
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Decorative circles */}
                {[200, 340, 480].map((size, i) => (
                    <Box
                        key={i}
                        sx={{
                            position: "absolute",
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.1)",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)"
                        }}
                    />
                ))}
                <AccountTreeIcon sx={{ color: "#fff", fontSize: 64, mb: 3, zIndex: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, textAlign: "center", color: "#fff", zIndex: 1 }}>
                    Smart Org Map
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ textAlign: "center", mt: 2, zIndex: 1 }}>
                    Manage your organization structure with ease
                </Typography>
            </Box>

            {/* Right panel */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 4,
                }}
            >
                {/* Mobile logo */}
                <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 4 }}>
                    <AccountTreeIcon sx={{ color: "#164799", fontSize: 32 }} />
                    {/* <Image
                        src="/logo.png"
                        alt="OrgChart"
                        width={32}
                        height={32}
                        unoptimized
                        style={{ marginBottom: 24, zIndex: 1, objectFit: "contain" }}
                    /> */}
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#164799" }}>
                        OrgChart
                    </Typography>
                </Box>

                <Box sx={{ width: "100%", maxWidth: 400 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 0.5 }}>
                        Welcome back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Sign in to continue to your dashboard
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            required
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            sx={inputSx}
                        />
                        <TextField
                            label="Password"
                            variant="outlined"
                            fullWidth
                            required
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            sx={inputSx}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                mt: 0.5,
                                py: 1.4,
                                bgcolor: "#164799",
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: "1rem",
                                textTransform: "none",
                                boxShadow: "0 4px 14px rgba(22,71,153,0.35)",
                                "&:hover": {
                                    bgcolor: "#0d2d66",
                                    boxShadow: "0 6px 20px rgba(22,71,153,0.45)"
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
                        </Button>
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            size="small"
                            onClick={() => setOpenForgot(true)}
                            sx={{
                                color: "#164799",
                                textTransform: "none",
                                fontSize: "0.8rem",
                                alignSelf: "center"
                            }}
                        >
                            Forgot password?
                        </Button>

                        <Dialog
                            open={openForgot}
                            onClose={() => setOpenForgot(false)}
                            slotProps={{
                                paper: {
                                    sx: { borderRadius: 3, p: 1, maxWidth: 360 }
                                }
                            }}
                        >
                            <DialogTitle sx={{ fontWeight: 700, color: "#0d1b2e", pb: 1 }}>
                                Forgot Password?
                            </DialogTitle>
                            <DialogContent>
                                <Typography variant="body2" color="text.secondary">
                                    Please contact your <strong>HR</strong> or <strong>Admin</strong> to reset your password.
                                </Typography>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, pb: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setOpenForgot(false)}
                                    sx={{
                                        bgcolor: "#164799",
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        "&:hover": { bgcolor: "#0d2d66" }
                                    }}
                                >
                                    Got it
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}