"use client";

import { useState } from "react";

import { BottomNav } from "../../../components/layout/BottomNav";
import { Header } from "../../../components/layout/Header";
import { Button } from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Input";

export default function SettingsPage() {
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [cycleGoal, setCycleGoal] = useState("balanced");
	const [reminderTime, setReminderTime] = useState("08:00");

	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 pb-20">
			<Header title="Settings" subtitle="Preferences and reminders" />
			<main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-6">
				<section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-base font-semibold text-zinc-900">Notifications</h2>
					<p className="mt-1 text-sm text-zinc-500">
						Get gentle reminders for your cycle.
					</p>
					<div className="mt-5 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-zinc-900">Cycle reminders</p>
							<p className="text-xs text-zinc-500">
								Period and fertile window updates
							</p>
						</div>
						<button
							type="button"
							className={`relative h-7 w-12 rounded-full transition-colors ${
								notificationsEnabled ? "bg-emerald-500" : "bg-zinc-300"
							}`}
							onClick={() => setNotificationsEnabled((prev) => !prev)}
						>
							<span
								className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
									notificationsEnabled ? "translate-x-5" : "translate-x-1"
								}`}
							/>
						</button>
					</div>
					<div className="mt-4">
						<Input
							label="Reminder time"
							type="time"
							value={reminderTime}
							onChange={(event) => setReminderTime(event.target.value)}
						/>
					</div>
				</section>

				<section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
					<h2 className="text-base font-semibold text-zinc-900">Cycle preferences</h2>
					<p className="mt-1 text-sm text-zinc-500">
						Choose the focus that fits your goals.
					</p>
					<div className="mt-4">
						<Select
							label="Tracking focus"
							value={cycleGoal}
							onChange={(event) => setCycleGoal(event.target.value)}
							options={[
								{ label: "Balanced overview", value: "balanced" },
								{ label: "Period tracking", value: "period" },
								{ label: "Energy planning", value: "energy" },
							]}
						/>
					</div>
					<Button className="mt-4" variant="secondary">
						Save settings
					</Button>
				</section>
			</main>
			<BottomNav />
		</div>
	);
}
