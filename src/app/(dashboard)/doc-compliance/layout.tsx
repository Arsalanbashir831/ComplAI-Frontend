import type { ReactNode } from "react"


export default function DocComplianceLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="- min-h-screen   bg-[#F9F9FC]">
          
            <main className=" ">{children}</main>
        </div>
    )
}
