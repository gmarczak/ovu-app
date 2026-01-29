"use client";

import { useEffect, useState } from "react";

import type { User } from "../types/user";
import { getSupabaseClient } from "../lib/supabase";
import { mapSupabaseUser } from "../lib/auth";

type UseAuthState = {
	user: User | null;
	loading: boolean;
	error: string | null;
};

export const useAuth = (): UseAuthState => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const supabase = getSupabaseClient();
		let isMounted = true;

		const loadUser = async () => {
			const { data, error: fetchError } = await supabase.auth.getUser();
			if (!isMounted) {
				return;
			}
			setUser(mapSupabaseUser(data.user));
			setError(fetchError?.message ?? null);
			setLoading(false);
		};

		loadUser();

		const { data: subscription } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (!isMounted) {
					return;
				}
				setUser(mapSupabaseUser(session?.user ?? null));
				setLoading(false);
			}
		);

		return () => {
			isMounted = false;
			subscription.subscription.unsubscribe();
		};
	}, []);

	return { user, loading, error };
};
