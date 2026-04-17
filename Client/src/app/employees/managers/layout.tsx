import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Managers | OrgChart",
}

export default function ManagersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}