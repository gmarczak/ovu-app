"use client";

import { Trash2 } from "lucide-react";
import { symptomLabels } from "../../hooks/useSwipe";
import type { PeriodLog } from "../../types/feed";

type DayPreviewCardProps = {
	log: PeriodLog;
	cycleDay?: number;
	onEdit: () => void;
	onDelete: () => void;
};

const symptomIcons: Record<string, string> = {
	cramps: "😖",
	backPain: "🔙",
	headache: "🤕",
	bloating: "💨",
	breastTenderness: "🤱",
	fatigue: "😴",
	irritability: "😤",
	lowFocus: "🌫️",
};

const moodEmojis = {
	bad: "😢",
	neutral: "😐",
	good: "😊",
};

const bleedingColors = {
	light: "bg-rose-200",
	medium: "bg-rose-400",
	heavy: "bg-rose-600",
};

export const DayPreviewCard = ({ log, cycleDay, onEdit, onDelete }: DayPreviewCardProps) => {
	const displayDate = new Date(log.date + "T00:00:00").toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	});

	return (
		<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<div>
					<h3 className="text-base font-semibold text-zinc-900">{displayDate}</h3>
					<div className="flex items-center gap-3 mt-2">
						{/* Cycle Day */}
						{cycleDay && (
							<div className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100">
								<span className="text-xs font-semibold text-indigo-700">Day {cycleDay}</span>
							</div>
						)}
						{/* Mood */}
						<div className="flex items-center gap-1">
							<span className="text-lg">{moodEmojis[log.mood || "neutral"]}</span>
							<span className="text-xs text-zinc-500 capitalize">{log.mood || "Neutral"}</span>
						</div>
						{/* Bleeding */}
						{log.bleedingIntensity && (
							<div className="flex items-center gap-1">
								<span className={`h-2 w-2 rounded-full ${bleedingColors[log.bleedingIntensity]}`} />
								<span className="text-xs text-zinc-500 capitalize">{log.bleedingIntensity}</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Symptoms */}
			{log.symptoms && log.symptoms.length > 0 && (
				<div className="mb-4">
					<p className="text-xs font-medium text-zinc-500 mb-2">Symptoms ({log.symptoms.length})</p>
					<div className="flex flex-wrap gap-2">
						{log.symptoms.slice(0, 6).map((symptom) => (
							<div
								key={symptom}
								className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
							>
								<span>{symptomIcons[symptom] || "🔹"}</span>
								<span>{symptomLabels[symptom as keyof typeof symptomLabels] || symptom}</span>
							</div>
						))}
						{log.symptoms.length > 6 && (
							<div className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600">
								+{log.symptoms.length - 6} more
							</div>
						)}
					</div>
				</div>
			)}

			{/* Notes Preview */}
			{log.notes && (
				<div className="mb-4">
					<p className="text-xs font-medium text-zinc-500 mb-1">Notes</p>
					<p className="text-sm text-zinc-700 line-clamp-2">{log.notes}</p>
				</div>
			)}

			{/* Action Buttons */}
			<div className="grid grid-cols-2 gap-3">
				<button
					onClick={onEdit}
					className="rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md transition-all active:scale-98"
				>
					✏️ Edit Log
				</button>
				<button
					onClick={onDelete}
					className="rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-rose-600 hover:to-rose-700 shadow-md transition-all active:scale-98 flex items-center justify-center gap-1"
				>
					<Trash2 size={16} />
					Delete
				</button>
			</div>
		</div>
	);
};
