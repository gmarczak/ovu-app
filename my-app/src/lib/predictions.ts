/**
 * PREDICTION ENGINE: Core biological cycle calculation logic
 * - Calculates averages from historical data
 * - Predicts next period, ovulation, and fertile window
 * - Handles new users with defaults
 */

import type { CyclePhase, PeriodLog } from "../types/feed";

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const DEFAULT_LUTEAL_PHASE = 14;

/**
 * Helper: Calculate days between two dates
 */
export const daysBetween = (start: Date, end: Date): number => {
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const ms = e.getTime() - s.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
};

/**
 * Helper: Parse date string to Date object
 */
export const toDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Helper: Format date as YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * Helper: Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Analyze historical logs to detect cycle patterns
 * Returns: { avgCycleLength, avgPeriodLength, cycleCount }
 */
export const analyzeCycles = (logs: PeriodLog[]) => {
    if (!logs || logs.length === 0) {
        return {
            avgCycleLength: DEFAULT_CYCLE_LENGTH,
            avgPeriodLength: DEFAULT_PERIOD_LENGTH,
            cycleCount: 0,
        };
    }

    // Filter logs with any bleeding intensity
    const bleedingLogs = logs
        .filter((log) => log.bleedingIntensity)
        .sort((a, b) => a.date!.localeCompare(b.date!));

    if (bleedingLogs.length < 2) {
        return {
            avgCycleLength: DEFAULT_CYCLE_LENGTH,
            avgPeriodLength: DEFAULT_PERIOD_LENGTH,
            cycleCount: 0,
        };
    }

    // Group consecutive bleeding days into period streaks
    const streaks: { start: Date; length: number }[] = [];
    let currentStart = toDate(bleedingLogs[0].date!);
    let currentLength = 1;

    for (let i = 1; i < bleedingLogs.length; i++) {
        const currentDate = toDate(bleedingLogs[i].date!);
        const prevDate = toDate(bleedingLogs[i - 1].date!);
        if (currentDate && prevDate && daysBetween(prevDate, currentDate) === 1) {
            currentLength += 1;
        } else if (currentStart) {
            streaks.push({ start: currentStart, length: currentLength });
            currentStart = currentDate;
            currentLength = 1;
        }
    }

    if (currentStart) {
        streaks.push({ start: currentStart, length: currentLength });
    }

    const recentStreaks = streaks.slice(-6);
    const periodLengths = recentStreaks.map((s) => s.length);
    const periodStarts = recentStreaks.map((s) => s.start);

    // Calculate cycle lengths between consecutive period starts
    const cycleLengths: number[] = [];
    for (let i = 1; i < periodStarts.length; i++) {
        const length = daysBetween(periodStarts[i - 1], periodStarts[i]);
        if (length >= 18 && length <= 45) {
            cycleLengths.push(length);
        }
    }

    const avgCycleLength =
        cycleLengths.length > 0
            ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
            : DEFAULT_CYCLE_LENGTH;

    const avgPeriodLength =
        periodLengths.length > 0
            ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
            : DEFAULT_PERIOD_LENGTH;

    return {
        avgCycleLength: Math.max(18, Math.min(45, avgCycleLength)),
        avgPeriodLength: Math.max(2, Math.min(8, avgPeriodLength)),
        cycleCount: cycleLengths.length,
    };
};

/**
 * CORE PREDICTION ENGINE
 * Calculates all key dates based on last period start
 */
export interface CycleData {
    cycleLength: number;
    periodLength: number;
    lastPeriodStart: Date | null;
    nextPeriodStart: Date | null;
    predictedOvulation: Date | null;
    fertileWindowStart: Date | null;
    fertileWindowEnd: Date | null;
    isNewUser: boolean;
}

export const calculateCycleData = (
    lastPeriodStartStr: string | null,
    avgCycleLength: number = DEFAULT_CYCLE_LENGTH,
    avgPeriodLength: number = DEFAULT_PERIOD_LENGTH
): CycleData => {
    const lastPeriodStart = toDate(lastPeriodStartStr);

    if (!lastPeriodStart) {
        return {
            cycleLength: avgCycleLength,
            periodLength: avgPeriodLength,
            lastPeriodStart: null,
            nextPeriodStart: null,
            predictedOvulation: null,
            fertileWindowStart: null,
            fertileWindowEnd: null,
            isNewUser: true,
        };
    }

    // Next period = last period + cycle length
    const nextPeriodStart = addDays(lastPeriodStart, avgCycleLength);

    // Ovulation typically occurs 14 days before next period
    const predictedOvulation = addDays(nextPeriodStart, -DEFAULT_LUTEAL_PHASE);

    // Fertile window: 5 days before ovulation to ovulation day
    const fertileWindowStart = addDays(predictedOvulation, -5);
    const fertileWindowEnd = predictedOvulation;

    return {
        cycleLength: avgCycleLength,
        periodLength: avgPeriodLength,
        lastPeriodStart,
        nextPeriodStart,
        predictedOvulation,
        fertileWindowStart,
        fertileWindowEnd,
        isNewUser: false,
    };
};

/**
 * Determine cycle phase for a given date
 */
export const getCyclePhaseKey = (
    targetDate: Date,
    lastPeriodStart: Date | null,
    cycleLength: number,
    periodLength: number
): CyclePhase => {
    if (!lastPeriodStart) {
        return "menstrual";
    }

    const daysSinceStart = daysBetween(lastPeriodStart, targetDate);
    const cycleDay = (daysSinceStart % cycleLength) + 1;

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

export type CyclePhaseLabel = "Menstrual" | "Follicular" | "Fertile" | "Luteal";

export const getCyclePhase = (
    targetDate: Date,
    lastPeriodStart: Date | null,
    cycleLength: number,
    periodLength: number
): CyclePhaseLabel => {
    if (!lastPeriodStart) {
        return "Menstrual";
    }

    const daysSinceStart = daysBetween(lastPeriodStart, targetDate);
    const cycleDay = (daysSinceStart % cycleLength) + 1;

    if (cycleDay <= periodLength) {
        return "Menstrual";
    }

    const ovulationDay = Math.max(12, Math.floor(cycleLength / 2));
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay;

    if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
        return "Fertile";
    }

    if (cycleDay < fertileStart) {
        return "Follicular";
    }

    return "Luteal";
};

/**
 * Get the cycle day for a target date
 */
export const getCycleDayForDate = (
    targetDate: Date,
    lastPeriodStart: Date | null,
    cycleLength: number
): number => {
    if (!lastPeriodStart) return 1;
    const daysSinceStart = daysBetween(lastPeriodStart, targetDate);
    return (daysSinceStart % cycleLength) + 1;
};

/**
 * Get period days for a given month
 */
export const getPeriodDaysForMonth = (
    month: number,
    year: number,
    lastPeriodStart: Date | null,
    periodLength: number,
    cycleLength: number
): number[] => {
    if (!lastPeriodStart) return [];

    const periodDays: number[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate period days
    for (let i = 0; i < periodLength; i++) {
        const periodDate = addDays(lastPeriodStart, i);
        if (periodDate.getMonth() === month && periodDate.getFullYear() === year) {
            periodDays.push(periodDate.getDate());
        }
    }

    // Handle next cycles
    let currentCycleStart = new Date(lastPeriodStart);
    for (let cycleNum = 1; cycleNum <= 10; cycleNum++) {
        const nextCycleStart = addDays(currentCycleStart, cycleLength);
        for (let i = 0; i < periodLength; i++) {
            const periodDate = addDays(nextCycleStart, i);
            if (periodDate <= today) {
                // Only include past/current dates
                if (periodDate.getMonth() === month && periodDate.getFullYear() === year) {
                    periodDays.push(periodDate.getDate());
                }
            }
        }
        currentCycleStart = nextCycleStart;
    }

    return [...new Set(periodDays)].sort((a, b) => a - b);
};

/**
 * Get predicted period days for a given month
 */
export const getPredictedPeriodDaysForMonth = (
    month: number,
    year: number,
    nextPeriodStart: Date | null,
    periodLength: number
): number[] => {
    if (!nextPeriodStart) return [];

    const predictedDays: number[] = [];

    // Generate predicted period days
    for (let i = 0; i < periodLength; i++) {
        const periodDate = addDays(nextPeriodStart, i);
        if (periodDate.getMonth() === month && periodDate.getFullYear() === year) {
            predictedDays.push(periodDate.getDate());
        }
    }

    return [...new Set(predictedDays)].sort((a, b) => a - b);
};

/**
 * Get fertile window days for a given month
 */
export const getFertileDaysForMonth = (
    month: number,
    year: number,
    fertileWindowStart: Date | null,
    fertileWindowEnd: Date | null
): number[] => {
    if (!fertileWindowStart || !fertileWindowEnd) return [];

    const fertileDays: number[] = [];

    const start = toDate(formatDate(fertileWindowStart));
    const end = toDate(formatDate(fertileWindowEnd));

    if (!start || !end) return [];

    let current = new Date(start);
    while (current <= end) {
        if (current.getMonth() === month && current.getFullYear() === year) {
            fertileDays.push(current.getDate());
        }
        current.setDate(current.getDate() + 1);
    }

    return [...new Set(fertileDays)].sort((a, b) => a - b);
};

/**
 * Get ovulation date for a given month (if exists)
 */
export const getOvulationDayForMonth = (
    month: number,
    year: number,
    predictedOvulation: Date | null
): number | null => {
    if (!predictedOvulation) return null;
    if (
        predictedOvulation.getMonth() === month &&
        predictedOvulation.getFullYear() === year
    ) {
        return predictedOvulation.getDate();
    }
    return null;
};
