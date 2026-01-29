import type { Cycle, PeriodLog } from "../types/feed";

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
		.select("cycle_length, period_length, last_period_start")
		.eq("user_id", userId)
		.maybeSingle();

	if (error || !data) {
		return defaultCycle;
	}

	return {
		cycleLength: data.cycle_length ?? defaultCycle.cycleLength,
		periodLength: data.period_length ?? defaultCycle.periodLength,
		lastPeriodStart: data.last_period_start ?? null,
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
		last_period_start: cycle.lastPeriodStart,
	});

	return { error: error?.message ?? null };
};

export const getPeriodLogs = async (userId?: string): Promise<PeriodLog[]> => {
	if (!userId) {
		return [];
	}

	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from("period_logs")
		.select("id, user_id, start_date, end_date, symptoms, notes, created_at")
		.eq("user_id", userId)
		.order("start_date", { ascending: false });

	if (error || !data) {
		return [];
	}

	return data.map((row) => ({
		id: row.id,
		userId: row.user_id,
		startDate: row.start_date,
		endDate: row.end_date ?? null,
		symptoms: (row.symptoms as PeriodLog["symptoms"]) ?? null,
		notes: row.notes ?? null,
		createdAt: row.created_at ?? null,
	}));
};

export const addPeriodLog = async (
	userId: string,
	log: Omit<PeriodLog, "id" | "userId" | "createdAt">
): Promise<{ error: string | null }> => {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from("period_logs").insert({
		user_id: userId,
		start_date: log.startDate,
		end_date: log.endDate,
		symptoms: log.symptoms ?? null,
		notes: log.notes ?? null,
	});

	return { error: error?.message ?? null };
};
