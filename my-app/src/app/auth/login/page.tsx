"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { signInWithEmail } from "../../../lib/auth";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsLoading(true);

		const result = await signInWithEmail(email, password);
		setIsLoading(false);

		if (result.error) {
			setError(result.error);
			return;
		}

		router.push("/app/feed");
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
			<div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
					<p className="mt-2 text-sm text-zinc-500">
						Log in to keep tracking your cycle.
					</p>
				</div>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<Input
						label="Email"
						type="email"
						name="email"
						placeholder="you@example.com"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
					<Input
						label="Password"
						type="password"
						name="password"
						placeholder="••••••••"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
					{error ? <p className="text-sm text-rose-600">{error}</p> : null}
					<Button type="submit" isLoading={isLoading}>
						Log in
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-zinc-600">
					New here?{" "}
					<Link className="font-medium text-zinc-900" href="/auth/register">
						Create an account
					</Link>
				</p>
			</div>
		</div>
	);
}
