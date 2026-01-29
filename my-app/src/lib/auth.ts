import type { User as SupabaseUser } from "@supabase/supabase-js";

import { getSupabaseClient } from "./supabase";
import type { User } from "../types/user";

export const mapSupabaseUser = (user: SupabaseUser | null): User | null => {
	if (!user) {
		return null;
	}

	return {
		id: user.id,
		email: user.email ?? "",
		name:
			typeof user.user_metadata?.name === "string"
				? user.user_metadata.name
				: null,
		avatarUrl:
			typeof user.user_metadata?.avatar_url === "string"
				? user.user_metadata.avatar_url
				: null,
		createdAt: user.created_at ?? null,
	};
};

type AuthResult = {
	user: User | null;
	error: string | null;
};

export const signInWithEmail = async (
	email: string,
	password: string
): Promise<AuthResult> => {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	return {
		user: mapSupabaseUser(data.user),
		error: error?.message ?? null,
	};
};

export const signUpWithEmail = async (
	email: string,
	password: string
): Promise<AuthResult> => {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	return {
		user: mapSupabaseUser(data.user),
		error: error?.message ?? null,
	};
};

export const signOut = async (): Promise<{ error: string | null }> => {
	const supabase = getSupabaseClient();
	const { error } = await supabase.auth.signOut();
	return { error: error?.message ?? null };
};

export const getCurrentUser = async (): Promise<AuthResult> => {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.auth.getUser();
	return {
		user: mapSupabaseUser(data.user),
		error: error?.message ?? null,
	};
};
