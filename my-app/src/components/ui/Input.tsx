import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	error?: string | null;
};

const classNames = (...classes: Array<string | undefined>) =>
	classes.filter(Boolean).join(" ");

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className, id, ...props }, ref) => {
		const inputId = id ?? props.name;

		return (
			<div className="flex w-full flex-col gap-2">
				{label ? (
					<label
						htmlFor={inputId}
						className="text-sm font-medium text-zinc-700"
					>
						{label}
					</label>
				) : null}
				<input
					ref={ref}
					id={inputId}
					className={classNames(
						"h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
						error ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "",
						className
					)}
					{...props}
				/>
				{error ? <p className="text-xs text-red-500">{error}</p> : null}
			</div>
		);
	}
);

Input.displayName = "Input";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
	label?: string;
	error?: string | null;
	options: Array<{ label: string; value: string | number }>;
};

export const Select = ({
	label,
	error,
	className,
	id,
	options,
	...props
}: SelectProps) => {
	const selectId = id ?? props.name;

	return (
		<div className="flex w-full flex-col gap-2">
			{label ? (
				<label
					htmlFor={selectId}
					className="text-sm font-medium text-zinc-700"
				>
					{label}
				</label>
			) : null}
			<select
				id={selectId}
				className={classNames(
					"h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
					error ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "",
					className
				)}
				{...props}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error ? <p className="text-xs text-red-500">{error}</p> : null}
		</div>
	);
};
