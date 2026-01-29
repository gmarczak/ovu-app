"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
	{ href: "/app/feed", label: "Dashboard" },
	{ href: "/app/feed#calendar", label: "Calendar" },
	{ href: "/app/feed#log", label: "Log" },
	{ href: "/app/profile", label: "Profile" },
];

export const BottomNav = () => {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex max-w-lg items-center justify-around px-6 py-3">
				{navItems.map((item) => {
					  const isActive = pathname === item.href.split("#")[0];
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
								isActive
									? "bg-zinc-900 text-white"
									: "text-zinc-600 hover:text-zinc-900"
							}`}
						>
							{item.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
};
