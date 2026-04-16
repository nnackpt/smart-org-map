"use client"

import { AuthUser } from "@/lib/auth";
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from "./Sidebar";

export default function AppLayout({ user, children }: { user: AuthUser; children: React.ReactNode }) {
    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            <Navbar user={user} />
            <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
                <Sidebar user={user} />
                <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#f5f7fa" }}>
                    {children}
                </Box>
            </Box>
        </Box>
    )
}