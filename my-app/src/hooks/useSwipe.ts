"use client";

import { useCallback, useMemo, useState } from "react";
import type { Cycle, CyclePhase, PeriodLog, Symptom } from "../types/feed";
import {
    DEFAULT_CYCLE_LENGTH,
    DEFAULT_PERIOD_LENGTH,
    daysBetween,
    toDate,
    getCyclePhaseKey,
    calculateCycleData,
    analyzeCycles,
} from "../lib/predictions";

const defaultCycle: Cycle = {
    cycleLength: DEFAULT_CYCLE_LENGTH,
    periodLength: DEFAULT_PERIOD_LENGTH,
    lastPeriodStart: null,
};

export const useCycle = (cycle: Cycle = defaultCycle, logs: PeriodLog[] = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Analyze historical logs to get averages
    const { avgCycleLength, avgPeriodLength } = analyzeCycles(logs);

    const lastPeriod = toDate(cycle.lastPeriodStart);

    // Calculate cycle day based on last period start
    const cycleDay = lastPeriod ? daysBetween(lastPeriod, today) + 1 : 1;
    const normalizedDay = ((cycleDay - 1) % (cycle.cycleLength || avgCycleLength)) + 1;

    const daysUntilNextPeriod =
        (cycle.cycleLength || avgCycleLength) - normalizedDay + 1 > 0
            ? (cycle.cycleLength || avgCycleLength) - normalizedDay + 1
            : cycle.cycleLength || avgCycleLength;

    // Get cycle phase
    const phase = getCyclePhaseKey(
        today,
        lastPeriod,
        cycle.cycleLength || avgCycleLength,
        cycle.periodLength || avgPeriodLength
    );

    // Calculate prediction data
    const cycleData = useMemo(() => {
        return calculateCycleData(
            cycle.lastPeriodStart,
            cycle.cycleLength || avgCycleLength,
            cycle.periodLength || avgPeriodLength
        );
    }, [cycle.lastPeriodStart, cycle.cycleLength, cycle.periodLength, avgCycleLength, avgPeriodLength]);

    const nextPeriodStart = cycleData.nextPeriodStart;
    const predictedOvulation = cycleData.predictedOvulation;

    const fertileWindow = useMemo(() => {
        if (!cycleData.fertileWindowStart || !cycleData.fertileWindowEnd) {
            return null;
        }
        return {
            start: cycleData.fertileWindowStart,
            end: cycleData.fertileWindowEnd,
        };
    }, [cycleData.fertileWindowStart, cycleData.fertileWindowEnd]);

    return {
        cycleDay: normalizedDay,
        phase,
        daysUntilNextPeriod,
        nextPeriodStart,
        predictedOvulation,
        fertileWindow,
        avgCycleLength,
        avgPeriodLength,
        isNewUser: cycleData.isNewUser,
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
    backPain: "Back Pain",
    headache: "Headache",
    bloating: "Bloating",
    breastTenderness: "Breast Tenderness",
    fatigue: "Fatigue",
    irritability: "Irritability",
    lowFocus: "Low Focus",
};
