"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/app/feed", label: "Dashboard", icon: "📊" },
    { href: "/app/profile", label: "Profile", icon: "👤" },
    { href: "/app/settings", label: "Settings", icon: "⚙️" },
];

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-lg items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-1 flex-col items-center justify-center gap-1.5 py-3 text-center transition-colors ${isActive
                                    ? "border-t-2 border-zinc-900 text-zinc-900"
                                    : "border-t-2 border-transparent text-zinc-600 hover:text-zinc-900"
                                }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs font-medium leading-tight">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
