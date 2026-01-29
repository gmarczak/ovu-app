"use client";

import { useEffect } from "react";

import { Button } from "./Button";

type ModalProps = {
	open: boolean;
	title?: string;
	description?: string;
	onClose: () => void;
	actionLabel?: string;
	onAction?: () => void;
	children?: React.ReactNode;
};

export const Modal = ({
	open,
	title,
	description,
	onClose,
	actionLabel,
	onAction,
	children,
}: ModalProps) => {
	useEffect(() => {
		if (!open) {
			return;
		}
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
			<div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
				<div className="flex flex-col gap-2">
					{title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
					{description ? (
						<p className="text-sm text-zinc-600">{description}</p>
					) : null}
				</div>
				{children ? <div className="mt-4">{children}</div> : null}
				<div className="mt-6 flex justify-end gap-2">
					<Button variant="ghost" onClick={onClose}>
						Close
					</Button>
					{actionLabel && onAction ? (
						<Button onClick={onAction}>{actionLabel}</Button>
					) : null}
				</div>
			</div>
		</div>
	);
};
