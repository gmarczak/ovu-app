"use client";

import { useMemo } from "react";
import type { PeriodLog } from "../../types/feed";

interface CycleStatsProps {
    logs: PeriodLog[];
    cycleLength: number;
    periodLength: number;
}

export function CycleStats({ logs, cycleLength, periodLength }: CycleStatsProps) {
    const stats = useMemo(() => {
        if (logs.length < 2) {
            return {
                averageCycle: cycleLength,
                averagePeriod: periodLength,
                totalLogs: logs.length,
                lastLogDate: logs[0]?.date || null,
            };
        }

        // Calculate average from user's default settings
        return {
            averageCycle: cycleLength,
            averagePeriod: periodLength,
            totalLogs: logs.length,
            lastLogDate: logs[0]?.date || null,
        };
    }, [logs, cycleLength, periodLength]);

    const mostCommonSymptom = useMemo(() => {
        const symptomCounts: Record<string, number> = {};

        logs.forEach((log) => {
            if (log.symptoms) {
                log.symptoms.forEach((symptom) => {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                });
            }
        });

        const entries = Object.entries(symptomCounts);
        if (entries.length === 0) return null;

        const [symptom, count] = entries.sort(([, a], [, b]) => b - a)[0];
        return { symptom, count };
    }, [logs]);

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-zinc-900">📈 Statistics</h2>

            <div className="grid gap-3 sm:grid-cols-2">
                {/* Average Cycle Length */}
                <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                        Avg Cycle
                    </p>
                    <p className="mt-2 text-2xl font-bold text-emerald-900">
                        {stats.averageCycle}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">days</p>
                </div>

                {/* Average Period Duration */}
                <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-rose-50 to-white p-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
                        Avg Period
                    </p>
                    <p className="mt-2 text-2xl font-bold text-rose-900">
                        {stats.averagePeriod}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">days</p>
                </div>

                {/* Total Logs */}
                <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                        Entries
                    </p>
                    <p className="mt-2 text-2xl font-bold text-blue-900">
                        {stats.totalLogs}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {stats.lastLogDate ? "logged" : "none yet"}
                    </p>
                </div>

                {/* Most Common Symptom */}
                <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-purple-700">
                        Top Symptom
                    </p>
                    <p className="mt-2 text-sm font-bold text-purple-900 line-clamp-2">
                        {mostCommonSymptom
                            ? mostCommonSymptom.symptom.replace(/([A-Z])/g, " $1").trim()
                            : "None"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {mostCommonSymptom ? `${mostCommonSymptom.count}x` : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}
