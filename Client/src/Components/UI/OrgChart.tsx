"use client"

import { useState, useEffect } from 'react';
import { apiFetch } from "@/lib/api";
import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import OrgNode from "./OrgNode";
import BusinessIcon from "@mui/icons-material/Business"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

interface Employee {
    id: number
    name: string
    position: string
    manager: { id: number; name: string; position?: string } | null
    subordinates?: Employee[]
    department: { id: number; name: string }
}

interface Department {
    id: number
    name: string
}

function buildTree(employees: Employee[]): Employee[] {
    const map = new Map<number, Employee>()
    employees.forEach((e) => map.set(e.id, { ...e, subordinates: [] }))

    const roots: Employee[] = []
    map.forEach((emp) => {
        if (!emp.manager) {
            roots.push(emp)
        } else {
            const parent = map.get(emp.manager.id)
            if (parent) parent.subordinates!.push(emp)
            else roots.push(emp)
        }
    })
    return roots
}

function flatCount(emp: Employee): Employee[] {
    return [emp, ...(emp.subordinates ?? []).flatMap(flatCount)]
}

export default function OrgChart() {
    const [depts, setDepts] = useState<Department[]>([])
    const [allEmployees, setAllEmployees] = useState<Employee[]>([])
    const [trees, setTrees] = useState<Record<number, Employee[]>>({})
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<Record<number, boolean>>({})
    const toggle = (id: number) => setExpanded(prev => ({
        ...prev, [id]: !prev[id]
    }))

    useEffect(() => {
        const load = async () => {
            const [deptRes, empRes] = await Promise.all([
                apiFetch("/api/Departments"),
                apiFetch("/api/Employees")
            ])
            if (!deptRes.ok || !empRes.ok) return
            
            const deptData: Department[] = await deptRes.json()
            const empData: Employee[] = await empRes.json()

            setDepts(deptData)
            setAllEmployees(empData)

            const globalMap = new Map<number, Employee>()
            empData.forEach(e => globalMap.set(e.id, { ...e, subordinates: [] }))

            const treeMap: Record<number, Employee[]> = {}
            deptData.forEach(d => treeMap[d.id] = [])

            globalMap.forEach(emp => {
                if (!emp.manager) {
                    treeMap[emp.department.id]?.push(emp)
                } else {
                    const parent = globalMap.get(emp.manager.id)
                    const sameDept = parent?.department.id === emp.department.id

                    if (parent && sameDept) {
                        parent.subordinates!.push(emp)
                    } else {
                        treeMap[emp.department.id]?.push(emp)
                    }
                }
            })

            globalMap.forEach(emp => {
                if (emp.manager) {
                    const managerData = globalMap.get(emp.manager.id)
                    if (managerData) {
                        emp.manager = {
                            ...emp.manager,
                            position: managerData.position
                        }
                    }
                }
            })

            setTrees(treeMap)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
            <CircularProgress sx={{ color: "#164799"}} />
        </Box>
    )

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {depts.map((dept) => {
                const isOpen = !!expanded[dept.id]
                const memberCount = trees[dept.id]?.flatMap(flatCount).length ?? 0
                    
                return (
                    <Box
                        key={dept.id}
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: isOpen ? "#164799" : "#e0e7f0",
                            overflow: "hidden",
                            transition: "border-color 0.2s"
                        }}
                    >
                        <Box
                            onClick={() => toggle(dept.id)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 3,
                                py: 2,
                                cursor: "pointer",
                                bgcolor: isOpen ? "#164799" : "#fff",
                                transition: "background-color 0.2s",
                                "&:hover": { bgcolor: isOpen ? "#0d2d66" : "#f5f7fa" }
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <BusinessIcon sx={{ color: isOpen ? "#fff" : "#164799", fontSize: 22 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: isOpen ? "#fff" : "#0d1b2e" }}>
                                    {dept.name}
                                </Typography>
                                <Chip
                                    label={`${memberCount} members`}
                                    size="small"
                                    sx={{
                                        bgcolor: isOpen ? "rgba(255,255,255,0.2)" : "#e8edf7",
                                        color: isOpen ? "#fff" : "#164799",
                                        fontWeight: 600,
                                        fontSize: "0.72rem"
                                    }}
                                />
                            </Box>
                            <Box
                                sx={{
                                    color: isOpen ? "#fff" : "#164799",
                                    transition: "transform 0.3s",
                                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    display: "flex"
                                }}
                            >
                                <KeyboardArrowDownIcon />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                maxHeight: isOpen ? 1000 : 0,
                                overflow: "hidden",
                                transition: "max-height 0.4s ease"
                            }}
                        >
                            <Box sx={{ p: 3, overflowX: "auto" }}>
                                <Box sx={{ display: "flex", gap: 4, width: "fit-content", mx: "auto" }}>
                                    {(trees[dept.id] ?? []).map((root) => (
                                        <OrgNode key={root.id} emp={root} homeDeptId={dept.id} isTreeRoot />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )
            })}
        </Box>
    )
}