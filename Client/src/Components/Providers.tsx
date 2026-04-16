"use client"

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter"

const theme = createTheme({
    typography: {
        fontFamily: "Poppins, sans-serif",
    },
    palette: {
        primary: {
            main: "#164799"
        }
    }
})


export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppRouterCacheProvider>
    )
}