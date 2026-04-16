"use client"

import { apiFetch } from "@/lib/api";
import BusinessIcon from "@mui/icons-material/Business"
import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import { useState, useEffect } from 'react';
import OrgNode from "./OrgNode";

interface Employee {
    id: number
    name: string
    position: string
    manager: { id: number; name: string } | null
    subordinates?: Employee[]
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
    const [trees, setTrees] = useState<Record<number, Employee[]>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const deptRes = await apiFetch("/api/Departments")
            if (!deptRes.ok) return
            const deptData: Department[] = await deptRes.json()
            setDepts(deptData)

            const treeMap: Record<number, Employee[]> = {}
            await Promise.all(
                deptData.map(async (d) => {
                    const res = await apiFetch(`/api/Departments/${d.id}/employees`)
                    if (!res.ok) return
                    const emps: Employee[] = await res.json()
                    treeMap[d.id] = buildTree(emps)
                })
            )
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {depts.map((dept) => (
                <Box key={dept.id}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 3
                        }}
                    >
                        <BusinessIcon sx={{ color: "#164799" }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d1b2e" }}>
                            {dept.name}
                        </Typography>
                        <Chip
                            label={`${trees[dept.id]?.flatMap(flatCount).length ?? 0} members`}
                            size="small"
                            sx={{
                                bgcolor: "#e8edf7",
                                color: "#164799",
                                fontWeight: 600
                            }}
                        />
                    </Box>
                    <Box sx={{ overflowX: "auto", pb: 2 }}>
                        <Box sx={{ display: "flex", gap: 4, width: "fit-content", mx: "auto" }}>
                            {(trees[dept.id] ?? []).map((root) => (
                                <OrgNode key={root.id} emp={root} isRoot />
                            ))}
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    )
}