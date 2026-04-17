import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Employee | OrgChart",
}

export default function EditEmployeeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}