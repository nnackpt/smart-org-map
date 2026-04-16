"use client"

import AppLayout from "@/Components/AppLayout";
import Navbar from "@/Components/Navbar";
import OrgChart from "@/Components/UI/OrgChart";
import { auth } from "@/lib/auth";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation"
import { useState, useEffect, startTransition } from 'react';

export default function Home() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (!auth.isLoggedIn()) {
            router.replace("/login")
            return
        }
        startTransition(() => setMounted(true))
    }, [router])

    const user = mounted ? auth.getUser() : null

    if (!mounted || !user) return null

    return (
        <AppLayout user={user}>
            <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
                {/* <Navbar user={user} /> */}
                <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 1 }}>
                        Smart Org Map
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        {user.role === "Admin" || user.role === "HR" ? "Viewing all departments" : `Viewing ${user.department.name}`}
                    </Typography>
                    <OrgChart />
                </Box>
            </Box>
        </AppLayout>
    )
}