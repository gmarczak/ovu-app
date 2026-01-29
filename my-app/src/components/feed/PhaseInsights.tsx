"use client";

import type { CyclePhase } from "../../types/feed";
import { Activity } from "lucide-react";

type PhaseInsightsProps = {
	phase: CyclePhase;
	cycleDay: number;
};

const phaseInsights: Record<CyclePhase, { emoji: string; title: string; tip: string }> = {
	menstrual: {
		emoji: "🩸",
		title: "Menstrual Phase",
		tip: "Rest and recovery time. Stay hydrated and practice gentle movement like yoga or walking.",
	},
	follicular: {
		emoji: "🌱",
		title: "Follicular Phase",
		tip: "Your energy is rising! This is a great time for workouts, new projects, and social activities.",
	},
	ovulation: {
		emoji: "✨",
		title: "Ovulation Phase",
		tip: "Peak confidence and energy! Perfect time for important meetings and challenging tasks.",
	},
	luteal: {
		emoji: "🌙",
		title: "Luteal Phase",
		tip: "Slow down and focus inward. Great for planning, reflection, and self-care routines.",
	},
};

export const PhaseInsights = ({ phase, cycleDay }: PhaseInsightsProps) => {
	const insight = phaseInsights[phase];

	return (
		<div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm">
			<div className="flex items-start gap-3">
				<div className="text-3xl">{insight.emoji}</div>
				<div className="flex-1">
					<h3 className="text-sm font-semibold text-zinc-900">{insight.title}</h3>
					<p className="mt-1 text-xs text-zinc-600 leading-relaxed">{insight.tip}</p>
					<p className="mt-2 text-xs font-medium text-zinc-500">Day {cycleDay}</p>
				</div>
			</div>
		</div>
	);
};
