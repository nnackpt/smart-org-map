import { Avatar, Box, Typography } from '@mui/material';

interface Employee {
    id: number
    name: string
    position: string
    manager: { id: number; name: string } | null
    subordinates?: Employee[]
}

export default function OrgNode({ emp, isRoot = false }: { emp: Employee; isRoot?: boolean }) {
    const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    const hasChildren = emp.subordinates && emp.subordinates.length > 0

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Card */}
            <Box
                sx={{
                    bgcolor: isRoot ? "#164799" : "#fff",
                    border: isRoot ? "none" : "1px solid #e0e7f0",
                    borderRadius: 2.5,
                    px: 2.5,
                    py: 1.5,
                    minWidth: 150,
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: isRoot ? "rgba(255,255,255,0.2)" : "#e8edf7",
                        color: isRoot ? "#fff" : "#164799",
                        width: 36,
                        height: 36,
                        fontSize: 13,
                        fontWeight: 700
                    }}
                >
                    {initials}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} color={isRoot ? "#fff" : "#0d1b2e"}>
                    {emp.name}
                </Typography>
                <Typography variant="caption" color={isRoot ? "rgba(255,255,255,0.75)" : "text.secondary"}>
                    {emp.position}
                </Typography>
            </Box>

            {/* Line down */}
            {hasChildren && (
                <Box sx={{ width: 2, height: 24, bgcolor: "#c5d3e8" }} />
            )}

            {/* Children */}
            {hasChildren && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 0,
                        position: "relative"
                    }}
                >
                    {emp.subordinates!.length > 1 && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: "50%",
                                transform: "translateX(-50%)",
                                height: 2,
                                bgcolor: "#c5d3e8",
                                width: `calc(100% - 80px)`
                            }}
                        />
                    )}
                    {emp.subordinates!.map((sub) => (
                        <Box
                            key={sub.id}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                px: 2
                            }}
                        >
                            <Box sx={{ width: 2, height: 24, bgcolor: "#c5d3e8" }} />
                            <OrgNode emp={sub} />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}