"use client";

import type { CyclePhase } from "../../types/feed";

type CycleProgressProps = {
    cycleDay: number;
    cycleLength: number;
    phase: CyclePhase;
    daysUntilNextPeriod: number;
};

const phaseLabels: Record<CyclePhase, string> = {
    menstrual: "Menstrual",
    follicular: "Follicular",
    ovulation: "Ovulation",
    luteal: "Luteal",
};

const phaseColors: Record<CyclePhase, { bg: string; accent: string; ring: string }> = {
    menstrual: {
        bg: "from-rose-50 to-pink-50",
        accent: "text-rose-600",
        ring: "ring-rose-200 bg-rose-100",
    },
    follicular: {
        bg: "from-emerald-50 to-teal-50",
        accent: "text-emerald-600",
        ring: "ring-emerald-200 bg-emerald-100",
    },
    ovulation: {
        bg: "from-orange-50 to-amber-50",
        accent: "text-orange-600",
        ring: "ring-orange-200 bg-orange-100",
    },
    luteal: {
        bg: "from-purple-50 to-indigo-50",
        accent: "text-purple-600",
        ring: "ring-purple-200 bg-purple-100",
    },
};

export const CycleProgress = ({
    cycleDay,
    cycleLength,
    phase,
    daysUntilNextPeriod,
}: CycleProgressProps) => {
    const progress = (cycleDay / cycleLength) * 100;
    const radius = 55; // Reduced from 70
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const colors = phaseColors[phase];

    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full">
            {/* Circular Progress - Smaller */}
            <div className="relative flex items-center justify-center">
                <svg width="130" height="130" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="65"
                        cy="65"
                        r={radius}
                        fill="none"
                        stroke="rgba(0,0,0,0.05)"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="65"
                        cy="65"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={colors.accent}
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                </svg>
                {/* Center content - Smaller font */}
                <div className="absolute flex flex-col items-center justify-center gap-0.5">
                    <div className="text-4xl font-bold text-zinc-900">{cycleDay}</div>
                    <div className="text-xs font-medium text-zinc-600">
                        of {cycleLength} days
                    </div>
                </div>
            </div>

            {/* Phase badge - Directly under cycle wheel for centered focal point */}
            <div className="flex flex-col items-center gap-2.5">
                <div className={`rounded-full ${colors.ring} px-4 py-1.5 text-xs font-semibold ${colors.accent}`}>
                    {phaseLabels[phase]}
                </div>
                <p className="text-center text-xs text-zinc-600 leading-snug max-w-xs">
                    {daysUntilNextPeriod === 1
                        ? "Next period tomorrow"
                        : `Next period in ${daysUntilNextPeriod} days`}
                </p>
            </div>
        </div>
    );
};
