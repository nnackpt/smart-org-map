"use client"

import { auth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState, startTransition } from 'react';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Divider, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import PersonIcon from "@mui/icons-material/Person"
import BadgeIcon from "@mui/icons-material/Badge"
import LockIcon from "@mui/icons-material/Lock"
import BusinessIcon from "@mui/icons-material/Business"
import GroupIcon from "@mui/icons-material/Group"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { apiFetch } from "@/lib/api";
import Navbar from "@/Components/Navbar";
import AppLayout from "@/Components/AppLayout";

interface Department {
    id: number
    name: string
}

interface Manager {
    id: number
    name: string
    position: string
}

const ROLES = ["Employee", "HR", "Admin"]

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        bgcolor: "#fff",
        "&.Mui-focused fieldset": { borderColor: "#164799" }
    },
    "& label.Mui-focused": { color: "#164799" }
}

export default function NewEmployee() {
    const router = useRouter()
    const user = auth.getUser()
    const [mounted, setMounted] = useState(false)

    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [depts, setDepts] = useState<Department[]>([])
    const [managers, setManagers] = useState<Manager[]>([])
    const [newDeptName, setNewDeptName] = useState("")
    const [addingDept, setAddingDept] = useState(false)
    const [deptLoading, setDeptLoading] = useState(false)
    
    const [form, setForm] = useState({
        name: "",
        username: "",
        password: "",
        position: "",
        departmentId: "",
        managerId: "",
        role: "Employee"
    })

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

        apiFetch("/api/Departments")
            .then(r => r.ok ? r.json() : [])
            .then(setDepts)
        
        apiFetch("/api/Employees")
            .then(r => r.ok ? r.json() : [])
            .then(setManagers)
        
        startTransition(() => setMounted(true))
    }, [])

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await apiFetch("/api/Auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name,
                    username: form.username,
                    password: form.password,
                    position: form.position,
                    departmentId: Number(form.departmentId),
                    managerId: form.managerId ? Number(form.managerId) : null,
                    role: form.role
                })
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message ?? "Failed to create employee.")
                return
            }
            setSuccess(true)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateDept = async () => {
        if (!newDeptName.trim()) return
        setDeptLoading(true)
        try {
            const res = await apiFetch("/api/Departments", {
                method: "POST",
                body: JSON.stringify({ name: newDeptName.trim() })
            })
            if (!res.ok) return
            const created: Department = await res.json()
            setDepts(d => [...d, created])
            set("departmentId", String(created.id))
            setNewDeptName("")
            setAddingDept(false)
        } finally {
            setDeptLoading(false)
        }
    }

    if (!mounted || !user) return null

    const deptName = depts.find(d => d.id === Number(form.departmentId))?.name ?? "-"
    const managerName = managers.find(m => m.id === Number(form.managerId))?.name ?? "None"
    const initials = form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"

    const stepContents = [
        {
            icon: <PersonIcon />,
            title: "Account Information",
            desc: "Login Credentials",
            content: (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField
                        label="Full Name"
                        required fullWidth
                        value={form.name}
                        onChange={e => set("name", e.target.value)}
                        sx={inputSx}
                    />
                    <TextField
                        label="Username"
                        required fullWidth
                        value={form.username}
                        onChange={e => set("username", e.target.value)}
                        sx={inputSx}
                    />
                    <TextField
                        label="Password"
                        required fullWidth
                        value={form.password}
                        onChange={e => set("password", e.target.value)}
                        type={showPassword ? "text" : "password"}
                        sx={inputSx}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(v => !v)} edge="end" aria-label={showPassword ? "Hide password" : "Show password"}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </Box>
            )
        },
        {
            icon: <BusinessIcon />,
            title: "Work Details",
            desc: "Position & Department",
            content: (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField
                        label="Position"
                        required fullWidth
                        value={form.position}
                        onChange={e => set("position", e.target.value)}
                        sx={inputSx}
                    />
                    <FormControl fullWidth sx={inputSx} required>
                        <InputLabel>Departments</InputLabel>
                        <Select
                            value={form.departmentId}
                            label="Department"
                            onChange={e => set("departmentId", e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            {depts.map(d => (
                                <MenuItem
                                    key={d.id}
                                    value={d.id}
                                >
                                    {d.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {!addingDept ? (
                        <Button
                            size="small"
                            onClick={() => setAddingDept(true)}
                            sx={{
                                mt: 0.75,
                                color: "#164799",
                                textTransform: "none",
                                fontWeight: 600,
                                pl: 0,
                                fontSize: "0.78rem"
                            }}
                        >
                            + Create new Department
                        </Button>
                    ) : (
                            <Box sx={{ display: "flex", gap: 1, mt: 1.5, alignItems: "center" }}>
                                <TextField
                                    size="small"
                                    label="Department Name"
                                    value={newDeptName}
                                    onChange={e => setNewDeptName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter")
                                            handleCreateDept()
                                    }}
                                    sx={{ ...inputSx, flex: 1 }}
                                    autoFocus
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleCreateDept}
                                    disabled={deptLoading || !newDeptName.trim()}
                                    sx={{
                                        bgcolor: "#164799",
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        minWidth: 72,
                                        "&:hover": { bgcolor: "#0d2d66" }
                                    }}
                                >
                                    {deptLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Add"}
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setAddingDept(false)
                                        setNewDeptName("")
                                    }}
                                    sx={{
                                        color: "text.secondary",
                                        textTransform: "none"
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                    )}

                    <FormControl fullWidth sx={inputSx}>
                        <InputLabel>Manager (Optional)</InputLabel>
                        <Select
                            value={form.managerId}
                            label="Manager (Optional)"
                            onChange={e => set("managerId", e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {managers.map(m => (
                                <MenuItem key={m.id} value={m.id}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {m.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {m.position}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={inputSx}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={form.role}
                            label="Role"
                            onChange={e => set("role", e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            {ROLES.map(r => (
                                <MenuItem key={r} value={r}>
                                    {r}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )
        },
        {
            icon: <CheckCircleIcon />,
            title: "Review & Confirm",
            desc: "Check before submit",
            content: (
                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 3,
                            p: 2,
                            bgcolor: "#f5f7fa",
                            borderRadius: 2
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 52,
                                height: 52,
                                bgcolor: "#164799",
                                fontWeight: 700,
                                fontSize: 18
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 700, color: "#0d1b2e" }}>
                                {form.name || "-"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {form.position || "-"}
                            </Typography>
                            <Chip
                                label={form.role}
                                size="small"
                                sx={{
                                    mt: 0.5,
                                    bgcolor: "#e8edf7",
                                    color: "#164799",
                                    fontWeight: 600,
                                    fontSize: "0.72rem"
                                }}
                            />
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {[
                        { icon: <BadgeIcon fontSize="small" />, label: "Username", value: form.username },
                        { icon: <LockIcon fontSize="small" />, label: "Password", value: "••••••••" },
                        { icon: <BusinessIcon fontSize="small" />, label: "Department", value: deptName },
                        { icon: <GroupIcon fontSize="small" />, label: "Manager", value: managerName },
                    ].map(row => (
                        <Box
                            key={row.label}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 1.2
                            }}
                        >
                            <Box sx={{ color: "#0d3a8a", display: "flex" }}>{row.icon}</Box>
                            <Typography variant="body2" color="rgba(0,0,0,0.6)" sx={{ width: 100 }}>
                                {row.label}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0d1b2e" }}>
                                {row.value}
                            </Typography>
                        </Box>
                    ))}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>
                    )}
                </Box>
            )
        }
    ]

    if (success) return (
        <AppLayout user={user}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%"
                }}
            >
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
                            Employee Created!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            <strong>{form.name}</strong> has been added successfully.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setSuccess(false)
                                    setStep(0)
                                    setForm({
                                        name: "",
                                        username: "",
                                        password: "",
                                        position: "",
                                        departmentId: "",
                                        managerId: "",
                                        role: "Employee"
                                    })
                                }}
                                sx={{
                                    borderColor: "#164799",
                                    color: "#ffffff",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600
                                }}
                            >
                                Add Another
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
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    p: 3,
                    gap: 3
                }}
            >
                {/* <Navbar user={user} /> */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        overflow: "hidden",
                        gap: 3,
                    }}
                >
                    {/* Step List */}
                    <Box
                        sx={{
                            width: 240,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            flexShrink: 0
                        }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => router.push("/")}
                                sx={{
                                    color: "#164799",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    pl: 0,
                                    mb: 1
                                }}
                            >
                                Back
                            </Button>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d1b2e" }}>
                                Add New Employee
                            </Typography>
                            <Typography variant="caption" color="rgba(0,0,0,0.6)">Fill in each step to create account.</Typography>
                        </Box>

                        {stepContents.map(({ icon, title, desc }, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    p: 1.5,
                                    borderRadius: 2.5,
                                    bgcolor: step === i ? "#164799" : step > i ? "#e8edf7" : "#fff",
                                    border: "1px solid",
                                    borderColor: step === i ? "#164799" : "#e0e7f0",
                                    transition: "all 0.2s",
                                    cursor: step > i ? "pointer" : "default"
                                }}
                                onClick={() => { if (step > i) setStep(i) }}
                            >
                                <Box
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        bgcolor: step === i ? "rgba(255,255,255,0.2)" : step > i ? "#164799" : "#f0f4ff",
                                        color: step === i ? "#fff" : step > i ? "#fff" : "#164799",
                                        "& svg": { fontSize: 18 }
                                    }}
                                >
                                    {step > i ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : icon}
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }} color={step === i ? "#fff" : step > i ? "#0d3a8a" : "#0d1b2e"}>
                                        {title}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: step === i ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)"
                                        }}
                                    >
                                        {desc}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* Active Form */}
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                bgcolor: "#fff",
                                borderRadius: 3,
                                border: "1px solid #e0e7f0",
                                p: 4,
                                overflow: "auto"
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 0.5 }}>
                                {stepContents[step].title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {stepContents[step].desc}
                            </Typography>
                            {stepContents[step].content}
                        </Box>

                        {/* Navigation */}
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Button
                                onClick={() => setStep(s => s - 1)}
                                disabled={step === 0}
                                startIcon={<ArrowBackIcon />}
                                sx={{ color: "#164799", textTransform: "none", fontWeight: 600 }}
                            >
                                Previous
                            </Button>
                            {step < 2 ? (
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={
                                        (step === 0 && (!form.name || !form.username || !form.password)) ||
                                        (step === 1 && (!form.position || !form.departmentId))
                                    }
                                    sx={{
                                        bgcolor: "#164799",
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        "&:hover": { bgcolor: "#0d2d66" }
                                    }}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        sx={{
                                            bgcolor: "#164799",
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 600,
                                            "&:hover": { bgcolor: "#0d2d66" },
                                            minWidth: 140
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create Employee"}
                                </Button>
                            )}
                        </Box>
                    </Box>

                </Box>
            </Box>
        </AppLayout>
    )
}