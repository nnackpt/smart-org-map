"use client"

import EditIcon from "@mui/icons-material/Edit"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SaveIcon from "@mui/icons-material/Save"
import DeleteIcon from "@mui/icons-material/Delete"
import { useRouter } from "next/navigation"
import { useState, useEffect, startTransition } from 'react';
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import AppLayout from "@/Components/AppLayout"
import { Alert, Autocomplete, Avatar, Box, Button, CircularProgress, Divider, IconButton, Snackbar, Tab, Tabs, TextField, Typography } from "@mui/material"
import Toast from "@/Components/UI/Toast"

interface Employee {
    id: number
    name: string
    position: string
    department: { id: number; name: string }
    manager: { id: number; name: string } | null
}

interface Department { id: number; name: string }

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        bgcolor: "#fff",
        "&.Mui-focused fieldset": { borderColor: "#164799" }
    },
    "& label.Mui-focused": { color: "#164799" }
}

const initails = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

export default function EditEmployee() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [tab, setTab] = useState(0)

    // Employee tab
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectEmp, setSelectEmp] = useState<Employee | null>(null)
    const [position, setPosition] = useState("")
    const [depts, setDepts] = useState<Department[]>([])
    const [selectedDept, setSelectedDept] = useState<Department | null>(null)
    const [empLoading, setEmpLoading] = useState(false)
    const [empError, setEmpError] = useState("")
    const [empSuccess, setEmpSuccess] = useState("")

    // Department tab
    const [editDept, setEditDept] = useState<Department | null>(null)
    const [deptName, setDeptName] = useState("")
    const [deptLoading, setDeptLoading] = useState(false)
    const [deptError, setDeptError] = useState("")
    const [deptSuccess, setDeptSuccess] = useState("")
    const [newDeptName, setNewDeptName] = useState("")
    const [createLoading, setCreateLoading] = useState(false)

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

        Promise.all([
            apiFetch("/api/Employees")
                .then(r => r.ok ? r.json() : []),
            apiFetch("/api/Departments")
                .then(r => r.ok ? r.json() : [])
        ]).then(([emps, depts]) => {
            setEmployees(emps)
            setDepts(depts)
        })

        startTransition(() => setMounted(true))
    }, [])

    const user = mounted ? auth.getUser() : null
    if (!mounted || !user) return null

    const handleSelectEmp = (emp: Employee | null) => {
        setSelectEmp(emp)
        setPosition(emp?.position ?? "")
        setSelectedDept(emp ? depts.find(d => d.id === emp.department.id) ?? null : null)
        setEmpError("")
        setEmpSuccess("")
    }

    const handleUpdateEmp = async () => {
        if (!selectEmp || !selectedDept) return
        setEmpLoading(true)
        setEmpError("")
        setEmpSuccess("")
        try {
            const res = await apiFetch(`/api/Employees/${selectEmp.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: selectEmp.name,
                    position,
                    departmentId: selectedDept.id,
                    managerId: selectEmp.manager?.id ?? null
                })
            })
            if (!res.ok) {
                try {
                    const err = await res.json()
                    setEmpError(err.message ?? "Failed.")
                } catch {
                    setEmpError(`Error ${res.status}`)
                }
                return
            }
            setEmpSuccess("Employee updated successfully.")
            setEmployees(prev => prev.map(e =>
                e.id === selectEmp.id
                    ? { ...e, position, department: selectedDept }
                    : e
            ))
            setSelectEmp(prev => prev ? { ...prev, position, department: selectedDept } : null)
        } finally {
            setEmpLoading(false)
        }
    }

    const handleUpdateDept = async () => {
        if (!editDept || !deptName.trim()) return
        setDeptLoading(true)
        setDeptError("")
        setDeptSuccess("")
        try {
            const res = await apiFetch(`/api/Departments/${editDept.id}`, {
                method: "PUT",
                body: JSON.stringify({ name: deptName.trim() })
            })
            if (!res.ok) {
                try {
                    const err = await res.json()
                    setDeptError(err.message ?? "Failed.")
                } catch {
                    setDeptError(`Error ${res.status}`)
                }
                return
            }
            setDeptSuccess(`Department renamed to "${deptName}".`)
            setDepts(prev => prev.map(
                d => d.id === editDept.id 
                    ? { ...d, name: deptName.trim() }
                    : d
            ))
            setEditDept(prev => prev
                ? { ...prev, name: deptName.trim() }
                : null
            )
        } finally {
            setDeptLoading(false)
        }
    }

    const handleCreateDept = async () => {
        if (!newDeptName.trim()) return
        setCreateLoading(true)
        try {
            const res = await apiFetch("/api/Departments", {
                method: "POST",
                body: JSON.stringify({ name: newDeptName.trim() })
            })
            if (!res.ok) return
            const created: Department = await res.json()
            setDepts(prev => [...prev, created])
            setNewDeptName("")
            setDeptSuccess(`Department "${created.name}" created.`)
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDeleteDept = async (dept: Department) => {
        if (!confirm(`Delete "${dept.name}"?`)) return
        const res = await apiFetch(`/api/Departments/${dept.id}`, {
            method: "DELETE"
        })
        if (res.ok) {
            setDepts(prev => prev.filter(d => d.id !== dept.id))
            if (editDept?.id === dept.id) {
                setEditDept(null)
                setDeptName("")
            }
            setDeptSuccess(`Deleted "${dept.name}".`)
        }
    }

    return (
        <AppLayout user={user}>
            <Box sx={{ height: "100%", overflow: "auto", p: 4 }}>
                <Box sx={{ maxWidth: tab === 0 ? 600 : "100%", mx: "auto" }}>
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
                            <EditIcon sx={{ color: "#fff" }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d1b2e" }}>
                                Edit Employee
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Update position, department info
                            </Typography>
                        </Box>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            mb: 3,
                            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
                            "& .Mui-selected": { color: "#164799" },
                            "& .MuiTabs-indicator": { bgcolor: "#164799" }
                        }}
                    >
                        <Tab label="Employee Info" />
                        <Tab label="Departments" /> 
                    </Tabs>

                    {/* Tab 0 - Employee */}
                    {tab === 0 && (
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
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 1.5 }}>
                                    1. Select Employee
                                </Typography>
                                <Autocomplete
                                    options={employees}
                                    getOptionLabel={e => e.name}
                                    value={selectEmp}
                                    onChange={(_, v) => handleSelectEmp(v)}
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
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: "#164799", fontSize: 12, fontWeight: 600 }}>
                                                {initails(e.name)}
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
                                    renderInput={params => <TextField {...params} label="Seach employee" sx={inputSx} />}
                                />
                            </Box>

                            {selectEmp && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 1.5 }}>
                                            2. Edit Info
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            <TextField
                                                label="Position"
                                                fullWidth
                                                value={position}
                                                onChange={e => setPosition(e.target.value)}
                                                sx={inputSx}
                                            />
                                            <Autocomplete
                                                options={depts}
                                                getOptionLabel={d => d.name}
                                                value={selectedDept}
                                                onChange={(_, v) => setSelectedDept(v)}
                                                renderInput={params => <TextField {...params} label="Department" sx={inputSx} />}
                                            />
                                        </Box>
                                    </Box>

                                    {empError && (
                                        <Toast
                                            open={!!empError}
                                            onClose={() => setEmpError("")}
                                            message={empError}
                                            type="error"
                                        />
                                    )}
                                    {empSuccess && (
                                        <Toast
                                            open={!!empSuccess}
                                            onClose={() => setEmpSuccess("")}
                                            message={empSuccess}
                                            type="success"
                                        />
                                    )}

                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleUpdateEmp}
                                        disabled={empLoading || !position || !selectedDept}
                                        sx={{
                                            bgcolor: "#164799",
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 600,
                                            "&:hover": { bgcolor: "#0d2d66" }
                                        }}
                                    >
                                        {empLoading ? <CircularProgress size={20} sx={{ color: "#fff " }} /> : "Save Changes"}
                                    </Button>
                                </>
                            )}
                        </Box>
                    )}

                    {/* Tab 1 - Departments */}
                    {tab === 1 && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Create new */}
                            <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #e0e7f0", p: 4 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0d1b2e", mb: 2 }}>
                                    Create New Department
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
                                    <TextField
                                        label="Department Name"
                                        fullWidth
                                        value={newDeptName}
                                        onChange={e => setNewDeptName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter")
                                                handleCreateDept()
                                        }}
                                        sx={inputSx}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleCreateDept}
                                        disabled={createLoading || !newDeptName.trim()}
                                        sx={{
                                            bgcolor: "#164799",
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 600,
                                            py: 1.2,
                                            "&:hover": { bgcolor: "#0d2d66" }
                                        }}
                                    >
                                        {createLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Add"}
                                    </Button>
                                </Box>
                            </Box>

                            {/* Edit existing */}
                            <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #e0e7f0", p: 3 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0d1b2e" }}>
                                    Edit / Delete Department
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                                    {depts.map(d => (
                                        <Box
                                            key={d.id}
                                            onClick={() => {
                                                setEditDept(d)
                                                setDeptName(d.name)
                                                setDeptError("")
                                                setDeptSuccess("")
                                            }}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                px: 2,
                                                py: 1.2,
                                                borderRadius: 2,
                                                cursor: "pointer",
                                                border: "1px solid",
                                                borderColor: editDept?.id === d.id ? "#164799" : "#e0e7f0",
                                                bgcolor: editDept?.id === d.id ? "#e8edf7" : "#f5f7fa",
                                                transition: "all 0.15s"
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: editDept?.id === d.id ? 700 : 500 }}
                                                color={editDept?.id === d.id ? "#164799" : "#0d1b2e"}
                                            >
                                                {d.name}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    handleDeleteDept(d)
                                                }}
                                                sx={{ color: "#d32f2f", "&:hover": { bgcolor: "#fff5f5" } }}
                                                aria-label={`Delete ${d.name}`}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>

                                {editDept && (
                                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                                        <TextField
                                            size="small"
                                            label="New Name"
                                            fullWidth
                                            value={deptName}
                                            onChange={e => setDeptName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") 
                                                    handleUpdateDept()
                                            }}
                                            sx={inputSx}
                                        />
                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={handleUpdateDept}
                                            disabled={deptLoading || !deptName.trim()}
                                            sx={{
                                                bgcolor: "#164799",
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                minWidth: 90,
                                                "&:hover": { bgcolor: "#0d2d66" }
                                            }}
                                        >
                                            {deptLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save"}
                                        </Button>
                                    </Box>
                                )}

                                {deptError && (
                                    <Toast
                                        open={!!deptError}
                                        onClose={() => setDeptError("")}
                                        message={deptError}
                                        type="error"
                                    />
                                )}
                                {deptSuccess && (
                                    <Toast
                                        open={!!deptSuccess}
                                        onClose={() => setDeptSuccess("")}
                                        message={deptSuccess}
                                        type="success"
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </AppLayout>
    )
}