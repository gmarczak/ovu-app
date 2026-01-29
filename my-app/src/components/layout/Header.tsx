import type { ReactNode } from "react";

type HeaderProps = {
	title: string;
	subtitle?: string;
	action?: ReactNode;
};

export const Header = ({ title, subtitle, action }: HeaderProps) => {
	return (
		<header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex w-full max-w-lg items-center justify-between px-6 py-4">
				<div className="flex flex-col">
					<h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
					{subtitle ? (
						<p className="text-xs text-zinc-500">{subtitle}</p>
					) : null}
				</div>
				{action ? <div>{action}</div> : null}
			</div>
		</header>
	);
};
