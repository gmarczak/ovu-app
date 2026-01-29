"use client";

import { useCallback, useMemo, useState } from "react";

import type { Cycle, CyclePhase, PeriodLog, Symptom } from "../types/feed";

const defaultCycle: Cycle = {
	cycleLength: 28,
	periodLength: 5,
	lastPeriodStart: null,
};

const getCyclePhase = (
	cycleDay: number,
	cycleLength: number,
	periodLength: number
): CyclePhase => {
	if (cycleDay <= periodLength) {
		return "menstrual";
	}
	const ovulationDay = Math.max(12, Math.floor(cycleLength / 2));
	if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
		return "ovulation";
	}
	if (cycleDay < ovulationDay) {
		return "follicular";
	}
	return "luteal";
};

const toDate = (value: string | null) => (value ? new Date(value) : null);

const daysBetween = (start: Date, end: Date) => {
	const startDate = new Date(start);
	const endDate = new Date(end);
	const ms =
		endDate.setHours(0, 0, 0, 0) - startDate.setHours(0, 0, 0, 0);
	return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const useCycle = (cycle: Cycle = defaultCycle) => {
	const today = new Date();
	const lastPeriod = toDate(cycle.lastPeriodStart);
	const cycleDay = lastPeriod ? daysBetween(lastPeriod, new Date(today)) + 1 : 1;
	const normalizedDay = ((cycleDay - 1) % cycle.cycleLength) + 1;
	const daysUntilNextPeriod =
		cycle.cycleLength - normalizedDay + 1 > 0
			? cycle.cycleLength - normalizedDay + 1
			: cycle.cycleLength;
	const phase = getCyclePhase(
		normalizedDay,
		cycle.cycleLength,
		cycle.periodLength
	);

	const nextPeriodStart = useMemo(() => {
		if (!lastPeriod) {
			return null;
		}
		const next = new Date(lastPeriod);
		next.setDate(next.getDate() + cycle.cycleLength);
		return next;
	}, [cycle.cycleLength, lastPeriod]);

	const fertileWindow = useMemo(() => {
		if (!lastPeriod) {
			return null;
		}
		const ovulation = new Date(lastPeriod);
		ovulation.setDate(ovulation.getDate() + Math.floor(cycle.cycleLength / 2));
		const start = new Date(ovulation);
		start.setDate(start.getDate() - 3);
		const end = new Date(ovulation);
		end.setDate(end.getDate() + 1);
		return { start, end };
	}, [cycle.cycleLength, lastPeriod]);

	return {
		cycleDay: normalizedDay,
		phase,
		daysUntilNextPeriod,
		nextPeriodStart,
		fertileWindow,
	};
};

type PeriodLogState = {
	logs: PeriodLog[];
	addLog: (log: Omit<PeriodLog, "id" | "createdAt">) => void;
	updateLog: (id: string, log: Partial<PeriodLog>) => void;
};

export const usePeriodLog = (initialLogs: PeriodLog[] = []): PeriodLogState => {
	const [logs, setLogs] = useState<PeriodLog[]>(initialLogs);

	const addLog = useCallback(
		(log: Omit<PeriodLog, "id" | "createdAt">) => {
			const newLog: PeriodLog = {
				...log,
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
			};
			setLogs((prev) => [newLog, ...prev]);
		},
		[]
	);

	const updateLog = useCallback((id: string, log: Partial<PeriodLog>) => {
		setLogs((prev) =>
			prev.map((entry) => (entry.id === id ? { ...entry, ...log } : entry))
		);
	}, []);

	return { logs, addLog, updateLog };
};

export const symptomLabels: Record<Symptom, string> = {
	cramps: "Cramps",
	headache: "Headache",
	mood: "Mood swings",
	energy: "Low energy",
	bloating: "Bloating",
	sleep: "Sleep issues",
};
