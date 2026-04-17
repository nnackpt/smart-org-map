import { Avatar, Box, Typography } from '@mui/material';

interface Employee {
    id: number
    name: string
    position: string
    manager: { id: number; name: string; position?: string } | null
    subordinates?: Employee[]
    department: { id: number; name: string }
}

export default function OrgNode({ emp, homeDeptId, isTreeRoot = false }: {
    emp: Employee
    homeDeptId: number
    isTreeRoot?: boolean
}) {
    const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    const hasChildren = emp.subordinates && emp.subordinates.length > 0

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Cross-dept manager card */}
            {emp.manager && isTreeRoot && (
                <>
                    <Box
                        sx={{
                            bgcolor: "#f0f4ff",
                            border: "1px dashed #164799",
                            borderRadius: 2.5,
                            px: 2.5,
                            py: 1.5,
                            minWidth: 150,
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: "#164799",
                                color: "#fff",
                                width: 30,
                                height: 30,
                                fontSize: 11,
                                fontWeight: 700
                            }}
                        >
                            {emp.manager.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#164799" }}>
                            {emp.manager.name}
                        </Typography>
                        {emp.manager.position && (
                            <Typography variant="caption" sx={{ fontSize: "0.62rem", color: "#164799", opacity: 0.7 }}>
                                {emp.manager.position}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            width: 2,
                            height: 20,
                            bgcolor: "#164799",
                            opacity: 0.4
                        }}
                    />
                </>
            )}

            {/* Card */}
            <Box
                sx={{
                    bgcolor: "#fff",
                    border: "1px solid #e0e7f0",
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
                        bgcolor: "#e8edf7",
                        color: "#164799",
                        width: 36,
                        height: 36,
                        fontSize: 13,
                        fontWeight: 700
                    }}
                >
                    {initials}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} color={"#0d1b2e"}>
                    {emp.name}
                </Typography>
                <Typography variant="caption" color={"text.secondary"}>
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
                            <OrgNode emp={sub} homeDeptId={homeDeptId} />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}