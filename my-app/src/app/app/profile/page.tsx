"use client";

import { useEffect, useState } from "react";

import { BottomNav } from "../../../components/layout/BottomNav";
import { Header } from "../../../components/layout/Header";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../hooks/useAuth";
import type { Cycle } from "../../../types/feed";
import { getCycleProfile } from "../../../lib/db";

export default function ProfilePage() {
	const { user, loading, error } = useAuth();
	const [cycle, setCycle] = useState<Cycle>({
		cycleLength: 28,
		periodLength: 5,
		lastPeriodStart: null,
	});

	useEffect(() => {
		if (!user?.id) {
			return;
		}
		getCycleProfile(user.id).then((data) => setCycle(data));
	}, [user?.id]);

	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 pb-20">
			<Header title="Profile" subtitle="Your cycle basics" />
			<main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-6">
				<section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-base font-semibold text-zinc-900">Account</h2>
					<p className="mt-1 text-sm text-zinc-500">
						Personal details from your login.
					</p>
					<div className="mt-5 flex flex-col gap-3">
						{loading ? (
							<p className="text-sm text-zinc-600">Loading profile...</p>
						) : error ? (
							<p className="text-sm text-rose-600">{error}</p>
						) : user ? (
							<div className="flex flex-col gap-2 text-sm text-zinc-700">
								<div className="flex items-center justify-between">
									<span className="text-zinc-500">Email</span>
									<span className="font-medium text-zinc-900">{user.email}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-zinc-500">Name</span>
									<span className="font-medium text-zinc-900">
										{user.name ?? "—"}
									</span>
								</div>
							</div>
						) : (
							<p className="text-sm text-zinc-600">Not signed in.</p>
						)}
					</div>
				</section>

				<section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-base font-semibold text-zinc-900">Cycle profile</h2>
					<p className="mt-1 text-sm text-zinc-500">
						Your baseline used for predictions.
					</p>
					<div className="mt-5 grid gap-4">
						<Input
							label="Cycle length (days)"
							type="number"
							value={cycle.cycleLength}
							readOnly
						/>
						<Input
							label="Period length (days)"
							type="number"
							value={cycle.periodLength}
							readOnly
						/>
						<Input
							label="Last period start"
							type="date"
							value={cycle.lastPeriodStart ?? ""}
							readOnly
						/>
					</div>
				</section>
			</main>
			<BottomNav />
		</div>
	);
}
