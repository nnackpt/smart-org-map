"use client"

import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PersonOffIcon from "@mui/icons-material/PersonOff"
import { useRouter } from "next/navigation"
import { useState, useEffect, startTransition } from 'react';
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import AppLayout from "@/Components/AppLayout"
import { Alert, Autocomplete, Avatar, Box, Button, Chip, CircularProgress, Divider, TextField, Typography } from '@mui/material';

interface Employee {
    id: number
    name: string
    position: string
    department: { id: number; name: string }
    manager: { id: number; name: string } | null
}

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        bgcolor: "#fff",
        "&.Mui-focused fieldset": { borderColor: "#164799"}
    },
    "& label.Mui-focused": { color: "#164799" }
}

export default function ManageManagers() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selected, setSelected] = useState<Employee | null>(null)
    const [newManager, setNewManager] = useState<Employee | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

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

        apiFetch("/api/Employees")
            .then(r => r.ok ? r.json() : [])
            .then(setEmployees)
        
        startTransition(() => setMounted(true))
    }, [])

    const user = mounted ? auth.getUser() : null
    if (!mounted || !user) return null

    const handleAssign = async () => {
        if (!selected) return
        setLoading(true)
        setError("")
        setSuccess("")
        try {
            const res = newManager
                ? await apiFetch(`/api/Managers/${selected.id}/assign/${newManager.id}`, { method: "PATCH" })
                : await apiFetch(`/api/Managers/${selected.id}/unassign`, { method: "PATCH" })
            
            if (!res.ok) {
                try {
                    const err = await res.json()
                    setError(err.message ?? "Failed to update manager.")
                } catch {
                    setError(`Request failed with status ${res.status}`)
                }
                return
            }
            const data = await res.json()
            setSuccess(data.message)
            setEmployees(prev => prev.map(e =>
                e.id === selected.id
                    ? { ...e, manager: newManager ? { id: newManager.id, name: newManager.name } : null }
                    : e
            ))
            setSelected(prev => prev ? { ...prev, manager: newManager ? { id: newManager.id, name: newManager.name } : null } : null)
        } finally {
            setLoading(false)
        }
    }

    const managerOptions = employees.filter(e => e.id !== selected?.id)
    const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

    return (
        <AppLayout user={user}>
            <Box sx={{ height: "100%", overflow: "auto", p: 2 }}>
                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: "#164799",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <ManageAccountsIcon sx={{ color: "#fff" }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d1b2e" }}>
                                Manage Managers
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Assign or remove manager for employees
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            border: "1px solid #e0e7f0",
                            p: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 3
                        }}
                    >
                        {/* Step 1 - Select Employee */}
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 1.5 }}>
                                1. Select Employee
                            </Typography>
                            <Autocomplete
                                options={employees}
                                getOptionLabel={e => e.name}
                                value={selected}
                                onChange={(_, v) => {
                                    setSelected(v)
                                    setNewManager(null)
                                    setSuccess("")
                                    setError("")
                                }}
                                renderOption={({ key, ...props }, e) => (
                                    <Box
                                        key={key}
                                        component="li"
                                        {...props}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            py: 1
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: "#164799",
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}
                                        >
                                            {initials(e.name)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {e.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {e.position} · {e.department.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={params => <TextField {...params} label="Search employee" sx={inputSx} />}
                            />
                        </Box>

                        {/* Current Manager Info */}
                        {selected && (
                            <>
                                <Divider />
                                <Box sx={{ bgcolor: "#f5f7fa", borderRadius: 2, p: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                        Current Manager
                                    </Typography>
                                    {selected.manager ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: "#164799",
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}
                                            >
                                                {initials(selected.manager.name)}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0d1b2e" }}>
                                                {selected.manager.name}
                                            </Typography>
                                        </Box>
                                    ) : (
                                            <Chip
                                                label="No manager assigned"
                                                size="small"
                                                sx={{
                                                    bgcolor: "#fef3c7",
                                                    color: "#92400e",
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem"
                                                }}
                                            />
                                    )}
                                </Box>
                            </>
                        )}

                        {/* Step 2 - Assign New Manager */}
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 1.5 }}>
                                2. Assign New Manager
                            </Typography>
                            <Autocomplete
                                options={managerOptions}
                                getOptionLabel={e => e.name}
                                value={newManager}
                                onChange={(_, v) => {
                                    setNewManager(v)
                                    setSuccess("")
                                    setError("")
                                }}
                                renderOption={({ key, ...props }, e) => (
                                    <Box
                                        key={key}
                                        component="li"
                                        {...props}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            py: 1
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: "#164799",
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}
                                        >
                                            {initials(e.name)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {e.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {e.position} · {e.department.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={params => <TextField {...params} label="Select new manager (leave empty to unassign)" sx={inputSx} />}
                            />
                        </Box>

                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                        {success && (
                            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2 }}>
                                {success}
                            </Alert>
                        )}

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleAssign}
                                disabled={loading}
                                sx={{
                                    bgcolor: "#164799",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    flex: 1,
                                    "&:hover": { bgcolor: "#0d2d66" }
                                }}
                            >
                                {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Update Manager"}
                            </Button>
                            {selected?.manager && (
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setNewManager(null)
                                        handleAssign()
                                    }}
                                    startIcon={<PersonOffIcon />}
                                    disabled={loading}
                                    sx={{
                                        borderColor: "#d32f2f",
                                        color: "#d32f2f",
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        "&:hover": { bgcolor: "#fff5f5", borderColor: "#d32f2f" }
                                    }}
                                >
                                    Unassign
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </AppLayout>
    )
}