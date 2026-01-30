import type { Cycle, PeriodLog, Symptom, Mood, BleedingIntensity } from "../types/feed";

import { getSupabaseClient } from "./supabase";

const defaultCycle: Cycle = {
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: null,
};

export const getCycleProfile = async (userId?: string): Promise<Cycle> => {
    if (!userId) {
        return defaultCycle;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("cycles")
        .select("cycle_length, period_length, lastperiodstart")
        .eq("user_id", userId)
        .maybeSingle();

    if (error || !data) {
        return defaultCycle;
    }

    return {
        cycleLength: data.cycle_length ?? defaultCycle.cycleLength,
        periodLength: data.period_length ?? defaultCycle.periodLength,
        lastPeriodStart: (data.lastperiodstart as string) ?? null,
    };
};

export const updateCycleProfile = async (
    userId: string,
    cycle: Cycle
): Promise<{ error: string | null }> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("cycles").upsert({
        user_id: userId,
        cycle_length: cycle.cycleLength,
        period_length: cycle.periodLength,
        lastperiodstart: cycle.lastPeriodStart,
    });

    return { error: error?.message ?? null };
};

export const getPeriodLogs = async (userId: string): Promise<PeriodLog[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("period_logs")
        .select(
            "id, user_id, start_date, end_date, symptoms, bleeding_intensity, mood, notes, created_at"
        )
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

    if (error || !data) {
        return [];
    }

    // Legacy function: map old schema to new schema for backwards compat
    return data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        date: row.start_date, // Map startDate to date
        symptoms: (row.symptoms as PeriodLog["symptoms"]) ?? null,
        bleedingIntensity:
            (row.bleeding_intensity as PeriodLog["bleedingIntensity"]) ?? null,
        mood: (row.mood as PeriodLog["mood"]) ?? null,
        notes: row.notes ?? null,
        createdAt: row.created_at ?? null,
    }));
};

export const addPeriodLog = async (
    userId: string,
    log: Omit<PeriodLog, "id" | "userId" | "createdAt">
): Promise<{ error: string | null }> => {
    // Legacy function: map new schema to old for backwards compat
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("period_logs").insert({
        user_id: userId,
        date: log.date,
        symptoms: log.symptoms ?? null,
        bleeding: log.bleedingIntensity ?? null,
        mood: log.mood ?? null,
        notes: log.notes ?? null,
    });

    return { error: error?.message ?? null };
};

// NEW: Save or update today's daily log (upserts by user_id + date)
export const saveDailyLog = async (
    userId: string,
    date: string,
    logData: {
        mood?: Mood;
        bleeding?: BleedingIntensity;
        symptoms?: string[];
        notes?: string;
        waterIntake?: number;
    }
): Promise<{ error: string | null }> => {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from("period_logs")
        .upsert(
            {
                user_id: userId,
                date: date,
                mood: logData.mood ?? null,
                bleeding: logData.bleeding ?? null,
                symptoms: logData.symptoms ?? [],
                notes: logData.notes ?? null,
                water_intake: logData.waterIntake ?? null,
            },
            { onConflict: "user_id,date" }
        )
        .select("id");

    if (error) {
        console.error("Error saving daily log:", error);
    }

    return { error: error?.message ?? null };
};

// Get all daily logs for a user
export const getDailyLogs = async (userId?: string): Promise<PeriodLog[]> => {
    if (!userId) {
        return [];
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("period_logs")
        .select("id, user_id, date, mood, bleeding, symptoms, notes, water_intake, created_at")
        .eq("user_id", userId)
        .order("date", { ascending: false });

    if (error || !data) {
        console.error("Error fetching daily logs:", error);
        return [];
    }

    return data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        symptoms: (row.symptoms as Symptom[]) ?? [],
        bleedingIntensity: (row.bleeding as BleedingIntensity) ?? null,
        mood: (row.mood as Mood) ?? null,
        waterIntake: (row.water_intake as number | null) ?? null,
        notes: row.notes ?? null,
        createdAt: row.created_at ?? null,
    }));
};

export const updatePeriodLog = async (
    id: string,
    log: Partial<Omit<PeriodLog, "id" | "userId" | "createdAt">>
): Promise<{ error: string | null }> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from("period_logs")
        .update({
            date: log.date,
            symptoms: log.symptoms,
            bleeding: log.bleedingIntensity,
            mood: log.mood,
            notes: log.notes,
        })
        .eq("id", id);

    return { error: error?.message ?? null };
};

// NEW: Delete a daily log by ID
export const deleteLogById = async (logId: string): Promise<{ error: string | null }> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from("period_logs")
        .delete()
        .eq("id", logId);

    if (error) {
        console.error("Error deleting log:", error);
    }

    return { error: error?.message ?? null };
};
