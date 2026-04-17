import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Employee Password | OrgChart",
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}