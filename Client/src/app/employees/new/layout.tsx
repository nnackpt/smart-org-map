import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create New Employee | OrgChart",
}

export default function NewEmployeeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}