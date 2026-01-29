import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
};

const baseClasses =
	"inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
	primary: "bg-zinc-900 text-white hover:bg-zinc-800",
	secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
	ghost: "bg-transparent text-zinc-900 hover:bg-zinc-100",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "h-9 px-4 text-sm",
	md: "h-11 px-5 text-sm",
	lg: "h-12 px-6 text-base",
};

const classNames = (...classes: Array<string | undefined>) =>
	classes.filter(Boolean).join(" ");

export const Button = ({
	variant = "primary",
	size = "md",
	isLoading,
	leftIcon,
	rightIcon,
	className,
	children,
	disabled,
	...props
}: ButtonProps) => {
	return (
		<button
			className={classNames(
				baseClasses,
				variantClasses[variant],
				sizeClasses[size],
				className
			)}
			disabled={disabled || isLoading}
			{...props}
		>
			{leftIcon ? <span className="text-lg">{leftIcon}</span> : null}
			{isLoading ? "Loading..." : children}
			{rightIcon ? <span className="text-lg">{rightIcon}</span> : null}
		</button>
	);
};
