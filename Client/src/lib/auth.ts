export interface AuthUser {
    id: number
    name: string
    username: string
    position: string
    role: string
    department: { id: number; name: string }
}

const isBrowser = typeof window !== "undefined"

export const auth = {
    save(token: string, user: AuthUser) {
        if (!isBrowser) return
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 8}`
    },
    getToken(): string | null {
        if (!isBrowser) return null
        return localStorage.getItem("token")
    },
    getUser(): AuthUser | null {
        if (!isBrowser) return null
        const u = localStorage.getItem("user")
        return u ? JSON.parse(u) : null
    },
    clear() {
        if (!isBrowser) return
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        document.cookie = "token=; path=/; max-age=0"
    },
    isLoggedIn(): boolean {
        return !!this.getToken()
    },
    saveAvatar(avatarId: string) {
        if (!isBrowser) return
        localStorage.setItem("avatarId", avatarId)
    },
    getAvatar(): string | null {
        if (!isBrowser) return null
        return localStorage.getItem("avatarId")
    }
}