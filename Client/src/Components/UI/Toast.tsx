"use client"

import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { Box, Typography } from "@mui/material";
import { useState, useEffect, startTransition } from 'react';

interface Props {
    message: string
    type?: "success" | "error"
    open: boolean
    onClose: () => void
}

export default function Toast({ message, type = "success", open, onClose }: Props) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!open) return
        startTransition(() => setVisible(true))
        
        const t = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 300)
        }, 3000)

        return () => clearTimeout(t)
    }, [open, onClose])

    if (!open) return null

    const isSuccess = type === "success"

    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 32,
                left: "50%",
                transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(20px)",
                opacity: visible ? 1 : 0,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                bgcolor: isSuccess ? "#0d1b2e" : "#fff",
                border: "1px solid",
                borderColor: isSuccess ? "transparent" : "#fecaca",
                boxShadow: isSuccess
                    ? "0 8px 32px rgba(22,71,153,0.25), 0 2px 8px rgba(0,0,0,0.15)"
                    : "0 8px 32px rgba(211,47,47,0.15)",
                minWidth: 260
            }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: isSuccess ? "rgba(255,255,255,0.1)" : "#fff5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                }}
            >
                {isSuccess
                    ? <CheckCircleIcon sx={{ fontSize: 18, color: "#4ade80" }} />
                    : <ErrorIcon sx={{ fontSize: 18, color: "#d32f2f" }} />
                }
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: isSuccess ? "#fff" : "#d32f2f" }}>
                {message}
            </Typography>
            {/* Progress bar */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 3,
                    borderRadius: "0 0 12px 12px",
                    bgcolor: isSuccess ? "#4ade80" : "#d32f2f",
                    animation: "shrink 3s linear forwards",
                    "@keyframes shrink": { from: { width: "100%" }, to: { width: "0%" } }
                }}
            />
        </Box>
    )
}