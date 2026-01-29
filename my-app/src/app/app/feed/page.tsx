"use client";

import { useMemo, useState } from "react";

import { LogActions } from "../../../components/feed/FeedActions";
import { CalendarGrid } from "../../../components/feed/SwipeCard";
import { CycleStatusCard, PredictionCard } from "../../../components/feed/FeedCard";
import { BottomNav } from "../../../components/layout/BottomNav";
import { Header } from "../../../components/layout/Header";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../hooks/useAuth";
import { symptomLabels, useCycle, usePeriodLog } from "../../../hooks/useSwipe";
import type { PeriodLog, Symptom } from "../../../types/feed";

export default function FeedPage() {
	const { user } = useAuth();
	const [cycleLength, setCycleLength] = useState(28);
	const [periodLength, setPeriodLength] = useState(5);
	const [lastPeriodStart, setLastPeriodStart] = useState<string | null>(null);
	const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
	const [notes, setNotes] = useState("");
	const { logs, addLog } = usePeriodLog();

	const cycle = useMemo(
		() => ({ cycleLength, periodLength, lastPeriodStart }),
		[cycleLength, periodLength, lastPeriodStart]
	);
	const { cycleDay, phase, daysUntilNextPeriod, nextPeriodStart, fertileWindow } =
		useCycle(cycle);

	const handleLogStart = () => {
		const today = new Date().toISOString().slice(0, 10);
		setLastPeriodStart(today);
		addLog({
			userId: user?.id ?? null,
			startDate: today,
			symptoms: selectedSymptoms,
			notes: notes || undefined,
		});
	};

	const handleLogEnd = () => {
		if (!logs[0]) {
			return;
		}
		const today = new Date().toISOString().slice(0, 10);
		const lastLog = logs[0] as PeriodLog;
		addLog({
			userId: user?.id ?? null,
			startDate: lastLog.startDate,
			endDate: today,
			symptoms: lastLog.symptoms,
			notes: lastLog.notes,
		});
	};

	const now = new Date();
	const month = now.getMonth();
	const year = now.getFullYear();
	const periodDays = lastPeriodStart
		? Array.from({ length: periodLength }, (_, i) => {
				const date = new Date(lastPeriodStart);
				date.setDate(date.getDate() + i);
				return date.getMonth() === month ? date.getDate() : -1;
			}).filter((day) => day > 0)
		: [];
	const fertileDays = fertileWindow
		? Array.from({ length: 5 }, (_, i) => {
				const date = new Date(fertileWindow.start);
				date.setDate(date.getDate() + i);
				return date.getMonth() === month ? date.getDate() : -1;
			}).filter((day) => day > 0)
		: [];

	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 pb-20">
			<Header title="Dashboard" subtitle="Your cycle overview" />
			<main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-6">
				<CycleStatusCard
					cycleDay={cycleDay}
					phase={phase}
					daysUntilNextPeriod={daysUntilNextPeriod}
				/>
				<PredictionCard
					nextPeriodStart={nextPeriodStart}
					fertileWindow={fertileWindow}
				/>

				<section id="calendar" className="flex flex-col gap-3">
					<h2 className="text-base font-semibold text-zinc-900">Calendar</h2>
					<CalendarGrid
						month={month}
						year={year}
						periodDays={periodDays}
						fertileDays={fertileDays}
					/>
				</section>

				<section id="log" className="flex flex-col gap-4">
					<h2 className="text-base font-semibold text-zinc-900">Log today</h2>
					<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
						<div className="grid gap-4">
							<Input
								label="Notes"
								placeholder="How are you feeling today?"
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
							/>
							<div>
								<p className="text-sm font-medium text-zinc-700">Symptoms</p>
								<div className="mt-2 grid grid-cols-2 gap-2">
									{(Object.keys(symptomLabels) as Symptom[]).map((symptom) => {
										const isSelected = selectedSymptoms.includes(symptom);
										return (
											<label
												key={symptom}
												className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition-colors ${
													isSelected
														? "border-emerald-300 bg-emerald-50 text-emerald-700"
														: "border-zinc-200 text-zinc-600"
												}`}
											>
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() =>
														setSelectedSymptoms((prev) =>
															prev.includes(symptom)
																? prev.filter((item) => item !== symptom)
																: [...prev, symptom]
														)
													}
													className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-200"
												/>
												{symptomLabels[symptom]}
											</label>
										);
									})}
								</div>
							</div>
							<LogActions onStart={handleLogStart} onEnd={handleLogEnd} />
							<div className="text-xs text-zinc-500">
								Logs are stored locally for this session.
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
					<h2 className="text-base font-semibold text-zinc-900">Cycle settings</h2>
					<p className="mt-1 text-sm text-zinc-500">
						Adjust your cycle lengths for more accurate predictions.
					</p>
					<div className="mt-4 grid gap-4">
						<Input
							label="Cycle length (days)"
							type="number"
							min={20}
							max={45}
							value={cycleLength}
							onChange={(event) => setCycleLength(Number(event.target.value))}
						/>
						<Input
							label="Period length (days)"
							type="number"
							min={2}
							max={10}
							value={periodLength}
							onChange={(event) => setPeriodLength(Number(event.target.value))}
						/>
						<Input
							label="Last period start"
							type="date"
							value={lastPeriodStart ?? ""}
							onChange={(event) =>
								setLastPeriodStart(event.target.value || null)
							}
						/>
						<Button variant="secondary">Save preferences</Button>
					</div>
				</section>
			</main>
			<BottomNav />
		</div>
	);
}
