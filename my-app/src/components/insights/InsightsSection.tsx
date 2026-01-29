"use client";

import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PeriodLog, Mood, Symptom } from "../../types/feed";

interface InsightsSectionProps {
    logs: PeriodLog[];
}

interface MoodDataPoint {
    date: string;
    mood: number | null;
    moodLabel: string;
}

export function InsightsSection({ logs }: InsightsSectionProps) {
    // Calculate mood trend over last 30 days
    const moodData = useMemo(() => {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const moodMap: Record<Mood, number> = {
            good: 3,
            neutral: 2,
            bad: 1,
        };

        return logs
            .filter((log) => {
                const logDate = new Date(log.date + "T00:00:00");
                return logDate >= last30Days;
            })
            .map((log) => ({
                date: new Date(log.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                mood: log.mood ? moodMap[log.mood] : null,
                moodLabel: log.mood || "none",
            }))
            .filter((item) => item.mood !== null)
            .reverse();
    }, [logs]);

    // Calculate symptom frequency
    const symptomData = useMemo(() => {
        const symptomCounts: Record<string, number> = {};

        logs.forEach((log) => {
            if (log.symptoms) {
                log.symptoms.forEach((symptom) => {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                });
            }
        });

        return Object.entries(symptomCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([symptom, count]) => ({
                symptom: symptom.replace(/([A-Z])/g, " $1").trim(),
                count,
            }));
    }, [logs]);

    const moodFormatter = (value: any) => {
        if (value === 3) return "Good";
        if (value === 2) return "Neutral";
        if (value === 1) return "Bad";
        return "—";
    };

    if (logs.length === 0) {
        return (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center">
                <p className="text-sm text-zinc-500">
                    Not enough data yet. Start logging to see insights!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-zinc-900">📊 Insights</h2>

            {/* Mood Trend Chart */}
            {moodData.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                        Mood (30d)
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                stroke="#71717a"
                            />
                            <YAxis
                                domain={[0, 3]}
                                ticks={[1, 2, 3]}
                                tick={{ fontSize: 10 }}
                                stroke="#71717a"
                                tickFormatter={moodFormatter}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    padding: "6px",
                                }}
                                labelFormatter={(label) => `${label}`}
                                formatter={(value: any) => [moodFormatter(value), "Mood"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="mood"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                dot={{ fill: "#f43f5e", r: 3 }}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Symptom Frequency Chart */}
            {symptomData.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                        Top 5 Symptoms
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={symptomData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="symptom"
                                tick={{ fontSize: 10 }}
                                stroke="#71717a"
                                angle={-15}
                                textAnchor="end"
                                height={40}
                            />
                            <YAxis tick={{ fontSize: 10 }} stroke="#71717a" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    padding: "6px",
                                }}
                            />
                            <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
