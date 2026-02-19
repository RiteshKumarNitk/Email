"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Middleware handles protection now.

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 overflow-auto p-6 bg-gray-50/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
